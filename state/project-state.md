# Project State

## Identity
- Project: DataWarsaw
- Purpose: Personal and business portfolio, AI experiments platform, and live AI workstation telemetry.
- Repository / source folder: `C:\AI\datawarsaw`
- Production or runtime location: Cloudflare Pages (`datawarsaw-site`) with canonical domain `https://datawarsaw.com` (apex domain).

## Current Status
- Overall technical state: Production live on Cloudflare Pages with Cloudflare D1 telemetry backend, Sanity Studio v6 CMS integration, and responsive static frontend.
- Last verified date: 2026-08-26
- Last verified technical revision: `548ad88`
- Verification environment: Windows 11 (Node v24.19.0, Python 3.10.11, Cloudflare Pages runtime compatibility, Sanity Studio 6.x).

## Architecture
- Static frontend: Vanilla HTML5 / CSS3 / ES Modules with Canvas 2D hero visualization, responsive CSS grid/flexbox, GSAP animations, Open-Meteo weather client, and GitHub activity component (`site/`).
- Observability backend (V2.0): Cloudflare Pages Functions (`functions/api/telemetry.ts`) backed by Cloudflare D1 SQLite database (`datawarsaw-telemetry-db`, table `telemetry_state`, singleton row `id=1`).
- Telemetry publishing: HTTPS telemetry publisher (`scripts/publish_current_run.py`) pushing authenticated JSON telemetry from local runner (`scripts/update_current_run.py`) to `/api/telemetry` with fallback to static `site/data/current-run.json`.
- Headless CMS: Sanity Studio (`cms/`) managing AI experiment records, synced at build-time to `site/data/sanity-experiments.json` with static fallback `site/experiments/experiments.json`.
- For complete component boundaries, diagrams, and architectural decisions, see `docs/architecture.md` and `docs/decisions.md`.

## Runtime Requirements
- Node.js >= 20 (v24.19.0 verified)
- Python >= 3.10 (with standard library `http.server`, `urllib.request`, `sqlite3`, `msvcrt`/`fcntl`)
- Cloudflare Pages Functions & Cloudflare D1
- Sanity CLI / Studio (`@sanity/cli`, `sanity` v6.10+)
- Browser runtime supporting Canvas 2D, CSS custom properties, and modern fetch.

## Verified Capabilities
- Static Web & AI Experiments Gallery: **VERIFIED** — responsive across 375px, 390px, 430px, 1440px with Sanity CMS build sync.
- Canvas 2D Hero & Weather Pulse: **VERIFIED** — dynamic Warsaw weather timeline and differentiated 8-axis expertise radar.
- Observability V2.0 Telemetry (Cloudflare Native): **VERIFIED** — `functions/api/telemetry.ts` D1 upsert, HTTPS publisher, adaptive frontend polling (2s active / 10s idle / visibility pause), and fail-safe static fallback.
- Sanity CMS Schema & Sync: **VERIFIED** — TypeScript typechecking (`cms/`) and sync script (`scripts/sync_sanity_experiments.mjs`).
- Telemetry Lifecycle & Multi-Process Safety: **VERIFIED** — cross-platform file locking (`state/current-run.lock`), atomic state persistence, 200-event bounding, and token redaction.

## Known Limitations / Broken State
- Legacy cyber_Folks cPanel SFTP hosting is decommissioned; SFTP publisher options in `scripts/publish_current_run.py` are deprecated rollback shims only.
- D1 telemetry database uses singleton row `id=1` optimized for single-agent-run monitoring, not long-term historical event warehousing.
- Subagent harness model attribution is dynamically resolved and may inherit runtime defaults rather than explicit model pins.

## Interfaces / External Dependencies
- Cloudflare Pages (`datawarsaw-site`) & Cloudflare D1 (`datawarsaw-telemetry-db`)
- Cloudflare Apex DNS & Edge Redirects (`www.datawarsaw.com` -> `https://datawarsaw.com`)
- Sanity Content Lake (`projectId: oxemv355`, dataset: `production`)
- Open-Meteo API (`api.open-meteo.com`)
- Environment variables: `DATAWARSAW_TELEMETRY_TOKEN` (local client), `TELEMETRY_SECRET_TOKEN` (Cloudflare Pages environment secret), `DATAWARSAW_REMOTE_OBSERVABILITY` (flag).

## Validation
- Observability & Telemetry Test Suite: `python evals/verify_observability_hooks.py` (19 deterministic tests covering lifecycle, multi-threading, failure isolation, token redaction, mock HTTPS server, and D1 contract).
- Frontend Observability Tests: `node evals/test_frontend_observability.mjs` (adaptive polling, hash deduplication, visibilitychange listeners, fallback handling).
- CMS Schema Typecheck: `npm --prefix cms run typecheck` (`tsc --noEmit`).
- Experiments Runtime Tests: `node evals/test_experiments_runtime.mjs` and `node evals/test_sync_failure.mjs`.

## Current Work
- Task: Implement Project State Standard v1 rollout across active repositories.
- Status: IN_PROGRESS
- Branch: `codex/project-state-standard-v1`
- Next technical action: Verify CMS typecheck and observability suite pass cleanly, then finalize structured closeout.

## Source-of-Truth Pointers
- Repository Agent Instructions: `AGENTS.md`
- Architecture & Boundaries: `docs/architecture.md`
- Architectural Decisions: `docs/decisions.md`
- Closeout Contract: `docs/white-gull-closeout-contract.md`
- Failure Lessons: `docs/failures-and-lessons.md`
- Responsive Guidelines: `docs/responsive-guidelines.md`

## Update Contract
Update `state/project-state.md` when a completed implementation task materially changes any of:
- architecture
- runtime
- verified capabilities
- dependencies
- limitations / broken state
- deployment state
- interfaces / integrations
- configuration contract
- operational behavior

Do not update it for routine commits, typo fixes, conversational prompts or transient debugging.
A task MUST NOT report `STATUS: COMPLETE` when technical truth changed and the relevant `state/project-state.md` remains stale.

## Codex Closeout Contract
Use exactly one of:

```text
PROJECT_STATE_UPDATED
YES
Files:
- <path>
```
or:
```text
PROJECT_STATE_UPDATED
NOT_REQUIRED
Reason: <why technical truth did not change>
```

`NO` is not a valid closeout value.

For Notion:
```text
NOTION_UPDATED
YES | NO_ACCESS | NOT_REQUIRED
Item/status: <...>
```
Never claim `YES` unless the corresponding Notion write actually occurred.
