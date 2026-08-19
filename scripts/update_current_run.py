"""
Manage DataWarsaw AI Workstation live run telemetry.

Writes authoritative runtime state to state/current-run.json and a sanitized
public copy to site/data/current-run.json for the /observability/ page.
Delegates to scripts/telemetry.py for core state, locking, and atomic persistence.
"""

import argparse
import os
import sys
from pathlib import Path

# Allow direct execution of this script from any directory
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from telemetry import (
    DEFAULT_BRANCH,
    DEFAULT_HARNESS,
    TERMINAL_STEP_STATUSES,
    Telemetry,
    acquire_lock,
    append_event,
    default_steps,
    format_duration,
    get_current_iso,
    get_or_create_step,
    idle_state,
    load_state,
    save_state,
)


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
        Telemetry.idle(args.branch, args.harness)
        return

    if args.run_start:
        if not args.task:
            raise SystemExit("--task is required with --run-start")
        Telemetry.start_run(
            task=args.task,
            task_id=args.task_id,
            flow=args.flow,
            branch=args.branch,
            harness=args.harness,
        )
        return

    if args.step_start:
        Telemetry.start_step(
            step_id=args.step_start,
            role=args.step_role,
            model=args.step_model,
            activity=args.step_activity,
            label=args.event_label,
        )
    elif args.step_complete:
        Telemetry.complete_step(
            step_id=args.step_complete,
            summary=args.step_summary,
            duration=args.step_duration,
            activity=args.step_activity,
            role=args.step_role,
            model=args.step_model,
            label=args.event_label,
        )
    elif args.step_fail:
        Telemetry.fail_step(
            step_id=args.step_fail,
            summary=args.step_summary,
            role=args.step_role,
            model=args.step_model,
            label=args.event_label,
        )
    elif args.step_blocked:
        Telemetry.block_step(
            step_id=args.step_blocked,
            summary=args.step_summary,
            role=args.step_role,
            model=args.step_model,
            label=args.event_label,
        )
    elif args.run_complete:
        Telemetry.complete_run(label=args.event_label)
    elif args.run_fail:
        Telemetry.fail_run(label=args.event_label)
    elif args.run_blocked:
        Telemetry.block_run(label=args.event_label)
    else:
        with acquire_lock():
            state = load_state()
            apply_legacy_updates(state, args)
            save_state(state)


if __name__ == "__main__":
    main()
