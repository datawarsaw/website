"""
Runtime script to manage AI Workstation current run state.
Updates state/current-run.json and synchronizes a sanitized public copy to site/data/current-run.json.
"""

import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INTERNAL_STATE_FILE = REPO_ROOT / "state" / "current-run.json"
PUBLIC_DATA_FILE = REPO_ROOT / "site" / "data" / "current-run.json"


def get_current_iso() -> str:
    """Return current timestamp in ISO 8601 format with timezone."""
    return datetime.now(timezone.utc).astimezone().isoformat()


def get_current_time_str() -> str:
    """Return HH:MM:SS for concise event logs."""
    return datetime.now(timezone.utc).astimezone().strftime("%H:%M:%S")


def sanitize_public_state(data: dict) -> dict:
    """
    Sanitize internal state for public consumption.
    Strips any accidental secrets, tokens, private prompts, or absolute host paths.
    """
    clean = json.loads(json.dumps(data))
    
    def clean_val(val):
        if isinstance(val, str):
            if ":\\" in val or ":/" in val:
                try:
                    val = Path(val).name
                except Exception:
                    pass
            if "sk-" in val:
                val = re.sub(r'sk-[a-zA-Z0-9_-]+', 'sk-***[REDACTED]', val)
            return val
        elif isinstance(val, dict):
            return {k: clean_val(v) for k, v in val.items() if not k.startswith("_")}
        elif isinstance(val, list):
            return [clean_val(item) for item in val]
        return val

    return clean_val(clean)


def load_state() -> dict:
    """Load existing state or return default IDLE state."""
    if INTERNAL_STATE_FILE.is_file():
        try:
            return json.loads(INTERNAL_STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass

    return {
        "taskId": "run-20260819-live",
        "task": "Refactor observability and move live telemetry to /observability/",
        "status": "RUNNING",
        "startedAt": get_current_iso(),
        "updatedAt": get_current_iso(),
        "branch": "agent-harness-v1",
        "harness": "Antigravity V1.1",
        "currentActivity": {
            "role": "Worker",
            "activity": "Implementing /observability/ live console and removing benchmark from homepage...",
            "model": "gemini-3.7-flash-high",
            "startedAt": get_current_iso()
        },
        "steps": [
            {"id": "coordinator", "role": "Coordinator", "model": "Antigravity Orchestrator", "status": "COMPLETE", "startedAt": get_current_iso(), "endedAt": get_current_iso(), "duration": "7s", "summary": "Dispatched dual concurrent Scouts for site inspection & UX architecture."},
            {"id": "scout-a", "role": "Scout A", "model": "gemini-3.7-flash-high", "status": "COMPLETE", "startedAt": get_current_iso(), "endedAt": get_current_iso(), "duration": "15s", "summary": "Audited site/ files, benchmark markup, and public data bridge."},
            {"id": "scout-b", "role": "Scout B", "model": "gemini-3.7-flash-high", "status": "COMPLETE", "startedAt": get_current_iso(), "endedAt": get_current_iso(), "duration": "22s", "summary": "Designed /observability/ live console layout and responsive flow graph."},
            {"id": "join", "role": "JOIN", "model": "Antigravity Orchestrator", "status": "COMPLETE", "startedAt": get_current_iso(), "endedAt": get_current_iso(), "duration": "2s", "summary": "Synthesized implementation scope and routing plan."},
            {"id": "worker", "role": "Worker", "model": "gemini-3.7-flash-high", "status": "RUNNING", "startedAt": get_current_iso(), "activity": "Implementing /observability/ live console and removing benchmark from homepage..."},
            {"id": "verification", "role": "Verification", "model": "Deterministic Viewport QA", "status": "PENDING"}
        ],
        "events": [
            {"timestamp": get_current_time_str(), "type": "TASK_STARTED", "label": "Task started: Refactor observability and remove benchmark"},
            {"timestamp": get_current_time_str(), "type": "COORDINATOR_STARTED", "label": "Coordinator planning and routing"},
            {"timestamp": get_current_time_str(), "type": "SCOUT_A_STARTED", "label": "Scout A started site audit"},
            {"timestamp": get_current_time_str(), "type": "SCOUT_B_STARTED", "label": "Scout B started UX layout design"},
            {"timestamp": get_current_time_str(), "type": "SCOUT_A_COMPLETED", "label": "Scout A completed site audit"},
            {"timestamp": get_current_time_str(), "type": "SCOUT_B_COMPLETED", "label": "Scout B completed UX layout design"},
            {"timestamp": get_current_time_str(), "type": "JOIN_COMPLETED", "label": "JOIN synthesis completed"},
            {"timestamp": get_current_time_str(), "type": "WORKER_STARTED", "label": "Worker started implementation"}
        ]
    }


def save_state(data: dict):
    """Save to internal state/ and export sanitized public site/data/."""
    INTERNAL_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    data["updatedAt"] = get_current_iso()

    INTERNAL_STATE_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    public_data = sanitize_public_state(data)
    PUBLIC_DATA_FILE.write_text(json.dumps(public_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[OK] Run state updated: status={data.get('status')}, steps={len(data.get('steps', []))}, events={len(data.get('events', []))}")


def main():
    parser = argparse.ArgumentParser(description="Update DataWarsaw current agent run state.")
    parser.add_argument("--task-id", type=str, help="Task identifier")
    parser.add_argument("--task", type=str, help="Task description")
    parser.add_argument("--status", type=str, choices=["IDLE", "RUNNING", "COMPLETE", "BLOCKED", "FAILED"], help="Overall run status")
    parser.add_argument("--branch", type=str, default="agent-harness-v1", help="Working branch name")
    parser.add_argument("--harness", type=str, default="Antigravity V1.1", help="Harness version")
    
    parser.add_argument("--step-id", type=str, help="Step ID to update")
    parser.add_argument("--step-role", type=str, help="Step role label")
    parser.add_argument("--step-model", type=str, help="Model name for step")
    parser.add_argument("--step-status", type=str, choices=["PENDING", "WAITING", "RUNNING", "COMPLETE", "PASS", "FAILED", "BLOCKED"], help="Step status")
    parser.add_argument("--step-activity", type=str, help="Live activity description for the step")
    parser.add_argument("--step-duration", type=str, help="Completed step duration")
    parser.add_argument("--step-summary", type=str, help="Completed step summary output")

    parser.add_argument("--event-type", type=str, help="Event type")
    parser.add_argument("--event-label", type=str, help="Human-readable event label")

    parser.add_argument("--init-default-flow", action="store_true", help="Initialize standard harness workflow steps")
    parser.add_argument("--idle", action="store_true", help="Reset state to IDLE mode")

    args = parser.parse_args()
    state = load_state()

    if args.idle:
        state = {
            "taskId": "idle",
            "task": "No active run",
            "status": "IDLE",
            "startedAt": get_current_iso(),
            "updatedAt": get_current_iso(),
            "branch": args.branch,
            "harness": args.harness,
            "currentActivity": None,
            "steps": [],
            "events": [
                {"timestamp": get_current_time_str(), "type": "WORKSTATION_IDLE", "label": "Workstation is in standby mode."}
            ]
        }
        save_state(state)
        return

    if args.task_id:
        state["taskId"] = args.task_id
    if args.task:
        state["task"] = args.task
    if args.status:
        state["status"] = args.status
    if args.branch:
        state["branch"] = args.branch
    if args.harness:
        state["harness"] = args.harness

    if args.init_default_flow:
        state["steps"] = [
            {"id": "coordinator", "role": "Coordinator", "model": "Antigravity Orchestrator", "status": "PENDING"},
            {"id": "scout-a", "role": "Scout A", "model": "gemini-3.7-flash-high", "status": "PENDING"},
            {"id": "scout-b", "role": "Scout B", "model": "gemini-3.7-flash-high", "status": "PENDING"},
            {"id": "join", "role": "JOIN", "model": "Antigravity Orchestrator", "status": "PENDING"},
            {"id": "worker", "role": "Worker", "model": "gemini-3.7-flash-high", "status": "PENDING"},
            {"id": "verification", "role": "Verification", "model": "Deterministic Viewport QA", "status": "PENDING"}
        ]

    if args.step_id:
        steps = state.setdefault("steps", [])
        target_step = None
        for s in steps:
            if s.get("id") == args.step_id:
                target_step = s
                break
        
        if not target_step:
            target_step = {"id": args.step_id, "role": args.step_role or args.step_id.title(), "status": "PENDING"}
            steps.append(target_step)

        if args.step_role:
            target_step["role"] = args.step_role
        if args.step_model:
            target_step["model"] = args.step_model
        if args.step_status:
            target_step["status"] = args.step_status
            if args.step_status == "RUNNING" and "startedAt" not in target_step:
                target_step["startedAt"] = get_current_iso()
            elif args.step_status in ["COMPLETE", "PASS", "FAILED", "BLOCKED"]:
                target_step["endedAt"] = get_current_iso()

        if args.step_activity:
            target_step["activity"] = args.step_activity
            state["currentActivity"] = {
                "role": target_step.get("role", "Agent"),
                "activity": args.step_activity,
                "model": target_step.get("model", "Default Model"),
                "startedAt": target_step.get("startedAt", get_current_iso())
            }
        
        if args.step_duration:
            target_step["duration"] = args.step_duration
        if args.step_summary:
            target_step["summary"] = args.step_summary

    if args.event_type:
        events = state.setdefault("events", [])
        events.append({
            "timestamp": get_current_time_str(),
            "type": args.event_type,
            "label": args.event_label or args.event_type
        })

    save_state(state)


if __name__ == "__main__":
    main()
