"""
Manage DataWarsaw AI Workstation live run telemetry.

Writes authoritative runtime state to state/current-run.json and a sanitized
public copy to site/data/current-run.json for the /observability/ page.
"""

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INTERNAL_STATE_FILE = REPO_ROOT / "state" / "current-run.json"
PUBLIC_DATA_FILE = REPO_ROOT / "site" / "data" / "current-run.json"
DEFAULT_BRANCH = "agent-harness-v1"
DEFAULT_HARNESS = "Antigravity V1.1"
TERMINAL_STEP_STATUSES = {"COMPLETE", "PASS", "FAILED", "BLOCKED"}


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


def sanitize_public_state(data: dict) -> dict:
    """Remove internal fields, absolute paths, and likely secrets."""
    clean = json.loads(json.dumps(data))
    windows_abs_path = re.compile(r"^[A-Za-z]:[\\/]")
    secret_patterns = [
        re.compile(r"sk-[A-Za-z0-9_-]+"),
        re.compile(r"gh[pousr]_[A-Za-z0-9_]+"),
    ]

    def clean_val(value):
        if isinstance(value, str):
            if windows_abs_path.match(value) or value.startswith("/"):
                try:
                    value = Path(value).name
                except (OSError, ValueError):
                    pass
            for pattern in secret_patterns:
                value = pattern.sub("***[REDACTED]", value)
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
    INTERNAL_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    data["updatedAt"] = get_current_iso()

    INTERNAL_STATE_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    PUBLIC_DATA_FILE.write_text(
        json.dumps(sanitize_public_state(data), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(
        "[OK] Run state updated: "
        f"status={data.get('status')}, "
        f"steps={len(data.get('steps', []))}, "
        f"events={len(data.get('events', []))}"
    )


def default_steps(flow: str) -> list[dict]:
    """Return the canonical V1.1 step skeleton for the selected route."""
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

    # Dynamic complex scouts should appear before JOIN when possible.
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


def start_run(args) -> dict:
    if not args.task:
        raise SystemExit("--task is required with --run-start")

    now = get_current_iso()
    task_id = args.task_id or f"run-{datetime.now().astimezone().strftime('%Y%m%d-%H%M%S')}"
    state = {
        "taskId": task_id,
        "task": args.task,
        "status": "RUNNING",
        "startedAt": now,
        "updatedAt": now,
        "branch": args.branch,
        "harness": args.harness,
        "flow": args.flow,
        "currentActivity": None,
        "steps": default_steps(args.flow),
        "events": [],
    }
    append_event(state, "TASK_STARTED", f"Task started: {args.task}")
    return state


def start_step(state: dict, args) -> None:
    step = get_or_create_step(state, args.step_start, args.step_role, args.step_model)
    now = get_current_iso()
    step["status"] = "RUNNING"
    step["startedAt"] = now
    step.pop("endedAt", None)
    step.pop("duration", None)
    step.pop("summary", None)
    if args.step_activity:
        step["activity"] = args.step_activity

    state["status"] = "RUNNING"
    state["currentActivity"] = {
        "stepId": step["id"],
        "role": step.get("role", "Agent"),
        "activity": args.step_activity or f"{step.get('role', 'Agent')} is running",
        "model": step.get("model", "Runtime-selected model"),
        "startedAt": now,
    }
    append_event(
        state,
        f"{step_event_prefix(step)}_STARTED",
        args.event_label or f"{step.get('role', step['id'])} started",
    )


def finish_step(state: dict, args, status: str) -> None:
    step_id = args.step_complete or args.step_fail or args.step_blocked
    step = get_or_create_step(state, step_id, args.step_role, args.step_model)
    now = get_current_iso()
    step["status"] = status
    step["endedAt"] = now
    if args.step_duration:
        step["duration"] = args.step_duration
    else:
        duration = format_duration(step.get("startedAt"), now)
        if duration:
            step["duration"] = duration
    if args.step_summary:
        step["summary"] = args.step_summary
    if args.step_activity:
        step["activity"] = args.step_activity

    current = state.get("currentActivity") or {}
    if current.get("stepId") == step_id or current.get("role") == step.get("role"):
        state["currentActivity"] = None

    suffix = "COMPLETED" if status in {"COMPLETE", "PASS"} else status
    append_event(
        state,
        f"{step_event_prefix(step)}_{suffix}",
        args.event_label
        or f"{step.get('role', step['id'])} {suffix.lower().replace('_', ' ')}",
    )


def finish_run(state: dict, args, status: str) -> None:
    now = get_current_iso()
    state["status"] = status
    state["endedAt"] = now
    state["currentActivity"] = None
    duration = format_duration(state.get("startedAt"), now)
    if duration:
        state["duration"] = duration

    if status == "COMPLETE":
        event_type = "TASK_COMPLETE"
        default_label = f"Task complete: {state.get('task', 'run')}"
    elif status == "FAILED":
        event_type = "TASK_FAILED"
        default_label = f"Task failed: {state.get('task', 'run')}"
    else:
        event_type = "TASK_BLOCKED"
        default_label = f"Task blocked: {state.get('task', 'run')}"

    append_event(state, event_type, args.event_label or default_label)


def apply_legacy_updates(state: dict, args) -> None:
    """Keep the original ad-hoc update interface working for manual use."""
    if args.task_id:
        state["taskId"] = args.task_id
    if args.task:
        state["task"] = args.task
    if args.status:
        state["status"] = args.status
    state["branch"] = args.branch
    state["harness"] = args.harness

    if args.init_default_flow:
        state["flow"] = args.flow
        state["steps"] = default_steps(args.flow)

    if args.step_id:
        step = get_or_create_step(state, args.step_id, args.step_role, args.step_model)
        if args.step_status:
            step["status"] = args.step_status
            if args.step_status == "RUNNING" and not step.get("startedAt"):
                step["startedAt"] = get_current_iso()
            elif args.step_status in TERMINAL_STEP_STATUSES:
                step["endedAt"] = get_current_iso()
        if args.step_activity:
            step["activity"] = args.step_activity
            state["currentActivity"] = {
                "stepId": step["id"],
                "role": step.get("role", "Agent"),
                "activity": args.step_activity,
                "model": step.get("model", "Runtime-selected model"),
                "startedAt": step.get("startedAt", get_current_iso()),
            }
        if args.step_duration:
            step["duration"] = args.step_duration
        if args.step_summary:
            step["summary"] = args.step_summary

    if args.event_type:
        append_event(state, args.event_type, args.event_label or args.event_type)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Update DataWarsaw current agent run state.")
    parser.add_argument("--task-id", type=str, help="Task identifier")
    parser.add_argument("--task", type=str, help="Task description")
    parser.add_argument(
        "--status",
        choices=["IDLE", "RUNNING", "COMPLETE", "BLOCKED", "FAILED"],
        help="Overall run status (legacy/manual mode)",
    )
    parser.add_argument("--branch", default=DEFAULT_BRANCH, help="Working branch name")
    parser.add_argument("--harness", default=DEFAULT_HARNESS, help="Harness version")
    parser.add_argument(
        "--flow",
        choices=["simple", "diagnostic", "complex"],
        default="diagnostic",
        help="Coordinator routing pattern for a new run",
    )

    lifecycle = parser.add_mutually_exclusive_group()
    lifecycle.add_argument("--run-start", action="store_true", help="Start a fresh run")
    lifecycle.add_argument("--run-complete", action="store_true", help="Mark run complete")
    lifecycle.add_argument("--run-fail", action="store_true", help="Mark run failed")
    lifecycle.add_argument("--run-blocked", action="store_true", help="Mark run blocked")
    lifecycle.add_argument("--step-start", metavar="STEP_ID", help="Start a step")
    lifecycle.add_argument("--step-complete", metavar="STEP_ID", help="Complete a step")
    lifecycle.add_argument("--step-fail", metavar="STEP_ID", help="Fail a step")
    lifecycle.add_argument("--step-blocked", metavar="STEP_ID", help="Block a step")
    lifecycle.add_argument("--idle", action="store_true", help="Reset workstation to IDLE")

    parser.add_argument("--step-id", help="Step ID to update (legacy/manual mode)")
    parser.add_argument("--step-role", help="Step role label")
    parser.add_argument("--step-model", help="Actual model name for the step")
    parser.add_argument(
        "--step-status",
        choices=["PENDING", "WAITING", "RUNNING", "COMPLETE", "PASS", "FAILED", "BLOCKED"],
        help="Step status (legacy/manual mode)",
    )
    parser.add_argument("--step-activity", help="Live activity description")
    parser.add_argument("--step-duration", help="Completed step duration override")
    parser.add_argument("--step-summary", help="Completed step summary")
    parser.add_argument("--event-type", help="Event type (legacy/manual mode)")
    parser.add_argument("--event-label", help="Human-readable event label")
    parser.add_argument(
        "--init-default-flow",
        action="store_true",
        help="Initialize selected flow (legacy/manual mode)",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()

    if args.idle:
        save_state(idle_state(args.branch, args.harness))
        return

    if args.run_start:
        save_state(start_run(args))
        return

    state = load_state()

    if args.step_start:
        start_step(state, args)
    elif args.step_complete:
        finish_step(state, args, "PASS" if args.step_complete == "verification" else "COMPLETE")
    elif args.step_fail:
        finish_step(state, args, "FAILED")
    elif args.step_blocked:
        finish_step(state, args, "BLOCKED")
    elif args.run_complete:
        finish_run(state, args, "COMPLETE")
    elif args.run_fail:
        finish_run(state, args, "FAILED")
    elif args.run_blocked:
        finish_run(state, args, "BLOCKED")
    else:
        apply_legacy_updates(state, args)

    save_state(state)


if __name__ == "__main__":
    main()
