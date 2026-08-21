# DataWarsaw Backlog

Lightweight, prioritized backlog for DataWarsaw development and AI Workstation initiatives.

---

## NOW

- [ ] Return focus toward Data Analytics + AI Analytics content
- [ ] Select the first substantial analytics-focused project

---

## NEXT

- [ ] Blog / Lab Journal
- [ ] Automated monthly sales commentary
- [ ] Power BI + AI integration

---

## BACKLOG

- [ ] V1.2 dynamic 0–4 Scout routing
- [ ] AI-assisted DAX / semantic model analysis
- [ ] Local Qwen Worker experiments
- [ ] LM Studio integration
- [ ] YouTube transcript → summary pipeline
- [ ] X/news feed → summary workflow
- [ ] Customer Segmentation Lab
- [ ] Balcony weather station analytics
- [ ] Family birthday tracker
- [ ] Witcher-related data/AI project

---

## RESEARCH

- [ ] MCP architecture for shared tools across models
- [ ] Quota-aware routing across GEM and CLA pools
  - *Concept:* `task complexity + available provider quota + model strength = routing decision` (record idea only; do not implement yet)

---

## FUTURE

- [ ] V2 multi-provider swarm (Gemini, GPT, Grok, Claude, Qwen)
- [ ] Common tooling layer usable across providers

---

## DONE

- [x] Separate public site files into `site/`
- [x] Simplify weather chart to temperature-only visualization
- [x] Weather recommendation Polish character encoding fix (UTF-8)
- [x] Differentiate Analytical Expertise radar scores to integer 1–10 scale
- [x] Public GitHub activity component aggregation & responsive container layout
- [x] Antigravity V1 agent harness specification and native subagent configuration
- [x] Ensure Coordinator reads current project state at task start
- [x] Model Benchmark Dashboard V1 (empirical model evaluation matrix; archived internally and removed from public site)
- [x] Live Agent Observability V1.1 (dedicated `/observability/` mission control page, file-driven live telemetry bridge, homepage teaser)
- [x] Coordinator lifecycle telemetry interface (`run-start`, step lifecycle, verification/run completion) and actual-flow observability rendering
- [x] Observability reliability consolidation (cross-platform file locking, atomic `os.replace` writes with retry, 200-event bounding, hardened sanitization, client-side stale detection, and deterministic test suite)
- [x] Technical SEO Baseline & Schema.org JSON-LD (Robots.txt, Sitemap.xml, Canonical parity, WebSite & Person metadata)
- [x] Local Sanity Studio & TypeScript Schema Foundation (`cms/` setup, `experiment`, `technology`, `tag`, `seo`, `metric`, `link`, `blockContent` schemas)
- [x] Sanity Free Cloud Project & Content Parity Migration (Project `oxemv355`, `production` dataset, hosted Studio deployed, 3 experiments published with 1:1 registry parity)
- [x] Automated Content Deployment Pipeline Architecture (Sanity published webhook → Cloudflare Pages Deploy Hook → `node scripts/sync_sanity_experiments.mjs`)
- [x] Cloudflare-Native Live Observability Migration (Pages Functions `/api/telemetry` + D1 `datawarsaw-telemetry-db` + HTTPS publisher + adaptive polling + static fallback)
- [x] Cloudflare Edge Routing & Apex Normalization (`www.datawarsaw.com` and `datawarsaw-site.pages.dev` 301 redirects to `datawarsaw.com`)
- [x] Decommission cyber_Folks hosting, delete legacy `ftp.datawarsaw.com` DNS record, and complete zero-dependency audit

---

## Update Policy

Update `state/backlog.md` when:
- A new meaningful idea is accepted.
- Task priority changes across sections.
- An item becomes active (moved to NOW / NEXT).
- An item is completed (moved to DONE).
- An item is intentionally dropped or archived.

Avoid turning this document into a verbose historical log; Git history remains the historical record of changes.
