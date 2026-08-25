# Technical Architecture

This document describes the software architecture, rendering pipelines, runtime lifecycles, and component interactions of the Data Warsaw web application.

---

## 1. High-Level Architecture Overview

Data Warsaw is architected as a high-performance, single-page and multi-route web application hosted natively on **Cloudflare Pages** with zero runtime UI framework dependencies (no React, Vue, or client-side bundler).

The application is structured into core layers:
1. **Semantic DOM Layer (`site/index.html`, `site/observability/index.html`, `site/experiments/index.html`, `site/experiments/scout/index.html`):** Structured accessible markup with aria roles, metadata, and progressive enhancement anchors.
2. **Design System & Layout Engine (`site/styles.css`, `site/observability/styles.css`, `site/experiments/styles.css`):** CSS custom properties, grid/flex layouts, responsive stages, and media-query breakpoints.
3. **Motion & Interaction Orchestrator (`site/script.js` + GSAP):** Timeline sequencing, scroll triggers, active state toggling, and user interaction management.
4. **Rendering Engines (`site/script.js` Canvas 2D / SVG):** Projective 3D analytical hero graph renderer and responsive time-series weather chart renderer.
5. **Observability & Telemetry Pipeline (`functions/api/telemetry.ts` + Cloudflare D1 + `site/observability/`):** Serverless edge API, singleton D1 database state, authenticated HTTPS telemetry ingress, and real-time frontend execution streaming with static fallback.
6. **Data-Driven AI Experiments Layer (`cms/` → `site/data/sanity-experiments.json` → `site/experiments/`):** Headless Sanity CMS Content Lake synchronized deterministically at build time into static JSON snapshots.

Public website assets live exclusively under `site/`, and edge functions live under `functions/`.

---

## 2. Site Structure & Routes

| Route | Source Directory | Primary Technology | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| `/` | `site/index.html` | HTML5, CSS3, GSAP, Canvas 2D | Main homepage showcasing editorial profile, analytical expertise radar, process narrative, open-source commit matrix, and 24h Warsaw weather pulse. |
| `/observability/` | `site/observability/` | HTML5, CSS3, Adaptive Polling, SVG Flow Graph | Live Agent Observability console streaming multi-agent execution trees, active model state, and chronological event logs. |
| `/experiments/` | `site/experiments/` | HTML5, CSS3, JSON Registry | AI Experiments gallery indexing deployed agents, orchestration harnesses, and analytical tools with category filtering. |
| `/experiments/scout/` | `site/experiments/scout/` | HTML5, CSS3, Responsive Diagram | Case study for the Scout autonomous X bookmark ingestion and evaluation pipeline running on Cloudflare Workers & GLM-4.7-Flash. |
| `/api/telemetry` | `functions/api/telemetry.ts` | Cloudflare Pages Function, D1, TypeScript | Authenticated HTTPS telemetry ingress (`POST`) and public telemetry egress (`GET`) with `no-store` cache headers. |

---

## 3. Major Page Sections & Components

| Section | Target Element ID | Rendering & Technology | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Hero** | `#top` (`.hero`) | HTML5 Canvas 2D + GSAP | Renders the projective 3-layer analytical scatter plot with interactive cursor tilt and lime decision trajectory. |
| **About** | `#about` (`.about`) | Semantic CSS Grid | Editorial lockup, typography contrast, professional positioning, and verified external profiles. |
| **Experience Map** | `#experience` (`.experience`) | Inline SVG Radar + HTML Buttons | Calibrated 8-axis proficiency radar on a 1–10 scale with interactive hover/selection previews. |
| **Process** | `#approach` (`.approach`) | Responsive 4-Step Track | Sequential narrative (01 Understand → 02 Explore → 03 Explain → 04 Decide) with contextual business question toggle. |
| **Work in Practice** | `#practice` (`.practice`) | GitHub API Client + CSS Grid | Public DataWarsaw commit heatmap, daily activity inspector, and recent repository commit ledger. |
| **Data Pulse** | `#pulse` (`.pulse`) | Open-Meteo API + Inline SVG Chart | 24-hour temperature profile with interactive cursor scrubbing, European AQI / rain / wind gates, and outdoor window recommendation. |
| **Contact** | `#contact` (`.contact`) | Semantic Form / Lockup | High-contrast lime call-to-action with direct email and verified organization channels. |

---

## 4. Visualization Engines

### 4.1 Hero Graph (Projective Canvas 2D)
The hero graph visualizes the journey from data complexity to clear decision making:
- Three depth planes of scattered signal points and an elevated central decision node.
- A cubic Bézier trajectory projects from background noise through to the decision focal point.
- Damped yaw/pitch rotation and viewport-normalized pointer parallax provide restrained interaction.
- Reduced-motion mode renders a complete static state and disables continuous animation.

### 4.2 Work in Practice Matrix Engine
The practice section groups public repository commits by calendar date in a responsive SVG matrix. Hover, click, and keyboard focus update the inspector with date, commit count, and message; rate limits and offline states use deterministic fallback content.

### 4.3 Warsaw Data Pulse
The weather section renders a 24-hour temperature timeline and derives outdoor suitability from rain, wind, and AQI signals. Forecast timestamps come directly from the returned series, while malformed or unavailable responses use the established fallback dataset.

---

## 5. Live Observability & Telemetry Pipeline

DataWarsaw operates a Cloudflare-native live telemetry pipeline:

```text
Local AI Workstation (Coordinator / Subagents)
      │ (save_state lifecycle trigger)
      ▼
scripts/publish_current_run.py (Python HTTPS POST with Bearer token)
      │
      ▼
https://datawarsaw.com/api/telemetry (Cloudflare Pages Function: functions/api/telemetry.ts)
      │ (Authenticates against TELEMETRY_SECRET_TOKEN & validates schema)
      ▼
Cloudflare D1 Database (datawarsaw-telemetry-db: table telemetry_state, row id=1)
      │
      ▼ (Public GET /api/telemetry with Cache-Control: no-store; fallback to site/data/current-run.json)
Observability Console (site/observability/script.js)
      │ (Adaptive polling: ~2s active / ~10s idle; pauses on document.hidden)
      ▼
Live Mission Control UI (/observability/)
```

### Ingress & Egress API (`functions/api/telemetry.ts`)
- **POST `/api/telemetry`:**
  - Authenticates requests via `Authorization: Bearer <TELEMETRY_SECRET_TOKEN>`.
  - Rejects unauthenticated or malformed requests with HTTP 401/415.
  - Enforces a 128KB payload size limit.
  - Validates telemetry schema (`taskId`, `status`, `updatedAt`).
  - Upserts the sanitized payload into D1 table `telemetry_state` at singleton row `id=1`.
  - Never logs authorization tokens or payload secrets.
- **GET `/api/telemetry`:**
  - Publicly accessible edge endpoint.
  - Queries D1 row `id=1` and returns live JSON with `Cache-Control: no-store, no-cache, must-revalidate` and `X-Content-Type-Options: nosniff`.
  - If D1 has no telemetry record yet, returns HTTP 404 with structured JSON (`{"fallback": true}`) allowing the frontend to fall back to the static snapshot.

### Storage Engine (Cloudflare D1)
- **Database:** `datawarsaw-telemetry-db`
- **Binding Name:** `DB`
- **Schema:**
  ```sql
  CREATE TABLE IF NOT EXISTS telemetry_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL
  );
  ```
- Singleton row pattern ensures zero unbounded storage growth, eliminates rate limit bottlenecks, and provides strong edge read-your-writes consistency.

### Local Publisher & Failure Isolation
- `scripts/publish_current_run.py` uses Python standard library (`urllib.request`) with bounded 5s timeout and 2 retries.
- Background execution in `scripts/telemetry.py` is fully isolated: remote network or authentication failures never block or fail the local agent task.
- Error diagnostics automatically redact bearer tokens and local filesystem paths.

### Frontend Client Resilience (`site/observability/script.js`)
- **Primary Source:** `/api/telemetry` with `cache: 'no-store'`.
- **Static Fallback:** `../data/current-run.json` (used automatically if the API is empty or unreachable).
- **Adaptive Polling:** Polls every ~2000ms while a run is active (`RUNNING`) and drops to ~10000ms when idle or completed (`IDLE`, `COMPLETE`, `FAILED`, `BLOCKED`).
- **Tab Visibility:** Automatically pauses polling when the tab is hidden (`document.hidden`) and resumes immediately on `visibilitychange`.
- **Render Suppression:** Compares payload hashes to suppress redundant DOM re-renders when data is unchanged.

### Legacy SFTP / WinSCP Retirement Status
- **Status: RETIRED.**
- The legacy cyber_Folks cPanel hosting and SFTP transport are decommissioned.
- The DNS record `ftp.datawarsaw.com` has been permanently deleted.
- Legacy SFTP functions in `scripts/publish_current_run.py` are retained strictly as deprecated rollback-only code and are not used in active production.

---

## 6. External API Integration & Resiliency

- **Open-Meteo:** Forecast data is fetched asynchronously for Warsaw, parsed into the chart's hourly series, and replaced by a deterministic fallback when the request fails or the payload is malformed.
- **GitHub REST API:** Public repository activity is cached in session storage to reduce unauthenticated rate-limit pressure; the UI preserves useful static facts when the API is unavailable.
- **Live Observability Telemetry:** The console reads `/api/telemetry` from Cloudflare D1 with automatic fallback to `site/data/current-run.json`.

---

## 7. Production Hosting & Edge Routing Architecture

The entire Data Warsaw web application runs on **Cloudflare**:

```text
User Request
      │
      ├─── https://www.datawarsaw.com/* ──────── (Cloudflare Edge Bulk Redirect: 301) ───► https://datawarsaw.com/*
      │
      ├─── https://datawarsaw-site.pages.dev/* ─ (Cloudflare Edge Bulk Redirect: 301) ───► https://datawarsaw.com/*
      │
      ▼
https://datawarsaw.com (Canonical Custom Domain)
      │
      ├─── Static Assets & Pages (/*) ──────────► Cloudflare Pages (site/)
      │
      └─── Edge API (/api/telemetry) ───────────► Cloudflare Pages Functions + D1 (DB)
```

- **Canonical Domain:** `datawarsaw.com` (Proxied / Orange Cloud).
- **Edge Normalization:**
  - `www.datawarsaw.com` redirects to apex `https://datawarsaw.com` with full path and query preservation (HTTP 301).
  - `datawarsaw-site.pages.dev` redirects to apex `https://datawarsaw.com` with full path and query preservation (HTTP 301).
- **DNS Cleanliness:** Zero legacy records (no MX, SPF, mail hosts, or FTP records exist; the zone is clean and exclusively Cloudflare-managed).

---

## 8. Headless CMS & Structured Content Architecture (`cms/`)

DataWarsaw separates presentation from structured content using Sanity:

```text
AI Agent / Editor (Sanity Studio / MCP)
      │
      ▼
Sanity Content Lake (oxemv355 / production)
      │ (Build-time Sync: node scripts/sync_sanity_experiments.mjs)
      ▼
Static Snapshot (site/data/sanity-experiments.json)
      │ (Client fetch with /experiments/experiments.json fallback)
      ▼
DataWarsaw Frontend (/experiments/)
```

### Content Model & Schemas (`cms/schemaTypes/`)
1. **Document Types:**
   - `experiment`: Case study and prototype definitions (title, slug, number, subtitle, summary, narrative body via Portable Text, classification, lifecycle status, metrics, links, hero diagram, screenshots, and SEO).
   - `technology`: Relational stack library (name, slug, category, official URL, icon).
   - `tag`: Shared taxonomy tags (name, slug, description).
2. **Reusable Object Types:**
   - `seo`: Meta title, description, canonical URL, social share image, and `noIndex` toggle.
   - `metric`: Quantitative performance dimensions (label, value, unit, description, accent highlight).
   - `link`: Resource URLs with strict category classifications (repository, live demo, docs, research, external).
   - `blockContent`: Restrained Portable Text supporting paragraphs, headings (H2–H4), lists, quotes, inline code, callout boxes, code snippets, and diagrams with mandatory alt text.

### Operational & Deployment Policy
- **Build Verification:** The Cloudflare Pages build executes `node scripts/sync_sanity_experiments.mjs` before static deployment. If Sanity Content Lake synchronization fails, the build exits non-zero, immediately halting deployment and preserving the live production release.
- **Client Resilience:** The browser fetches `site/data/sanity-experiments.json` and falls back to `site/experiments/experiments.json` only if the primary snapshot fails or is invalid.
