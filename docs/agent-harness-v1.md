# DataWarsaw Agent Harness V1 (Antigravity Edition)

## Goal
Build a small, observable AI development workflow using native Antigravity subagent capabilities while retaining provider-neutral agent specifications.

V1 optimizes for reliability, context isolation, bounded retries, deterministic verification, and explicit multi-model routing.

## Architecture

```text
User
  <-> Coordinator (Antigravity runtime)
          |
          +--> Scout A (gemini-3.7-flash-high)  ---  Parallel discovery
          |                                         +-> Joined by Coordinator
          +--> Scout B (gemini-3.7-flash-high)  ---/
          |
          +--> Worker  (claude-sonnet-4-6)     ---> Scoped edits & root-cause fix
                   |
                   v
             Verification (test-datawarsaw-web)
                   |
             pass / fail
              |      |
             done  feedback -> Worker (within 2-retry budget)
```

## Native Antigravity Subagent Definitions

Antigravity native configuration lives under `.agents/`:
- `.agents/agents/coordinator/agent.md` — Main coordinator role (`subagent: false`, `enable_subagent_tools: true`).
- `.agents/agents/scout/agent.md` — Read-only scout role (`subagent: true`, `enable_write_tools: false`, `enable_subagent_tools: false`, model: `gemini-3.7-flash-high`).
- `.agents/agents/worker/agent.md` — Scoped implementation role (`subagent: true`, `enable_write_tools: true`, `enable_subagent_tools: false`, model: `claude-sonnet-4-6`).
- `.agents/skills.json` — Workspace skill registry exposing `skills/` to Antigravity runtime.

## Task Startup & Durable Project Memory

At the beginning of meaningful repository tasks, the Coordinator must read:
1. `AGENTS.md` — Repository constitution and operational constraints.
2. `docs/agent-harness-v1.md` — Harness architecture and multi-model routing.
3. `state/project-state.md` — Concise current project checkpoint and runtime state.

The Coordinator consults:
- `state/backlog.md` — When the task concerns priorities, roadmap, planning, next work, or project continuation. (Do not force reading for trivial styling/text edits.)

### Memory & State Update Policy
- `state/project-state.md` is updated only when meaningful project state changes (e.g. harness architecture, active branch strategy, deployment policy, major component stability, runtime/model behavior, or strategic direction). Do not update for routine commits, small CSS tweaks, or typo fixes.
- `state/backlog.md` is updated when new ideas are accepted, priorities shift, items become active (NOW/NEXT), items complete (DONE), or items are dropped.
- Git history remains the historical record of changes.

Provider-neutral contract documentation remains preserved under `agents/`:
- `agents/coordinator.md`
- `agents/scout.md`
- `agents/worker.md`

## Model Routing Matrix

| Role | Default Model | Reasoning / Effort | Allowed Actions | Delegation |
| :--- | :--- | :--- | :--- | :--- |
| **Coordinator** | Orchestrator (Antigravity default) | Standard | Orchestrate, create task contracts, join results, verify | Yes (up to 2 concurrent subagents) |
| **Scout** | `gemini-3.7-flash-high` | High | Read-only search, inspection, viewport analysis | No (Leaf agent) |
| **Scout (Deep Reasoning)** | `claude-opus-4-6-thinking` / `gemini-3.1-pro-high` | High / Thinking | Complex logic/structural code analysis | No (Leaf agent) |
| **Worker** | `claude-sonnet-4-6` | Standard | Scoped code edits, deterministic checks | No (Leaf agent) |

### Available Native Models in Antigravity
The authenticated Antigravity CLI environment exposes the following verified models:
- `gemini-3.7-flash-high`
- `gemini-3.7-flash-medium`
- `gemini-3.7-flash-low`
- `gemini-3.1-pro-high`
- `claude-sonnet-4-6`
- `claude-opus-4-6-thinking`
- `gpt-oss-120b-medium`

*Note on GPT-5.6 Sol:* GPT-5.6 Sol is not available natively within Antigravity. Utilizing GPT-5.6 would require an external proxy or Codex bridge and is outside the native V1.1 harness scope.

### Model Fallback & Block Policy
If a designated model slug is not available or unauthenticated in the active CLI environment (`agy models`):
1. **Never silently substitute** a different model family.
2. Report `STATUS: MODEL ROUTING BLOCKED`.
3. Provide the list of available models detected by the CLI and await approval.

## Parallelism & Join Rules

1. **Max Concurrency:** Maximum 2 concurrent leaf subagents in V1.1.
2. **Scout Parallelism:** Two independent Scouts (Scout A and Scout B) may execute simultaneously only when:
   - Their discovery questions are orthogonal and independent.
   - Neither subagent requires the output of the other.
   - Both operate read-only (zero file mutations).
3. **Worker Exclusivity:** Never run parallel editing Workers. Worker execution is always serial and bounded.
4. **Coordinator Join Behavior:**
   - Wait for both Scouts to finish.
   - Identify points of agreement, divergence, and potential contradictions.
   - Synthesize a single consolidated implementation brief.
   - Delegate the implementation brief to Worker.

## Task Complexity Routing

The Coordinator must choose the smallest orchestration pattern that is sufficient for the task.

### 1. Simple / Local Refinement
Use when:
- Scope is narrow and explicit,
- Affected files are known,
- Implementation path is obvious,
- Little or no investigation is required.

Default flow:
```text
Coordinator -> Worker -> Verification
```
*Do not spawn Scouts by default.*

Examples:
- Change labels or copy,
- Adjust one CSS component,
- Convert displayed values,
- Small visual refinement,
- Update a known config value.

### 2. Diagnostic / Moderately Complex
Use when:
- Root cause is not yet known,
- Implementation affects multiple concerns,
- Responsive/data/API behavior must be inspected,
- Two independent questions can be investigated.

Default flow:
```text
Coordinator
├── Scout A
├── Scout B
└── JOIN -> Worker -> Verification
```
*Scouts should run concurrently when independent.*

### 3. Complex / Ambiguous
Use when:
- Several subsystems are involved,
- Architecture or implementation path is uncertain,
- Multiple independent investigations would materially reduce risk,
- The task has meaningful regression potential.

Default flow:
```text
Coordinator
├── 2–4 dynamic read-only Scouts
└── JOIN -> Worker -> Verification
```
*Use the minimum number of Scouts needed. Do not automatically use four.*

### 4. Escalation Rule
Start with the lowest reasonable orchestration level. Escalate only when evidence shows it is necessary:
- Worker blocked -> add Scout / diagnosis.
- Two-Scout diagnosis insufficient -> expand Scout swarm.
- *Do not increase agent count merely because a task is taking longer than expected.*

### 5. Failure / Runtime Fallback
If parallel subagent execution fails because of a runtime/provider issue:
- 2 Scouts parallel -> retry with 1 Scout.
- If still blocked -> Coordinator -> Worker.
- *Do not repeatedly recreate parallel agents for the same runtime error.*

### 6. General Principle
More agents are not inherently better. Optimize for:
- Shortest reliable path,
- Minimal context duplication,
- Minimal tool calls,
- Clear ownership,
- Sufficient evidence before implementation.

## Worker Debug & Retry Budget

For infrastructure, networking, authentication, environment, or tooling errors:
- Maximum **2 materially different approaches**.
- Spend at most **~3 minutes** on infrastructure-level troubleshooting.
- Never loop over trivial variations of failing commands.
- If unresolved:
  1. STOP immediately.
  2. Preserve workspace state.
  3. Return `STATUS: BLOCKED`.
  4. Report exact failure point, evidence collected, and simplest escalation path.

For code implementation verification failures:
- Default maximum **2 implementation retries** after actionable verification feedback.
- If acceptance criteria remain unmet after 2 retries, escalate to Coordinator with full diff and test logs.

## Runtime Subagent Inspection & Verification

To verify that subagents are running in real, isolated contexts and using the expected models:

1. **Inspect Active Subagents:**
   - In Antigravity interactive / TUI mode, run `/agents` or `/tasks` to view the active subagent process tree, IDs, and lifecycle states (`waiting_for_message`, `running`, `completed`).
   - In programmatic/CLI mode, check the session database under `~/.gemini/antigravity-cli/conversations/` or trajectory logs under `~/.gemini/antigravity-cli/log/`.
2. **Model Attribution & Token Ledger:**
   - Run `codeburn doctor` and `codeburn models --sessions` to verify per-session model attribution and exact token consumption breakdown.
   - Ensure separate session IDs are assigned to Coordinator, Scout, and Worker.

## Skills

- `skills/planning-grill/` — Resolves meaningful ambiguity before implementation.
- `skills/test-datawarsaw-web/` — Verifies the real site against project QA checklists and required viewports.
- `skills/simplify/` — Reduces unnecessary complexity only after the implementation already works.

## Live Observability & Telemetry Reliability

The harness automatically publishes real-time orchestration telemetry to `state/current-run.json` and sanitizes a public copy to `site/data/current-run.json`, powering the live `/observability/` Mission Control page.

### Telemetry Lifecycle CLI
Telemetry updates are driven via `scripts/update_current_run.py`:
```bash
# Task Initialization (Routing Pattern: simple | diagnostic | complex)
python scripts/update_current_run.py --run-start --task "Task description" --flow diagnostic

# Step Transitions
python scripts/update_current_run.py --step-start coordinator --step-role "Coordinator" --step-model "Antigravity Orchestrator" --step-activity "Deconstructing task"
python scripts/update_current_run.py --step-complete coordinator --step-summary "Dispatched Scouts"
python scripts/update_current_run.py --step-start scout-a --step-role "Scout A" --step-model "gemini-3.7-flash-high" --step-activity "Auditing runtime"
python scripts/update_current_run.py --step-complete scout-a --step-summary "Audited runtime"
python scripts/update_current_run.py --step-start join --step-role "JOIN" --step-summary "Synthesized brief"
python scripts/update_current_run.py --step-complete join --step-summary "Joined findings"
python scripts/update_current_run.py --step-start worker --step-role "Worker" --step-model "claude-sonnet-4-6" --step-activity "Implementing changes"
python scripts/update_current_run.py --step-complete worker --step-summary "Implemented scoped edits"
python scripts/update_current_run.py --step-start verification --step-role "Verification" --step-model "Deterministic QA"
python scripts/update_current_run.py --step-complete verification --step-summary "All viewports and tests passed"

# Run Completion / Failure / Standby
python scripts/update_current_run.py --run-complete
python scripts/update_current_run.py --run-blocked
python scripts/update_current_run.py --run-fail
python scripts/update_current_run.py --idle
```

### Reliability & Safety Guarantees
- **Cross-Platform File Locking:** Protects read-modify-write transactions on `state/current-run.lock` using non-blocking exclusive locks (`msvcrt` on Windows, `fcntl` on POSIX). Parallel Scouts completing simultaneously will not corrupt or overwrite state.
- **Atomic Writes & Contention Retry:** Writes to process-isolated temp files (`current-run.json.tmp.<pid>.<uuid>`), flushes and syncs to disk (`os.fsync`), and atomically replaces (`os.replace`) with exponential retry for Windows filesystem contention.
- **Bounded Event History:** Caps event history at `MAX_EVENTS = 200` to prevent unbounded growth during long sessions.
- **Malformed State Recovery:** Gracefully recovers to standby/initialization if internal state JSON is corrupted.
- **Public Data Sanitization:** Automatically redacts absolute file paths (`C:\...`, `/Users/...`), API tokens (`sk-...`, `ghp_...`, `Bearer ...`), and internal fields before exporting to `site/data/current-run.json`.
- **Client-Side Stale Detection:** If a run remains in `RUNNING` status without an updated heartbeat for >5 minutes, `/observability/` displays `STALE (NO HEARTBEAT)` in the UI without modifying repository ground truth.

## Observability V1.3 — Remote Live Publishing

Enables publishing live local workstation telemetry to public hosting (e.g. cyber_Folks `/public_html/data/current-run.json`) so the remote `/observability/` Mission Control page mirrors live local execution.

### Remote Publisher CLI (`scripts/publish_current_run.py`)
```bash
# Diagnostic health check of tools, paths, and environment variables
python scripts/publish_current_run.py --doctor

# Validate local sanitized JSON and simulate upload without network I/O
python scripts/publish_current_run.py --dry-run

# One-time deployment of static /observability/ assets and initial data file
python scripts/publish_current_run.py --deploy-static

# Direct publish of sanitized site/data/current-run.json
python scripts/publish_current_run.py
```

### Configuration & Credential Safety
Configure remote publishing via environment variables (never committed to git):
- `DATAWARSAW_REMOTE_OBSERVABILITY=true` — Enables automatic remote sync on lifecycle updates.
- `DATAWARSAW_DEPLOY_HOST` — Remote server hostname / IP (e.g. cyber_Folks cPanel).
- `DATAWARSAW_DEPLOY_USER` — Remote SFTP/FTPS username.
- `DATAWARSAW_DEPLOY_PASSWORD` / `DATAWARSAW_DEPLOY_KEY` — Authentication credentials.
- `DATAWARSAW_DEPLOY_PORT` — Target port (default: 22).
- `DATAWARSAW_DEPLOY_PATH` — Target web root (default: `/public_html`).
- `DATAWARSAW_DEPLOY_TRANSPORT` — Transport mechanism (`sftp` [default], `winscp_sftp`, `winscp_ftps`, `ftps`).

### Failure Isolation
Remote publishing is strictly auxiliary:
- `scripts/update_current_run.py` calls the publisher with a non-blocking timeout budget (5–8s).
- If remote upload fails (network down, bad credentials, timeout), the error is logged as an isolated warning and the **local task continues to succeed without interruption**.
- Credentials and passwords are masked from all diagnostic outputs and process logs.

## Deployment Boundary

Public website files live only under `site/`:

```text
site/
├── index.html
├── styles.css
├── script.js
└── assets/
```

Serve the website locally from `site/`:

```powershell
cd C:\AI\datawarsaw\site
python -m http.server 8081
```

