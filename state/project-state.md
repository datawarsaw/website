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
- Weather recommendation Polish character encoding fixed (clean UTF-8).
- Model Benchmark Dashboard was retired from the public website; historical benchmark implementations and decision records are preserved on dedicated `benchmark/*` branches, while local comparison dashboards and generated outputs have been retired.
- Dedicated live Agent Observability subpage created at `/observability/` (`site/observability/index.html`) featuring live mission control, flow graph, active agent activity, and chronological event stream.
- Live V1.1 file-driven observability architecture established: runtime updates `state/current-run.json` and sanitizes public export to `site/data/current-run.json`.
- Coordinator lifecycle telemetry interface added to `scripts/update_current_run.py`: fresh run initialization, step start/complete/fail/block events, automatic durations, run completion/failure/block state, and activity cleanup.
- Provider-neutral Coordinator contract now requires lifecycle telemetry for meaningful repository work and requires observed runtime model attribution.
- `/observability/` flow rendering now follows the actual published step list, so simple runs no longer fabricate Scout/JOIN nodes and complex runs can surface dynamic `scout-*` branches.
- Information Architecture refactored: Section 06 Workstation removed from homepage sequence; Observability promoted to top-level site navigation item.
- Reusable, data-driven AI Experiments gallery introduced at `/experiments/` (`site/experiments/index.html`) backed by declarative registry (`site/experiments/experiments.json`).
- First featured AI experiment case study published at `/experiments/scout/` (`site/experiments/scout/index.html`): documenting the Scout autonomous bookmark research pipeline (X API → Cloudflare Workers / Agents → Durable Objects SQLite → Workers AI GLM-4.7-Flash → Notion Knowledge Inbox).
- Observability telemetry hardened with cross-platform file locking (`msvcrt`/`fcntl` on `state/current-run.lock`), atomic writes with filesystem contention retries, `MAX_EVENTS = 200` bounding, hardened path/secret sanitization, and client-side stale-run detection.
- Observability V1.3 remote live publishing implemented: dedicated `scripts/publish_current_run.py` with WinSCP/OpenSSH SFTP transport, `--doctor`, `--dry-run`, `--deploy-static` commands, remote atomic replacement, credential masking, and complete failure isolation in `scripts/update_current_run.py`.
- Observability V1.2 automatic Coordinator telemetry SDK (`scripts/telemetry.py`) established with real-time progressive state updates, parallel Scout lifecycle tracking, step context managers, and non-blocking failure isolation.

## Current Strategic Direction

Primary positioning:
- **Data Analytics + AI Analytics**

Data Analytics remains the core foundation. AI is positioned as an extension of analytical work rather than replacing the analytics identity.

## Current AI Workstation Direction

Active themes & experiments:
- Local AI models
- Antigravity agent harness
- Live agent observability & telemetry
- Scout autonomous bookmark knowledge ingestion pipeline
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

## Infrastructure Escalation Policy

The project follows a lightweight infrastructure escalation rule:
- **Core Rule:** Use the simplest infrastructure that fits the current milestone. Upgrade hosting only when product requirements justify it.
- **Tier 1 (Current Static / cyber_Folks `/public_html/`):** Portfolio, static assets, client-side polling, and file-driven telemetry (`current-run.json`). Keep it simple; do not add infrastructure without concrete need.
- **Tier 2 (Cloudflare Workers / Agents):** Evaluate when milestones require lightweight public APIs, webhooks, serverless execution, or edge agent routing without managing a server. (Used in Scout AI experiment).
- **Tier 3 (VPS / Docker):** Evaluate when milestones require long-running processes, WebSockets, background workers, databases, MCP servers, or custom backend services.
- **Decision Rule:** Evaluate Tier 1 → Tier 2 → Tier 3 based on requirements, maintenance burden, reliability, and cost. The project is explicitly allowed to adopt external infrastructure when justified; current hosting is a baseline, not a permanent constraint.

## Project Memory Rule

- Chat/model memory may contain user preferences.
- Repository state files contain project truth.
- Agents should never trust stale chat history over current repository state.

## Update Policy

Update `state/project-state.md` only when meaningful project state changes.
