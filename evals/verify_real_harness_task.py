"""
Verification script for real representative Antigravity harness execution task with live telemetry:
Coordinator -> [Scout A + Scout B] (Parallel) -> JOIN -> Worker -> Verification -> Complete.
Also verifies failure / blocked handling and data sanitization mirroring.
"""

import json
import os
import sys
import threading
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from telemetry import Telemetry, load_state, PUBLIC_DATA_FILE, INTERNAL_STATE_FILE


def verify_real_task():
    print("=== EXECUTING REPRESENTATIVE HARNESS TASK WITH TELEMETRY ===")
    
    # 1. TASK STARTED
    Telemetry.start_run(
        task="Representative Observability V1.2 Automatic Telemetry Run",
        task_id="DW-HARNESS-LIVE",
        flow="diagnostic"
    )
    s1 = load_state()
    assert s1["status"] == "RUNNING"
    assert s1["events"][0]["type"] == "TASK_STARTED"
    assert len(s1["steps"]) == 6
    print(" [x] Task started & initial diagnostic flow initialized")

    # 2. COORDINATOR STARTED & COMPLETED
    with Telemetry.step("coordinator", role="Coordinator", model="Antigravity Orchestrator", activity="Deconstructing goal and framing Scout discovery questions", summary="Dispatched Scout A and Scout B concurrently"):
        time.sleep(0.1)
    
    s2 = load_state()
    coord_step = next(s for s in s2["steps"] if s["id"] == "coordinator")
    assert coord_step["status"] == "COMPLETE"
    assert coord_step["duration"] is not None
    print(" [x] Coordinator step completed with duration & summary")

    # 3. PARALLEL SCOUTS (Scout A & Scout B)
    def run_scout_a():
        with Telemetry.step("scout-a", role="Scout A", model="gemini-3.7-flash-high", activity="Auditing telemetry hooks and lock mechanisms", summary="Audited locking and atomic replace"):
            time.sleep(0.3)

    def run_scout_b():
        with Telemetry.step("scout-b", role="Scout B", model="gemini-3.7-flash-high", activity="Auditing UI rendering and event streams", summary="Audited event streaming and status tags"):
            time.sleep(0.5)

    # Start both threads concurrently
    t_a = threading.Thread(target=run_scout_a)
    t_b = threading.Thread(target=run_scout_b)
    
    t_a.start()
    t_b.start()
    
    # Check mid-execution: both scouts should be RUNNING simultaneously
    time.sleep(0.15)
    s_mid = load_state()
    scout_a_mid = next(s for s in s_mid["steps"] if s["id"] == "scout-a")
    scout_b_mid = next(s for s in s_mid["steps"] if s["id"] == "scout-b")
    assert scout_a_mid["status"] == "RUNNING"
    assert scout_b_mid["status"] == "RUNNING"
    print(" [x] Parallel Scout execution verified: both Scout A & Scout B are RUNNING concurrently")

    t_a.join()
    # Check after Scout A finishes but before Scout B finishes
    s_mid2 = load_state()
    scout_a_done = next(s for s in s_mid2["steps"] if s["id"] == "scout-a")
    scout_b_still = next(s for s in s_mid2["steps"] if s["id"] == "scout-b")
    assert scout_a_done["status"] == "COMPLETE"
    assert scout_b_still["status"] == "RUNNING"
    print(" [x] Independence verified: Scout A completion did not terminate Scout B")

    t_b.join()
    s3 = load_state()
    scout_b_done = next(s for s in s3["steps"] if s["id"] == "scout-b")
    assert scout_b_done["status"] == "COMPLETE"
    print(" [x] Scout B completed cleanly with individual duration")

    # 4. JOIN STARTED & COMPLETED
    with Telemetry.step("join", role="JOIN", model="Antigravity Orchestrator", activity="Synthesizing Scout A and Scout B findings", summary="Formulated consolidated implementation contract for Worker"):
        time.sleep(0.1)

    s4 = load_state()
    join_step = next(s for s in s4["steps"] if s["id"] == "join")
    assert join_step["status"] == "COMPLETE"
    print(" [x] JOIN synthesis step completed")

    # 5. WORKER IMPLEMENTATION
    with Telemetry.step("worker", role="Worker", model="claude-sonnet-4-6", activity="Executing scoped codebase modifications", summary="Implemented telemetry SDK and lifecycle hooks"):
        time.sleep(0.2)

    s5 = load_state()
    worker_step = next(s for s in s5["steps"] if s["id"] == "worker")
    assert worker_step["status"] == "COMPLETE"
    print(" [x] Worker step completed with model attribution (claude-sonnet-4-6)")

    # 6. VERIFICATION
    with Telemetry.step("verification", role="Verification", model="Deterministic QA", activity="Executing responsive browser checks and event verification", summary="All 18 deterministic checks passed cleanly"):
        time.sleep(0.1)

    s6 = load_state()
    verify_step = next(s for s in s6["steps"] if s["id"] == "verification")
    assert verify_step["status"] == "PASS"
    print(" [x] Verification step marked PASS with summary")

    # 7. RUN COMPLETION
    Telemetry.complete_run("All phases passed and verified")
    s_final = load_state()
    assert s_final["status"] == "COMPLETE"
    assert s_final["duration"] is not None
    assert s_final["currentActivity"] is None
    print(" [x] Run marked COMPLETE, duration calculated, currentActivity cleared")

    # 8. TEST FAILURE / BLOCKED SCENARIO
    print("--- Testing Failure & Blocked Path Handling ---")
    Telemetry.start_run(task="Failure Scenario Test", task_id="DW-FAIL-TEST", flow="simple")
    Telemetry.start_step("worker", role="Worker", model="claude-sonnet-4-6", activity="Attempting risky operation")
    Telemetry.fail_step("worker", summary="Simulated compilation failure")
    s_fail = load_state()
    assert next(s for s in s_fail["steps"] if s["id"] == "worker")["status"] == "FAILED"
    Telemetry.fail_run("Task failed at worker step")
    assert load_state()["status"] == "FAILED"
    print(" [x] Worker failure & task failure state recorded properly")

    # Test blocked scenario
    Telemetry.start_run(task="Blocked Scenario Test", task_id="DW-BLOCK-TEST", flow="simple")
    Telemetry.start_step("coordinator", role="Coordinator", model="Antigravity Orchestrator", activity="Awaiting user clarification")
    Telemetry.block_step("coordinator", summary="Blocked on missing credentials")
    Telemetry.block_run("Task blocked on external dependency")
    assert load_state()["status"] == "BLOCKED"
    print(" [x] Blocked step & task blocked state recorded properly")

    # 9. MIRRORING & SANITIZATION VERIFICATION
    Telemetry.start_run(
        task="Sanitization Check with path C:\\AI\\datawarsaw\\site\\index.html and key sk-1234567890abcdef",
        task_id="DW-SANITIZATION",
        flow="simple"
    )
    public_content = PUBLIC_DATA_FILE.read_text(encoding="utf-8")
    assert "C:\\AI\\datawarsaw" not in public_content
    assert "sk-1234567890abcdef" not in public_content
    assert "sk-***[REDACTED]" in public_content
    print(" [x] Sanitization mirroring confirmed: site/data/current-run.json is clean and safe")

    # Reset to clean final state
    Telemetry.idle()
    print("=== ALL REPRESENTATIVE HARNESS VERIFICATIONS PASSED ===")
    return True


if __name__ == "__main__":
    verify_real_task()

