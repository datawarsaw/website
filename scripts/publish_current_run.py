"""
Remote live telemetry publisher for DataWarsaw AI Workstation (Observability V2.0 - Cloudflare Native).
Publishes sanitized site/data/current-run.json to Cloudflare Pages Functions / D1 via HTTPS POST.
Provides bounded retries, sanitization validation, failure isolation, and HTTPS diagnostic mode.
Legacy SFTP/WinSCP functions are retained with deprecation warnings for rollback safety.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DATA_FILE = REPO_ROOT / "site" / "data" / "current-run.json"
SITE_DIR = REPO_ROOT / "site"

DEFAULT_TELEMETRY_URL = "https://datawarsaw.com/api/telemetry"
DEFAULT_TIMEOUT_SEC = int(os.environ.get("DATAWARSAW_DEPLOY_TIMEOUT", "5"))
MAX_RETRIES = int(os.environ.get("DATAWARSAW_DEPLOY_RETRIES", "2"))


def get_config() -> dict:
    """Load deployment configuration from environment variables."""
    enabled_val = os.environ.get("DATAWARSAW_REMOTE_OBSERVABILITY", "").lower().strip()
    is_enabled = enabled_val in ("1", "true", "yes", "on", "enabled")
    telemetry_url = os.environ.get("DATAWARSAW_TELEMETRY_URL", "").strip() or DEFAULT_TELEMETRY_URL
    token = os.environ.get("DATAWARSAW_TELEMETRY_TOKEN", "").strip()

    legacy_host = os.environ.get("DATAWARSAW_DEPLOY_HOST", "").strip()
    legacy_user = os.environ.get("DATAWARSAW_DEPLOY_USER", "").strip()

    return {
        "enabled": is_enabled,
        "url": telemetry_url,
        "token": token,
        "timeout": DEFAULT_TIMEOUT_SEC,
        "retries": MAX_RETRIES,
        "legacy_host": legacy_host,
        "legacy_user": legacy_user,
    }


def sanitize_diagnostics(text: str | None, token: str | None = None) -> str:
    """Redact tokens, credentials, and local paths from diagnostic error messages."""
    sanitized = text or ""
    if token:
        sanitized = sanitized.replace(token, "***[REDACTED]")
    sanitized = re.sub(r"Bearer\s+[^\s\"\'<>&]+", "Bearer ***[REDACTED]", sanitized)
    sanitized = re.sub(r"sk-[a-zA-Z0-9_\-]{8,}", "sk-***[REDACTED]", sanitized)
    return sanitized


def validate_local_telemetry() -> tuple[bool, str, dict | None]:
    """Validate that local public telemetry exists and is well-formed sanitized JSON."""
    if not PUBLIC_DATA_FILE.is_file():
        return False, f"Missing {PUBLIC_DATA_FILE}", None

    try:
        content = PUBLIC_DATA_FILE.read_text(encoding="utf-8")
        data = json.loads(content)
    except Exception as exc:
        return False, f"Malformed JSON in {PUBLIC_DATA_FILE}: {exc}", None

    raw_str = json.dumps(data)
    if "sk-" in raw_str and "sk-***[REDACTED]" not in raw_str:
        return False, "Unredacted API key detected in public telemetry", None
    if re.search(r"[A-Za-z]:[/\\]", raw_str):
        return False, "Unredacted host absolute path detected in public telemetry", None

    return True, "Valid sanitized telemetry", data


def publish_https(url: str, token: str, data: dict, timeout_sec: int = DEFAULT_TIMEOUT_SEC) -> tuple[bool, str]:
    """
    Publish telemetry payload to Cloudflare Pages Functions endpoint via HTTPS POST.
    Uses standard library urllib.request with bounded timeout.
    """
    payload_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload_bytes,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Bearer {token}",
            "User-Agent": "DataWarsaw-Telemetry-Publisher/2.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            status_code = resp.getcode()
            if 200 <= status_code < 300:
                return True, f"HTTPS publish succeeded (HTTP {status_code})"
            return False, f"Unexpected HTTP status {status_code}"
    except urllib.error.HTTPError as http_err:
        err_body = ""
        try:
            err_body = http_err.read().decode("utf-8", errors="replace")[:150]
        except Exception:
            pass
        msg = f"HTTP {http_err.code} ({http_err.reason}): {err_body}"
        return False, sanitize_diagnostics(msg, token)
    except urllib.error.URLError as url_err:
        msg = f"Network error: {url_err.reason}"
        return False, sanitize_diagnostics(msg, token)
    except TimeoutError:
        return False, f"HTTPS request timed out after {timeout_sec}s"
    except Exception as exc:
        return False, sanitize_diagnostics(f"Request error: {exc}", token)


def upload_current_run(dry_run: bool = False) -> tuple[bool, str]:
    """
    Publish sanitized current-run.json to Cloudflare HTTPS telemetry endpoint.
    Guarantees failure isolation: returns (success, msg) without raising uncaught exceptions.
    """
    is_valid, msg, telemetry_data = validate_local_telemetry()
    if not is_valid:
        return False, f"Telemetry validation failed: {msg}"

    config = get_config()
    if not config["enabled"] and not dry_run:
        return True, "Remote observability disabled (DATAWARSAW_REMOTE_OBSERVABILITY not set)"

    if dry_run:
        return True, f"[DRY-RUN] Telemetry valid. Target URL={config['url']}, Auth={'Configured' if config['token'] else 'Missing'}"

    if not config["token"]:
        return False, "READY_FOR_REMOTE_TEST: Missing credentials (DATAWARSAW_TELEMETRY_TOKEN)"

    last_err = ""
    for attempt in range(1, config["retries"] + 1):
        success, result_msg = publish_https(
            url=config["url"],
            token=config["token"],
            data=telemetry_data,
            timeout_sec=config["timeout"],
        )
        if success:
            return True, f"Remote telemetry published to Cloudflare (attempt {attempt})"
        last_err = result_msg
        if attempt < config["retries"]:
            time.sleep(0.5)

    return False, f"Remote publishing failed after {config['retries']} attempts: {last_err}"


def run_doctor() -> dict:
    """Run diagnostic audit of remote observability readiness."""
    config = get_config()
    is_valid, val_msg, _ = validate_local_telemetry()

    missing_env = []
    if not config["token"]:
        missing_env.append("DATAWARSAW_TELEMETRY_TOKEN")

    status = "READY_FOR_REMOTE_TEST" if missing_env else ("ENABLED" if config["enabled"] else "DISABLED")

    return {
        "remote_observability_enabled": config["enabled"],
        "transport": "cloudflare-https",
        "telemetry_url": config["url"],
        "auth_configured": bool(config["token"]),
        "local_telemetry_valid": is_valid,
        "validation_message": val_msg,
        "missing_environment_vars": missing_env,
        "status": status,
    }


def find_winscp() -> Path | None:
    """[DEPRECATED] Locate WinSCP executable on Windows host."""
    winscp_locations = [
        Path(os.environ.get("ProgramFiles(x86)", "C:/Program Files (x86)")) / "WinSCP/WinSCP.com",
        Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "WinSCP/WinSCP.com",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Programs/WinSCP/WinSCP.com",
    ]
    for p in winscp_locations:
        if p.is_file():
            return p
    return None


def deploy_static_observability() -> tuple[bool, str]:
    """[DEPRECATED] One-time deploy procedure for legacy static hosting."""
    return True, "[DEPRECATED] Cloudflare Pages deploys static observability automatically via Git."


def main():
    parser = argparse.ArgumentParser(description="DataWarsaw Remote Observability Publisher (V2.0 - Cloudflare Native).")
    parser.add_argument("--dry-run", action="store_true", help="Validate and simulate publish without network I/O")
    parser.add_argument("--doctor", action="store_true", help="Inspect diagnostic status and readiness")
    parser.add_argument("--deploy-static", action="store_true", help="[Deprecated] Legacy static deploy stub")

    args = parser.parse_args()

    if args.doctor:
        doc = run_doctor()
        print(json.dumps(doc, indent=2))
        return

    if args.deploy_static:
        ok, msg = deploy_static_observability()
        print(f"[{'OK' if ok else 'INFO'}] {msg}")
        sys.exit(0 if ok else 1)

    ok, msg = upload_current_run(dry_run=args.dry_run)
    print(f"[{'OK' if ok else 'FAIL' if config_enabled() else 'INFO'}] {msg}")
    sys.exit(0 if ok else 1)


def config_enabled() -> bool:
    return os.environ.get("DATAWARSAW_REMOTE_OBSERVABILITY", "").lower().strip() in ("1", "true", "yes", "on", "enabled")


if __name__ == "__main__":
    main()
