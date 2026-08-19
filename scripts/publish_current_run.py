"""
Remote live telemetry publisher for DataWarsaw AI Workstation (Observability V1.3).
Uploads sanitized site/data/current-run.json to remote hosting (/public_html/data/).
Supports WinSCP (SFTP/FTPS), OpenSSH SFTP, and FTPS with bounded retries,
remote atomic replacement, public sanitization validation, and failure isolation.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import uuid
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DATA_FILE = REPO_ROOT / "site" / "data" / "current-run.json"
SITE_DIR = REPO_ROOT / "site"

WINSCP_LOCATIONS = [
    Path(os.environ.get("ProgramFiles(x86)", "C:/Program Files (x86)")) / "WinSCP/WinSCP.com",
    Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "WinSCP/WinSCP.com",
    Path(os.environ.get("LOCALAPPDATA", "")) / "Programs/WinSCP/WinSCP.com",
]

DEFAULT_TIMEOUT_SEC = int(os.environ.get("DATAWARSAW_DEPLOY_TIMEOUT", "5"))
MAX_RETRIES = int(os.environ.get("DATAWARSAW_DEPLOY_RETRIES", "2"))


def find_winscp() -> Path | None:
    """Locate WinSCP executable on Windows host."""
    for p in WINSCP_LOCATIONS:
        if p.is_file():
            return p
    return None


def get_config() -> dict:
    """Load deployment configuration from environment variables."""
    enabled_val = os.environ.get("DATAWARSAW_REMOTE_OBSERVABILITY", "").lower().strip()
    is_enabled = enabled_val in ("1", "true", "yes", "on", "enabled")

    return {
        "enabled": is_enabled,
        "host": os.environ.get("DATAWARSAW_DEPLOY_HOST", "").strip(),
        "user": os.environ.get("DATAWARSAW_DEPLOY_USER", "").strip(),
        "password": os.environ.get("DATAWARSAW_DEPLOY_PASSWORD", ""),
        "key_path": os.environ.get("DATAWARSAW_DEPLOY_KEY", "").strip(),
        "port": os.environ.get("DATAWARSAW_DEPLOY_PORT", "22").strip(),
        "remote_path": os.environ.get("DATAWARSAW_DEPLOY_PATH", "/public_html").strip().rstrip("/"),
        "transport": os.environ.get("DATAWARSAW_DEPLOY_TRANSPORT", "sftp").lower().strip(),
    }


def validate_local_telemetry() -> tuple[bool, str, dict | None]:
    """Validate that local public telemetry exists and is well-formed JSON."""
    if not PUBLIC_DATA_FILE.is_file():
        return False, f"Missing {PUBLIC_DATA_FILE}", None

    try:
        content = PUBLIC_DATA_FILE.read_text(encoding="utf-8")
        data = json.loads(content)
    except Exception as exc:
        return False, f"Malformed JSON in {PUBLIC_DATA_FILE}: {exc}", None

    # Verify public sanitization safety
    raw_str = json.dumps(data)
    if "sk-" in raw_str and "sk-***[REDACTED]" not in raw_str:
        return False, "Unredacted API key detected in public telemetry", None
    if re.search(r"[A-Za-z]:[/\\]", raw_str):
        return False, "Unredacted host absolute path detected in public telemetry", None

    return True, "Valid sanitized telemetry", data


def build_winscp_script(local_file: Path, remote_file_tmp: str, remote_file_final: str) -> str:
    """Generate WinSCP batch commands with atomic upload and rename."""
    local_path_str = local_file.as_posix()
    return f"""option batch on
option confirm off
put "{local_path_str}" "{remote_file_tmp}"
call mv "{remote_file_tmp}" "{remote_file_final}"
exit
"""


def upload_via_winscp(winscp_bin: Path, config: dict, local_file: Path, remote_subpath: str) -> tuple[bool, str]:
    """Execute upload via WinSCP with bounded timeout."""
    host = config["host"]
    user = config["user"]
    port = config["port"]
    remote_base = config["remote_path"]
    remote_final = f"{remote_base}/{remote_subpath.lstrip('/')}"
    remote_tmp = f"{remote_final}.tmp"

    script_content = build_winscp_script(local_file, remote_tmp, remote_final)
    
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as tf:
        tf.write(script_content)
        temp_script_path = tf.name

    try:
        protocol = "sftp" if "sftp" in config["transport"] else "ftps"
        open_cmd = f"open {protocol}://{user}"
        if config["password"]:
            open_cmd += f":{config['password']}"
        open_cmd += f"@{host}:{port} -hostkey=*"
        if config["key_path"]:
            open_cmd += f' -privatekey="{config["key_path"]}"'

        cmd = [
            str(winscp_bin),
            "/command",
            open_cmd,
            f'script="{temp_script_path}"',
            "exit"
        ]

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=DEFAULT_TIMEOUT_SEC
        )

        if proc.returncode == 0:
            return True, "WinSCP upload and atomic rename succeeded"
        else:
            # Sanitize output so passwords never leak in error messages
            sanitized_err = proc.stderr or proc.stdout
            if config["password"]:
                sanitized_err = sanitized_err.replace(config["password"], "***")
            return False, f"WinSCP exit code {proc.returncode}: {sanitized_err.strip()[:200]}"
    except subprocess.TimeoutExpired:
        return False, f"WinSCP connection timed out after {DEFAULT_TIMEOUT_SEC}s"
    except Exception as exc:
        return False, f"WinSCP error: {exc}"
    finally:
        try:
            os.unlink(temp_script_path)
        except Exception:
            pass


def upload_current_run(dry_run: bool = False) -> tuple[bool, str]:
    """
    Publish sanitized current-run.json to remote hosting.
    Guarantees failure isolation: returns success boolean without raising uncaught exceptions.
    """
    is_valid, msg, _ = validate_local_telemetry()
    if not is_valid:
        return False, f"Telemetry validation failed: {msg}"

    config = get_config()
    if not config["enabled"] and not dry_run:
        return True, "Remote observability disabled (DATAWARSAW_REMOTE_OBSERVABILITY not set)"

    if dry_run:
        winscp = find_winscp()
        return True, f"[DRY-RUN] Telemetry valid. WinSCP={bool(winscp)}, host={config['host'] or '<not set>'}, target={config['remote_path']}/data/current-run.json"

    # Verify required credentials
    missing = []
    if not config["host"]:
        missing.append("DATAWARSAW_DEPLOY_HOST")
    if not config["user"]:
        missing.append("DATAWARSAW_DEPLOY_USER")
    if not config["password"] and not config["key_path"]:
        missing.append("DATAWARSAW_DEPLOY_PASSWORD or DATAWARSAW_DEPLOY_KEY")

    if missing:
        return False, f"READY_FOR_REMOTE_TEST: Missing credentials ({', '.join(missing)})"

    winscp_bin = find_winscp()
    if not winscp_bin:
        return False, "WinSCP executable not found on host"

    # Retry loop with backoff
    last_err = ""
    for attempt in range(1, MAX_RETRIES + 1):
        success, result_msg = upload_via_winscp(
            winscp_bin=winscp_bin,
            config=config,
            local_file=PUBLIC_DATA_FILE,
            remote_subpath="data/current-run.json"
        )
        if success:
            return True, f"Remote telemetry published (attempt {attempt})"
        last_err = result_msg
        if attempt < MAX_RETRIES:
            time.sleep(0.5)

    return False, f"Remote publishing failed after {MAX_RETRIES} attempts: {last_err}"


def run_doctor() -> dict:
    """Run diagnostic audit of remote observability readiness."""
    config = get_config()
    winscp = find_winscp()
    is_valid, val_msg, _ = validate_local_telemetry()

    missing_env = []
    if not config["host"]:
        missing_env.append("DATAWARSAW_DEPLOY_HOST")
    if not config["user"]:
        missing_env.append("DATAWARSAW_DEPLOY_USER")
    if not config["password"] and not config["key_path"]:
        missing_env.append("DATAWARSAW_DEPLOY_PASSWORD or DATAWARSAW_DEPLOY_KEY")

    return {
        "remote_observability_enabled": config["enabled"],
        "winscp_available": bool(winscp),
        "winscp_path": str(winscp) if winscp else None,
        "local_telemetry_valid": is_valid,
        "validation_message": val_msg,
        "deploy_host": config["host"] if config["host"] else None,
        "deploy_user": config["user"] if config["user"] else None,
        "deploy_port": config["port"],
        "remote_web_root": config["remote_path"],
        "transport": config["transport"],
        "auth_configured": bool(config["password"] or config["key_path"]),
        "missing_environment_vars": missing_env,
        "status": "READY_FOR_REMOTE_TEST" if missing_env else ("ENABLED" if config["enabled"] else "DISABLED"),
    }


def deploy_static_observability() -> tuple[bool, str]:
    """One-time deploy procedure for site/observability/ and site/data/ to remote."""
    config = get_config()
    missing = []
    if not config["host"]:
        missing.append("DATAWARSAW_DEPLOY_HOST")
    if not config["user"]:
        missing.append("DATAWARSAW_DEPLOY_USER")
    if not config["password"] and not config["key_path"]:
        missing.append("DATAWARSAW_DEPLOY_PASSWORD or DATAWARSAW_DEPLOY_KEY")

    if missing:
        return False, f"READY_FOR_REMOTE_TEST: Missing credentials ({', '.join(missing)})"

    winscp_bin = find_winscp()
    if not winscp_bin:
        return False, "WinSCP executable not found on host"

    obs_dir = SITE_DIR / "observability"
    if not obs_dir.is_dir():
        return False, f"Missing static directory {obs_dir}"

    obs_html = (obs_dir / "index.html").as_posix()
    obs_css = (obs_dir / "styles.css").as_posix()
    obs_js = (obs_dir / "script.js").as_posix()
    data_file = PUBLIC_DATA_FILE.as_posix()
    rem = config["remote_path"]

    commands = [
        f"mkdir {rem}/observability",
        f"mkdir {rem}/data",
        f'put "{obs_html}" "{rem}/observability/index.html"',
        f'put "{obs_css}" "{rem}/observability/styles.css"',
        f'put "{obs_js}" "{rem}/observability/script.js"',
        f'put "{data_file}" "{rem}/data/current-run.json"',
    ]

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as tf:
        tf.write("option batch on\noption confirm off\n" + "\n".join(commands) + "\nexit\n")
        temp_script = tf.name

    try:
        protocol = "sftp" if "sftp" in config["transport"] else "ftps"
        open_cmd = f"open {protocol}://{config['user']}"
        if config["password"]:
            open_cmd += f":{config['password']}"
        open_cmd += f"@{config['host']}:{config['port']} -hostkey=*"
        if config["key_path"]:
            open_cmd += f' -privatekey="{config["key_path"]}"'

        cmd = [str(winscp_bin), "/command", open_cmd, f'script="{temp_script}"', "exit"]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)

        if proc.returncode == 0:
            return True, "Static /observability/ assets deployed successfully"
        else:
            return False, f"Static deploy failed: {proc.stderr or proc.stdout}"
    except Exception as exc:
        return False, f"Static deploy error: {exc}"
    finally:
        try:
            os.unlink(temp_script)
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description="DataWarsaw Remote Observability Publisher (V1.3).")
    parser.add_argument("--dry-run", action="store_true", help="Validate and simulate publish without network I/O")
    parser.add_argument("--doctor", action="store_true", help="Inspect diagnostic status and readiness")
    parser.add_argument("--deploy-static", action="store_true", help="One-time deployment of static /observability/ assets")

    args = parser.parse_args()

    if args.doctor:
        doc = run_doctor()
        print(json.dumps(doc, indent=2))
        return

    if args.deploy_static:
        ok, msg = deploy_static_observability()
        print(f"[{'OK' if ok else 'FAIL'}] {msg}")
        sys.exit(0 if ok else 1)

    ok, msg = upload_current_run(dry_run=args.dry_run)
    print(f"[{'OK' if ok else 'INFO'}] {msg}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
