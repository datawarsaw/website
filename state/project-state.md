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

## Current Strategic Direction

Primary positioning:
- **Data Analytics + AI Analytics**

Data Analytics remains the core foundation. AI is positioned as an extension of analytical work rather than replacing the analytics identity.

## Current AI Workstation Direction

Active themes & experiments:
- Local AI models
- Antigravity agent harness
- Model benchmarking
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

## Update Policy

Update `state/project-state.md` only when meaningful project state changes, such as:
- Harness architecture changes
- Active branch strategy changes
- Deployment strategy changes
- Major site component reaches a new stable state
- Primary runtime/model behavior changes
- Strategic project direction changes

Do not update for routine commits, small CSS tweaks, or typo fixes.
