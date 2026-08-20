"""
DataWarsaw Telemetry SDK / Adapter (Observability V1.2 & V1.3).

Provides an ergonomic Python API and context managers for the Agent Harness Coordinator,
Scouts, Workers, and Verification steps to publish automatic lifecycle telemetry to
state/current-run.json and sanitized site/data/current-run.json.
"""

import json
import os
import re
import subprocess
import sys
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
STATE_DIR = REPO_ROOT / "state"
INTERNAL_STATE_FILE = STATE_DIR / "current-run.json"
LOCK_FILE = STATE_DIR / "current-run.lock"
PUBLIC_DATA_FILE = REPO_ROOT / "site" / "data" / "current-run.json"

DEFAULT_BRANCH = "agent-harness-v1"
DEFAULT_HARNESS = "Antigravity V1.1"
TERMINAL_STEP_STATUSES = {"COMPLETE", "PASS", "FAILED", "BLOCKED"}
MAX_EVENTS = 200


# -----------------------------------------------------------------------------
# Cross-Platform Concurrency Locking
# -----------------------------------------------------------------------------
@contextmanager
def acquire_lock(timeout_sec: float = 5.0, poll_sec: float = 0.05):
    """
    Acquire an exclusive lock on state/current-run.lock.
    Guarantees atomic read-modify-write across concurrent subagent hooks.
    """
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    start_time = time.time()
    lock_fd = None

    while True:
        try:
            if sys.platform == "win32":
                import msvcrt
                lock_fd = os.open(str(LOCK_FILE), os.O_RDWR | os.O_CREAT | os.O_TRUNC)
                msvcrt.locking(lock_fd, msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                lock_fd = os.open(str(LOCK_FILE), os.O_RDWR | os.O_CREAT, 0o666)
                fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            break
        except (IOError, OSError, PermissionError):
            if lock_fd is not None:
                try:
                    os.close(lock_fd)
                except Exception:
                    pass
                lock_fd = None
            if time.time() - start_time >= timeout_sec:
                break
            time.sleep(poll_sec)

    try:
        yield
    finally:
        if lock_fd is not None:
            try:
                if sys.platform == "win32":
                    import msvcrt
                    msvcrt.locking(lock_fd, msvcrt.LK_UNLCK, 1)
                else:
                    import fcntl
                    fcntl.flock(lock_fd, fcntl.LOCK_UN)
                os.close(lock_fd)
            except Exception:
                pass


# -----------------------------------------------------------------------------
# Timestamp & Duration Helpers
# -----------------------------------------------------------------------------
def get_current_iso() -> str:
    """Return current local timestamp in ISO 8601 format with timezone."""
    return datetime.now(timezone.utc).astimezone().isoformat()


def get_current_time_str() -> str:
    """Return HH:MM:SS for concise event logs."""
    return datetime.now(timezone.utc).astimezone().strftime("%H:%M:%S")


def parse_iso(value: str | None):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def format_duration(started_at: str | None, ended_at: str | None = None) -> str | None:
    """Return compact human-readable duration from ISO timestamps."""
    start = parse_iso(started_at)
    end = parse_iso(ended_at) if ended_at else datetime.now(timezone.utc).astimezone()
    if not start or not end:
        return None

    total_seconds = max(0, int((end - start).total_seconds()))
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes}m {seconds}s"
    if minutes:
        return f"{minutes}m {seconds}s"
    return f"{seconds}s"


# -----------------------------------------------------------------------------
# Public Sanitization
# -----------------------------------------------------------------------------
def sanitize_public_state(data: dict) -> dict:
    """Remove internal fields, absolute paths, and likely secrets."""
    clean = json.loads(json.dumps(data))

    def clean_val(value):
        if isinstance(value, str):
            # Redact absolute paths (Windows and Unix)
            if ":/" in value or ":\\" in value:
                value = re.sub(r"[A-Za-z]:[/\\][^\s\"\'<>]+", lambda m: Path(m.group(0)).name, value)
            if "/Users/" in value or "/home/" in value:
                value = re.sub(r"/(?:Users|home)/[^\s\"\'<>]+", lambda m: Path(m.group(0)).name, value)
            # Redact API keys / tokens
            if "sk-" in value:
                value = re.sub(r"sk-[a-zA-Z0-9_\-]{8,}", "sk-***[REDACTED]", value)
            if "Bearer " in value:
                value = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.\+]{10,}", "Bearer ***[REDACTED]", value)
            if "gh" in value:
                value = re.sub(r"gh[pousr]_[A-Za-z0-9_]{10,}", "gh***[REDACTED]", value)
            return value
        if isinstance(value, dict):
            return {
                key: clean_val(item)
                for key, item in value.items()
                if not key.startswith("_")
            }
        if isinstance(value, list):
            return [clean_val(item) for item in value]
        return value

    return clean_val(clean)


# -----------------------------------------------------------------------------
# IO & Remote Sync
# -----------------------------------------------------------------------------
def atomic_write_json(file_path: Path, data: dict) -> None:
    """Write JSON data to a temporary file, flush/sync, then atomically rename."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = file_path.parent / f"{file_path.name}.tmp.{os.getpid()}.{uuid.uuid4().hex[:8]}"
    content = json.dumps(data, indent=2, ensure_ascii=False)
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())

        for attempt in range(10):
            try:
                os.replace(temp_path, file_path)
                break
            except (PermissionError, OSError):
                if attempt == 9:
                    file_path.write_text(content, encoding="utf-8")
                else:
                    time.sleep(0.025)
    finally:
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass


def try_publish_remote() -> None:
    """
    Publish live telemetry to remote hosting if DATAWARSAW_REMOTE_OBSERVABILITY is enabled.
    Failure isolation: Catches all errors so remote upload issues never fail the local task.
    """
    remote_flag = os.environ.get("DATAWARSAW_REMOTE_OBSERVABILITY", "").lower().strip()
    if remote_flag not in ("1", "true", "yes", "on", "enabled"):
        return

    try:
        publisher_script = REPO_ROOT / "scripts" / "publish_current_run.py"
        if publisher_script.is_file():
            res = subprocess.run(
                [sys.executable, str(publisher_script)],
                capture_output=True,
                text=True,
                timeout=10
            )
            if res.returncode == 0:
                print("[REMOTE] Telemetry synced to production hosting.")
            else:
                err_msg = res.stderr.strip() or res.stdout.strip()
                print(f"[WARN] Remote telemetry publish failed (isolated): {err_msg[:120]}")
    except subprocess.TimeoutExpired:
        print("[WARN] Remote telemetry publish timed out (isolated, 10s budget exceeded).")
    except Exception as exc:
        print(f"[WARN] Remote telemetry publish error (isolated): {exc}")


def idle_state(branch: str = DEFAULT_BRANCH, harness: str = DEFAULT_HARNESS) -> dict:
    now = get_current_iso()
    return {
        "taskId": "idle",
        "task": "No active run",
        "status": "IDLE",
        "startedAt": now,
        "updatedAt": now,
        "branch": branch,
        "harness": harness,
        "currentActivity": None,
        "steps": [],
        "events": [
            {
                "timestamp": get_current_time_str(),
                "type": "WORKSTATION_IDLE",
                "label": "Workstation is in standby mode.",
            }
        ],
    }


def load_state() -> dict:
    """Load existing state or return a clean IDLE state."""
    if INTERNAL_STATE_FILE.is_file():
        try:
            return json.loads(INTERNAL_STATE_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass
    return idle_state()


def save_state(data: dict) -> None:
    """Persist internal state and export a sanitized public copy."""
    data["updatedAt"] = get_current_iso()

    # Bound event history
    if "events" in data and isinstance(data["events"], list):
        if len(data["events"]) > MAX_EVENTS:
            data["events"] = data["events"][-MAX_EVENTS:]

    atomic_write_json(INTERNAL_STATE_FILE, data)
    public_data = sanitize_public_state(data)
    atomic_write_json(PUBLIC_DATA_FILE, public_data)
    try_publish_remote()


def default_steps(flow: str) -> list[dict]:
    """Return the canonical step skeleton for the selected route."""
    coordinator = {
        "id": "coordinator",
        "role": "Coordinator",
        "model": "Antigravity Orchestrator",
        "status": "PENDING",
    }
    worker = {
        "id": "worker",
        "role": "Worker",
        "model": "Runtime-selected Worker",
        "status": "PENDING",
    }
    verification = {
        "id": "verification",
        "role": "Verification",
        "model": "Deterministic QA",
        "status": "PENDING",
    }

    if flow == "simple":
        return [coordinator, worker, verification]
    if flow == "complex":
        return [
            coordinator,
            {
                "id": "join",
                "role": "JOIN",
                "model": "Antigravity Orchestrator",
                "status": "PENDING",
            },
            worker,
            verification,
        ]

    return [
        coordinator,
        {
            "id": "scout-a",
            "role": "Scout A",
            "model": "gemini-3.7-flash-high",
            "status": "PENDING",
        },
        {
            "id": "scout-b",
            "role": "Scout B",
            "model": "gemini-3.7-flash-high",
            "status": "PENDING",
        },
        {
            "id": "join",
            "role": "JOIN",
            "model": "Antigravity Orchestrator",
            "status": "PENDING",
        },
        worker,
        verification,
    ]


def append_event(state: dict, event_type: str, label: str) -> None:
    state.setdefault("events", []).append(
        {
            "timestamp": get_current_time_str(),
            "type": event_type,
            "label": label,
        }
    )


def get_or_create_step(
    state: dict,
    step_id: str,
    role: str | None = None,
    model: str | None = None,
) -> dict:
    steps = state.setdefault("steps", [])
    for step in steps:
        if step.get("id") == step_id:
            if role:
                step["role"] = role
            if model:
                step["model"] = model
            return step

    step = {
        "id": step_id,
        "role": role or step_id.replace("-", " ").title(),
        "model": model or "Runtime-selected model",
        "status": "PENDING",
    }

    if step_id.startswith("scout-"):
        join_index = next(
            (index for index, item in enumerate(steps) if item.get("id") == "join"),
            len(steps),
        )
        steps.insert(join_index, step)
    else:
        steps.append(step)
    return step


def step_event_prefix(step: dict) -> str:
    return re.sub(r"[^A-Z0-9]+", "_", step.get("id", "STEP").upper()).strip("_")


# -----------------------------------------------------------------------------
# High-Level Telemetry API
# -----------------------------------------------------------------------------
class Telemetry:
    """
    High-level Python API and context managers for AI Workstation live telemetry.
    Thread-safe, non-blocking failure isolated, and compatible with scripts/update_current_run.py.
    """

    @classmethod
    def start_run(
        cls,
        task: str,
        task_id: str | None = None,
        flow: str = "diagnostic",
        branch: str = DEFAULT_BRANCH,
        harness: str = DEFAULT_HARNESS,
    ) -> dict:
        with acquire_lock():
            now = get_current_iso()
            tid = task_id or f"run-{datetime.now().astimezone().strftime('%Y%m%d-%H%M%S')}"
            state = {
                "taskId": tid,
                "task": task,
                "status": "RUNNING",
                "startedAt": now,
                "updatedAt": now,
                "branch": branch,
                "harness": harness,
                "flow": flow,
                "currentActivity": None,
                "steps": default_steps(flow),
                "events": [],
            }
            append_event(state, "TASK_STARTED", f"Task started: {task}")
            save_state(state)
            return state

    @classmethod
    def start_step(
        cls,
        step_id: str,
        role: str | None = None,
        model: str | None = None,
        activity: str | None = None,
        label: str | None = None,
    ) -> dict:
        with acquire_lock():
            state = load_state()
            step = get_or_create_step(state, step_id, role, model)
            now = get_current_iso()
            step["status"] = "RUNNING"
            step["startedAt"] = now
            step.pop("endedAt", None)
            step.pop("duration", None)
            step.pop("summary", None)
            if activity:
                step["activity"] = activity

            state["status"] = "RUNNING"
            state["currentActivity"] = {
                "stepId": step["id"],
                "role": step.get("role", "Agent"),
                "activity": activity or f"{step.get('role', 'Agent')} is running",
                "model": step.get("model", "Runtime-selected model"),
                "startedAt": now,
            }
            append_event(
                state,
                f"{step_event_prefix(step)}_STARTED",
                label or f"{step.get('role', step['id'])} started",
            )
            save_state(state)
            return state

    @classmethod
    def complete_step(
        cls,
        step_id: str,
        summary: str | None = None,
        duration: str | None = None,
        activity: str | None = None,
        role: str | None = None,
        model: str | None = None,
        label: str | None = None,
    ) -> dict:
        with acquire_lock():
            state = load_state()
            status = "PASS" if step_id == "verification" else "COMPLETE"
            step = get_or_create_step(state, step_id, role, model)
            now = get_current_iso()
            step["status"] = status
            step["endedAt"] = now
            if duration:
                step["duration"] = duration
            else:
                dur = format_duration(step.get("startedAt"), now)
                if dur:
                    step["duration"] = dur
            if summary:
                step["summary"] = summary
            if activity:
                step["activity"] = activity

            current = state.get("currentActivity") or {}
            if current.get("stepId") == step_id or current.get("role") == step.get("role"):
                state["currentActivity"] = None

            suffix = "COMPLETED" if status in {"COMPLETE", "PASS"} else status
            append_event(
                state,
                f"{step_event_prefix(step)}_{suffix}",
                label or f"{step.get('role', step['id'])} {suffix.lower().replace('_', ' ')}",
            )
            save_state(state)
            return state

    @classmethod
    def fail_step(
        cls,
        step_id: str,
        summary: str | None = None,
        label: str | None = None,
        role: str | None = None,
        model: str | None = None,
    ) -> dict:
        with acquire_lock():
            state = load_state()
            step = get_or_create_step(state, step_id, role, model)
            now = get_current_iso()
            step["status"] = "FAILED"
            step["endedAt"] = now
            dur = format_duration(step.get("startedAt"), now)
            if dur:
                step["duration"] = dur
            if summary:
                step["summary"] = summary

            current = state.get("currentActivity") or {}
            if current.get("stepId") == step_id or current.get("role") == step.get("role"):
                state["currentActivity"] = None

            append_event(
                state,
                f"{step_event_prefix(step)}_FAILED",
                label or f"{step.get('role', step['id'])} failed",
            )
            save_state(state)
            return state

    @classmethod
    def block_step(
        cls,
        step_id: str,
        summary: str | None = None,
        label: str | None = None,
        role: str | None = None,
        model: str | None = None,
    ) -> dict:
        with acquire_lock():
            state = load_state()
            step = get_or_create_step(state, step_id, role, model)
            now = get_current_iso()
            step["status"] = "BLOCKED"
            step["endedAt"] = now
            dur = format_duration(step.get("startedAt"), now)
            if dur:
                step["duration"] = dur
            if summary:
                step["summary"] = summary

            current = state.get("currentActivity") or {}
            if current.get("stepId") == step_id or current.get("role") == step.get("role"):
                state["currentActivity"] = None

            append_event(
                state,
                f"{step_event_prefix(step)}_BLOCKED",
                label or f"{step.get('role', step['id'])} blocked",
            )
            save_state(state)
            return state

    @classmethod
    def complete_run(cls, label: str | None = None) -> dict:
        with acquire_lock():
            state = load_state()
            now = get_current_iso()
            state["status"] = "COMPLETE"
            state["endedAt"] = now
            state["currentActivity"] = None
            dur = format_duration(state.get("startedAt"), now)
            if dur:
                state["duration"] = dur

            append_event(state, "TASK_COMPLETE", label or f"Task complete: {state.get('task', 'run')}")
            save_state(state)
            return state

    @classmethod
    def fail_run(cls, label: str | None = None) -> dict:
        with acquire_lock():
            state = load_state()
            now = get_current_iso()
            state["status"] = "FAILED"
            state["endedAt"] = now
            state["currentActivity"] = None
            dur = format_duration(state.get("startedAt"), now)
            if dur:
                state["duration"] = dur

            append_event(state, "TASK_FAILED", label or f"Task failed: {state.get('task', 'run')}")
            save_state(state)
            return state

    @classmethod
    def block_run(cls, label: str | None = None) -> dict:
        with acquire_lock():
            state = load_state()
            now = get_current_iso()
            state["status"] = "BLOCKED"
            state["endedAt"] = now
            state["currentActivity"] = None
            dur = format_duration(state.get("startedAt"), now)
            if dur:
                state["duration"] = dur

            append_event(state, "TASK_BLOCKED", label or f"Task blocked: {state.get('task', 'run')}")
            save_state(state)
            return state

    @classmethod
    def idle(cls, branch: str = DEFAULT_BRANCH, harness: str = DEFAULT_HARNESS) -> dict:
        with acquire_lock():
            state = idle_state(branch, harness)
            save_state(state)
            return state

    @classmethod
    @contextmanager
    def step(
        cls,
        step_id: str,
        role: str | None = None,
        model: str | None = None,
        activity: str | None = None,
        summary: str | None = None,
        suppress_exceptions: bool = False,
    ):
        """
        Ergonomic context manager for an automatic subagent step lifecycle:
        - Automatically marks step RUNNING and updates currentActivity on enter.
        - Automatically marks step COMPLETE / PASS with duration on clean exit.
        - Automatically marks step FAILED on exception and records failure event.
        """
        cls.start_step(step_id, role=role, model=model, activity=activity)
        step_summary = summary
        try:
            yield
            cls.complete_step(step_id, summary=step_summary, role=role, model=model)
        except Exception as exc:
            cls.fail_step(step_id, summary=f"Exception: {exc}", role=role, model=model)
            if not suppress_exceptions:
                raise

