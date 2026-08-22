"""
Deterministic test suite for DataWarsaw AI Workstation Observability Reliability (V1.3).
Tests authoritative lifecycle CLI, cross-platform file locking, atomic writes,
adaptive routing flows, failure states, sanitization, event bounding, and remote publisher readiness.
"""

import json
import os
import subprocess
import sys
import threading
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
UPDATE_SCRIPT_PATH = REPO_ROOT / "scripts" / "update_current_run.py"
PUBLISH_SCRIPT_PATH = REPO_ROOT / "scripts" / "publish_current_run.py"
INTERNAL_STATE_FILE = REPO_ROOT / "state" / "current-run.json"
PUBLIC_DATA_FILE = REPO_ROOT / "site" / "data" / "current-run.json"


def run_update(args_list: list, env_override: dict | None = None) -> subprocess.CompletedProcess:
    cmd = [sys.executable, str(UPDATE_SCRIPT_PATH)] + args_list
    env = os.environ.copy()
    if env_override:
        env.update(env_override)
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(REPO_ROOT), env=env)
    if res.returncode != 0:
        print("ERROR running update:", cmd)
        print("STDERR:", res.stderr)
        print("STDOUT:", res.stdout)
    return res


def run_publish(args_list: list, env_override: dict | None = None) -> subprocess.CompletedProcess:
    cmd = [sys.executable, str(PUBLISH_SCRIPT_PATH)] + args_list
    env = os.environ.copy()
    if env_override:
        env.update(env_override)
    return subprocess.run(cmd, capture_output=True, text=True, cwd=str(REPO_ROOT), env=env)


def load_internal() -> dict:
    return json.loads(INTERNAL_STATE_FILE.read_text(encoding="utf-8"))


def load_public() -> dict:
    return json.loads(PUBLIC_DATA_FILE.read_text(encoding="utf-8"))


def snapshot_file(path: Path) -> bytes | None:
    return path.read_bytes() if path.is_file() else None


def restore_file(path: Path, data: bytes | None) -> None:
    if data is None:
        if path.exists():
            try:
                path.unlink()
            except OSError:
                pass
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)


def test_suite():
    internal_backup = snapshot_file(INTERNAL_STATE_FILE)
    public_backup = snapshot_file(PUBLIC_DATA_FILE)
    try:
        print("=== STARTING OBSERVABILITY RELIABILITY TEST SUITE (V1.3) ===")
        results = {}

        # 1. Simple Run Initialization
        r1 = run_update(["--run-start", "--task-id", "DW-TEST-01", "--task", "Simple Refinement Task", "--flow", "simple"])
        assert r1.returncode == 0
        state1 = load_internal()
        assert state1["taskId"] == "DW-TEST-01"
        assert state1["flow"] == "simple"
        assert len(state1["steps"]) == 3
        assert [s["id"] for s in state1["steps"]] == ["coordinator", "worker", "verification"]
        assert state1["events"][0]["type"] == "TASK_STARTED"
        results["1_simple_run_init"] = "PASS"

        # 2. Diagnostic Run Initialization (2 parallel Scouts)
        r2 = run_update(["--run-start", "--task-id", "DW-TEST-02", "--task", "Diagnostic Investigation", "--flow", "diagnostic"])
        assert r2.returncode == 0
        state2 = load_internal()
        assert state2["taskId"] == "DW-TEST-02"
        assert state2["flow"] == "diagnostic"
        assert len(state2["steps"]) == 6
        assert [s["id"] for s in state2["steps"]] == ["coordinator", "scout-a", "scout-b", "join", "worker", "verification"]
        results["2_diagnostic_run_init"] = "PASS"

        # 3. Complex Run with Dynamic Scouts
        r3 = run_update(["--run-start", "--task-id", "DW-TEST-03", "--task", "Complex Architecture Overhaul", "--flow", "complex"])
        assert r3.returncode == 0
        run_update(["--step-start", "scout-a", "--step-role", "Scout A", "--step-model", "gemini-3.7-flash-high", "--step-activity", "Auditing backend"])
        run_update(["--step-start", "scout-b", "--step-role", "Scout B", "--step-model", "gemini-3.7-flash-high", "--step-activity", "Auditing frontend"])
        run_update(["--step-start", "scout-c", "--step-role", "Scout C", "--step-model", "claude-opus-4-6-thinking", "--step-activity", "Auditing cross-system invariants"])
        state3 = load_internal()
        step_ids = [s["id"] for s in state3["steps"]]
        assert "scout-a" in step_ids and "scout-b" in step_ids and "scout-c" in step_ids
        assert step_ids.index("scout-c") < step_ids.index("join")
        results["3_complex_dynamic_scouts"] = "PASS"

        # 4. Concurrent Multi-Threaded Writes (Simultaneous Scout Completions)
        def update_scout_a():
            run_update(["--step-complete", "scout-a", "--step-summary", "Scout A finished audit"])

        def update_scout_b():
            run_update(["--step-complete", "scout-b", "--step-summary", "Scout B finished UX design"])

        t_a = threading.Thread(target=update_scout_a)
        t_b = threading.Thread(target=update_scout_b)
        t_a.start()
        t_b.start()
        t_a.join()
        t_b.join()

        state4 = load_internal()
        step_a = next(s for s in state4["steps"] if s["id"] == "scout-a")
        step_b = next(s for s in state4["steps"] if s["id"] == "scout-b")
        assert step_a["status"] == "COMPLETE"
        assert step_b["status"] == "COMPLETE"
        event_types = [e["type"] for e in state4["events"]]
        assert "SCOUT_A_COMPLETED" in event_types
        assert "SCOUT_B_COMPLETED" in event_types
        results["4_concurrent_writes_safety"] = "PASS"

        # 5. Worker Failure & Blocked States
        r5_fail = run_update(["--step-fail", "worker", "--step-summary", "Syntax error encountered in component"])
        assert r5_fail.returncode == 0
        state5_fail = load_internal()
        w_step = next(s for s in state5_fail["steps"] if s["id"] == "worker")
        assert w_step["status"] == "FAILED"
        assert "WORKER_FAILED" in [e["type"] for e in state5_fail["events"]]

        r5_block = run_update(["--step-blocked", "worker", "--step-summary", "Missing API key dependency"])
        assert r5_block.returncode == 0
        state5_block = load_internal()
        w_step_b = next(s for s in state5_block["steps"] if s["id"] == "worker")
        assert w_step_b["status"] == "BLOCKED"
        assert "WORKER_BLOCKED" in [e["type"] for e in state5_block["events"]]
        results["5_worker_failure_and_blocked"] = "PASS"

        # 6. Verification State (Pass & Fail)
        r6_fail = run_update(["--step-fail", "verification", "--step-summary", "Viewport 375px overflow detected"])
        assert r6_fail.returncode == 0
        state6_fail = load_internal()
        v_step = next(s for s in state6_fail["steps"] if s["id"] == "verification")
        assert v_step["status"] == "FAILED"

        r6_pass = run_update(["--step-complete", "verification", "--step-summary", "All 7 viewports passed with 0 console errors"])
        assert r6_pass.returncode == 0
        state6_pass = load_internal()
        v_step_p = next(s for s in state6_pass["steps"] if s["id"] == "verification")
        assert v_step_p["status"] == "PASS"
        results["6_verification_states"] = "PASS"

        # 7. Task COMPLETE State
        r7 = run_update(["--run-complete"])
        assert r7.returncode == 0
        state7 = load_internal()
        assert state7["status"] == "COMPLETE"
        assert "endedAt" in state7
        assert "duration" in state7
        assert "TASK_COMPLETE" in [e["type"] for e in state7["events"]]
        results["7_task_complete_state"] = "PASS"

        # 8. Task BLOCKED State
        r8 = run_update(["--run-blocked"])
        assert r8.returncode == 0
        state8 = load_internal()
        assert state8["status"] == "BLOCKED"
        assert "TASK_BLOCKED" in [e["type"] for e in state8["events"]]
        results["8_task_blocked_state"] = "PASS"

        # 9. IDLE State Reset
        r9 = run_update(["--idle"])
        assert r9.returncode == 0
        state9 = load_internal()
        assert state9["status"] == "IDLE"
        assert state9["taskId"] == "idle"
        assert state9["currentActivity"] is None
        results["9_idle_reset"] = "PASS"

        # 10. Malformed Internal JSON Recovery
        INTERNAL_STATE_FILE.write_text("{ malformed json string !!", encoding="utf-8")
        r10 = run_update(["--step-start", "coordinator", "--step-role", "Coordinator", "--step-activity", "Recovering state"])
        assert r10.returncode == 0
        state10 = load_internal()
        assert isinstance(state10, dict)
        assert state10["status"] in ["IDLE", "RUNNING"]
        results["10_malformed_json_recovery"] = "PASS"

        # 11. Public Sanitization Checks
        r11 = run_update([
            "--run-start",
            "--task-id", "DW-SECRET-TEST",
            "--task", "Inspect file C:\AI\datawarsaw\secret\config.json with api key sk-1234567890abcdef, ghp_AbCdEf1234567890, and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz",
            "--flow", "simple"
        ])
        assert r11.returncode == 0
        run_update([
            "--step-start", "worker",
            "--step-activity", "Writing to /Users/micha/workspace/secret.ts with token sk-9876543210fedcba"
        ])
        public_state = load_public()
        public_str = json.dumps(public_state)
        assert "C:\AI\datawarsaw" not in public_str
        assert "/Users/micha" not in public_str
        assert "sk-1234567890abcdef" not in public_str
        assert "sk-9876543210fedcba" not in public_str
        assert "ghp_AbCdEf1234567890" not in public_str
        assert "sk-***[REDACTED]" in public_str
        assert "gh***[REDACTED]" in public_str
        assert "Bearer ***[REDACTED]" in public_str
        assert "config.json" in public_str or "secret.ts" in public_str
        results["11_public_sanitization"] = "PASS"

        # 12. Bounded Event History Trimming
        initial_events = [{"timestamp": "12:00:00", "type": f"EVENT_{i}", "label": f"Event {i}"} for i in range(205)]
        st = load_internal()
        st["events"] = initial_events
        INTERNAL_STATE_FILE.write_text(json.dumps(st, indent=2), encoding="utf-8")
        run_update(["--event-type", "EVENT_FINAL", "--event-label", "Final bounded event"])
        state12 = load_internal()
        assert len(state12["events"]) <= 200
        assert state12["events"][-1]["type"] == "EVENT_FINAL"
        results["12_event_bounding"] = "PASS"

        # 13. Remote Publisher Doctor Diagnostic Inspection
        rp_doc = run_publish(["--doctor"])
        assert rp_doc.returncode == 0
        doc_json = json.loads(rp_doc.stdout)
        assert "winscp_available" in doc_json and doc_json["winscp_available"] is True
        assert "local_telemetry_valid" in doc_json and doc_json["local_telemetry_valid"] is True
        assert doc_json["status"] == "READY_FOR_REMOTE_TEST"
        assert len(doc_json["missing_environment_vars"]) >= 2
        results["13_publisher_doctor"] = "PASS"

        # 14. Remote Publisher Dry-Run Simulation
        rp_dry = run_publish(["--dry-run"])
        assert rp_dry.returncode == 0
        assert "[DRY-RUN]" in rp_dry.stdout
        assert "data/current-run.json" in rp_dry.stdout
        results["14_publisher_dry_run"] = "PASS"

        # 15. Remote Publishing Disabled (Default Safe Mode)
        rp_dis = run_publish([], env_override={"DATAWARSAW_REMOTE_OBSERVABILITY": ""})
        assert rp_dis.returncode == 0
        assert "Remote observability disabled" in rp_dis.stdout
        results["15_publisher_disabled_safe_default"] = "PASS"

        # 16. Missing Credentials Safety Reporting
        rp_miss = run_publish([], env_override={"DATAWARSAW_REMOTE_OBSERVABILITY": "true"})
        assert rp_miss.returncode != 0
        assert "READY_FOR_REMOTE_TEST: Missing credentials" in rp_miss.stdout
        results["16_publisher_missing_creds_safe_error"] = "PASS"

        # 17. Failure Isolation: Remote Error Does NOT Fail Lifecycle Hook
        fake_env = {
            "DATAWARSAW_REMOTE_OBSERVABILITY": "true",
            "DATAWARSAW_DEPLOY_HOST": "invalid-nonexistent-host.local",
            "DATAWARSAW_DEPLOY_USER": "testuser",
            "DATAWARSAW_DEPLOY_PASSWORD": "testpassword_super_secret",
            "DATAWARSAW_DEPLOY_HOSTKEY": "ssh-ed25519 255 SHA256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "DATAWARSAW_DEPLOY_TIMEOUT": "2",
            "DATAWARSAW_DEPLOY_RETRIES": "1"
        }
        r17 = run_update(["--run-start", "--task", "Failure Isolation Test", "--flow", "simple"], env_override=fake_env)
        assert r17.returncode == 0  # Local task MUST succeed despite remote failure!
        assert "[WARN] Remote telemetry publish failed" in r17.stdout or "[REMOTE]" in r17.stdout
        assert "testpassword_super_secret" not in r17.stdout  # Password NEVER leaked
        results["17_failure_isolation"] = "PASS"

        # Reset to clean authoritative run state
        run_update(["--run-start", "--task-id", "DW-046", "--task", "Observability V1.3 - Remote Live Publishing", "--flow", "diagnostic"])
        run_update(["--step-start", "coordinator", "--step-role", "Coordinator", "--step-model", "Antigravity Orchestrator", "--step-activity", "Deconstructing remote live publishing architecture"])
        run_update(["--step-complete", "coordinator", "--step-summary", "Dispatched dual concurrent Scouts for transport & safe publisher architecture"])
        run_update(["--step-start", "scout-a", "--step-role", "Scout A", "--step-model", "gemini-3.7-flash-high", "--step-activity", "Auditing cyber_Folks hosting and WinSCP SFTP transport"])
        run_update(["--step-start", "scout-b", "--step-role", "Scout B", "--step-model", "gemini-3.7-flash-high", "--step-activity", "Designing publish_current_run.py, doctor mode, and failure isolation"])
        run_update(["--step-complete", "scout-a", "--step-summary", "Identified WinSCP.com and OpenSSH SFTP availability for cyber_Folks cPanel"])
        run_update(["--step-complete", "scout-b", "--step-summary", "Architected bounded publisher, atomic replacement, and try_publish_remote isolation"])
        run_update(["--step-start", "join", "--step-role", "JOIN", "--step-model", "Antigravity Orchestrator", "--step-activity", "Synthesizing implementation plan"])
        run_update(["--step-complete", "join", "--step-summary", "Consolidated implementation brief with zero credentials stored in git"])
        run_update(["--step-start", "worker", "--step-role", "Worker", "--step-model", "claude-sonnet-4-6", "--step-activity", "Implementing scripts/publish_current_run.py and update_current_run.py hook"])
        run_update(["--step-complete", "worker", "--step-summary", "Implemented publisher with --doctor, --dry-run, --deploy-static, and failure isolation"])
        run_update(["--step-start", "verification", "--step-role", "Verification", "--step-model", "Deterministic QA", "--step-activity", "Running test suite across viewports and publishing operations"])
        run_update(["--step-complete", "verification", "--step-summary", "All 17 deterministic tests passed cleanly across local and remote simulation"])
        run_update(["--run-complete"])

        final_state = load_internal()
        assert final_state["status"] == "COMPLETE"
        assert len(final_state["steps"]) == 6
        assert all(s["status"] in ["COMPLETE", "PASS"] for s in final_state["steps"])
        results["18_final_authoritative_run"] = "PASS"

        print("=== ALL 18 TESTS PASSED SUCCESSFULLY ===")
        print(json.dumps(results, indent=2))
        return results
    finally:
        restore_file(INTERNAL_STATE_FILE, internal_backup)
        restore_file(PUBLIC_DATA_FILE, public_backup)


if __name__ == "__main__":
    test_suite()
