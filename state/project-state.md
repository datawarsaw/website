# DataWarsaw Project State

## Current Production Source of Truth

Branch: `main`
Platform: **Cloudflare Pages** (`datawarsaw-site`)
Canonical Domain: `https://datawarsaw.com`

## Public Site Root

`site/` (static assets) + `functions/` (Cloudflare Pages Functions)

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

## Current Website & Infrastructure State

Main completed recent improvements:
- **Cloudflare-Native Production Architecture:** Entire site runs on Cloudflare Pages with automatic GitHub `main` deployments and Sanity CMS build-time synchronization (`node scripts/sync_sanity_experiments.mjs`).
- **Cloudflare Edge Normalization:** `www.datawarsaw.com` and `datawarsaw-site.pages.dev` redirect to apex `https://datawarsaw.com` with full path and query preservation (HTTP 301).
- **Cloudflare D1 & Pages Functions Observability (V2.0):** Live Agent Observability runs on `functions/api/telemetry.ts` backed by Cloudflare D1 database (`datawarsaw-telemetry-db`, table `telemetry_state`, singleton row `id=1`).
- **HTTPS Telemetry Publishing:** `scripts/publish_current_run.py` rewritten to use Python standard library HTTPS POST with Bearer token authentication, bounded retries, and failure isolation.
- **Adaptive Frontend Telemetry Client:** `site/observability/script.js` polls `/api/telemetry` adaptively (2s active, 10s idle), pauses when `document.hidden`, suppresses unchanged render cycles via hash checks, and falls back cleanly to static `site/data/current-run.json`.
- **cyber_Folks Hosting RETIRED:** Legacy cPanel hosting and SFTP/WinSCP transport are decommissioned. The DNS record `ftp.datawarsaw.com` was deleted. DNS audit confirmed zero remaining MX/mail or legacy dependencies. Legacy SFTP publisher functions remain strictly as deprecated rollback-only code.
- **Headless Sanity CMS Integration:** AI Experiments gallery backed by Sanity Content Lake (`oxemv355`, dataset `production`), synced deterministically at build time to `site/data/sanity-experiments.json` with static fallback to `site/experiments/experiments.json`.
- **Weather Timeline & Analytical Radar:** 24h Warsaw weather pulse and 8-axis differentiated expertise radar.
- **GitHub Commit Activity:** Public DataWarsaw commit ledger and responsive activity matrix.

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

## Production Deployment & Hosting Policy

- **Production Branch:** `main` deploys automatically to Cloudflare Pages (`datawarsaw-site`).
- **Edge Routing:** Managed via Cloudflare Rulesets and Custom Domains on the `datawarsaw.com` zone.
- **Secrets Management:** `TELEMETRY_SECRET_TOKEN` is configured strictly as a Cloudflare Pages Production Environment Variable / Secret. `DATAWARSAW_TELEMETRY_TOKEN` is stored in the local workstation environment. No secrets exist in git or public client code.
- **Zero-Cost Operation:** Entire stack operates securely within Cloudflare Pages Free, Cloudflare D1 Free, and Sanity Free tiers.

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
