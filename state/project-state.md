# DataWarsaw Project State

## Current Working Branch

`agent-harness-v1`

## Public Site Root

`site/`

Only content inside `site/` is production-deployable.

## Current Harness

Adaptive orchestration.

- **Simple / Local Refinement:**
  `Coordinator -> Worker -> Verification`
- **Diagnostic / Moderately Complex:**
  `Coordinator -> [Scout A + Scout B] -> JOIN -> Worker -> Verification`
- **Complex / Ambiguous:**
  `Coordinator -> [2–4 dynamic read-only Scouts] -> JOIN -> Worker -> Verification`

Use the minimum sufficient number of agents.

## Current Runtime

Primary current runtime:
**Antigravity**

## Current Model Reality

Recent real Antigravity runs have primarily executed with **Gemini 3.7 Flash High**.

The harness previously intended Claude Sonnet 4.6 for Worker tasks, but runtime validation showed that dynamically-created Worker subagents may inherit Gemini instead.

Treat this as an observed runtime behavior, not a resolved architectural guarantee.

## Current Website State

Main completed recent improvements:
- Weather chart simplified to temperature-only visualization.
- Recommendation logic continues to use comprehensive weather signals.
- GitHub activity component aggregates the public `datawarsaw` owner profile.
- GitHub contribution layout is responsive and container-driven.
- Analytical Expertise radar has differentiated integer 1–10 scores.
- Weather recommendation Polish character encoding issue fixed (clean UTF-8).
- Model Benchmark Dashboard removed from public website (retained internally under `evals/`, `docs/`, `state/`, and `benchmark-comparison.html`).
- Dedicated live Agent Observability subpage created at `/observability/` (`site/observability/index.html`) featuring live mission control, flow graph, active agent activity, and chronological event stream.
- Live V1.1 file-driven observability architecture established: runtime updates `state/current-run.json` and sanitizes public export to `site/data/current-run.json`.
- Coordinator lifecycle telemetry interface added to `scripts/update_current_run.py`: fresh run initialization, step start/complete/fail/block events, automatic durations, run completion/failure/block state, and activity cleanup.
- Provider-neutral Coordinator contract now requires lifecycle telemetry for meaningful repository work and requires observed runtime model attribution.
- `/observability/` flow rendering now follows the actual published step list, so simple runs no longer fabricate Scout/JOIN nodes and complex runs can surface dynamic `scout-*` branches.
- Homepage Section 06 (`#harness`) streamlined to an editorial compact teaser linking directly to `/observability/`.
- Observability telemetry hardened with cross-platform file locking (`msvcrt`/`fcntl` on `state/current-run.lock`), atomic writes with filesystem contention retries, `MAX_EVENTS = 200` bounding, hardened path/secret sanitization, and client-side stale-run detection.
- Observability V1.3 remote live publishing implemented: dedicated `scripts/publish_current_run.py` with WinSCP/OpenSSH SFTP transport, `--doctor`, `--dry-run`, `--deploy-static` commands, remote atomic replacement, credential masking, and complete failure isolation in `scripts/update_current_run.py`.

## Current Strategic Direction

Primary positioning:
- **Data Analytics + AI Analytics**

Data Analytics remains the core foundation. AI is positioned as an extension of analytical work rather than replacing the analytics identity.

## Current AI Workstation Direction

Active themes & experiments:
- Local AI models
- Antigravity agent harness
- Live agent observability & telemetry
- Power BI + AI
- SQL / Databricks assistance
- Local Qwen experiments
- Future MCP research
- Future multi-provider routing

## Deployment

Current policy:
- Active feature work on `agent-harness-v1`.
- Do not merge to `main` automatically.
- Do not deploy unless explicitly requested.
- Only `site/` may be deployed.
- `main` will eventually act as production source of truth.

## Project Memory Rule

- Chat/model memory may contain user preferences.
- Repository state files contain project truth.
- Agents should never trust stale chat history over current repository state.

## Local Runtime Caveat

The repository documents native Antigravity configuration under `.agents/`, but that directory is not currently present on the GitHub `agent-harness-v1` branch. Repository-level telemetry hooks are therefore ready, while actual automatic invocation still depends on the local Antigravity Coordinator configuration using the updated contract or equivalent lifecycle calls.

## Update Policy

Update `state/project-state.md` only when meaningful project state changes, such as:
- Harness architecture changes
- Active branch strategy changes
- Deployment strategy changes
- Major site component reaches a new stable state
- Primary runtime/model behavior changes
- Strategic project direction changes

Do not update for routine commits, small CSS tweaks, or typo fixes.
