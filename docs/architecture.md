# Technical Architecture

This document describes the software architecture, rendering pipelines, runtime lifecycles, and component interactions of the Data Warsaw web application.

---

## 1. High-Level Architecture Overview

Data Warsaw is architected as a high-performance, single-page and multi-route vanilla web application with zero runtime framework dependencies (no React, Vue, or build-step bundler).

The application is structured into core layers:
1. **Semantic DOM Layer (`site/index.html`, `site/observability/index.html`, `site/experiments/index.html`, `site/experiments/scout/index.html`):** Structured accessible markup with aria roles, metadata, and progressive enhancement anchors.
2. **Design System & Layout Engine (`site/styles.css`, `site/observability/styles.css`, `site/experiments/styles.css`):** CSS custom properties, grid/flex layouts, responsive stages, and media-query breakpoints.
3. **Motion & Interaction Orchestrator (`site/script.js` + GSAP):** Timeline sequencing, scroll triggers, active state toggling, and user interaction management.
4. **Rendering Engines (`site/script.js` Canvas 2D / SVG):** Projective 3D analytical hero graph renderer and responsive time-series weather chart renderer.
5. **Observability & Telemetry Pipeline (`state/current-run.json` → `site/data/current-run.json` → `site/observability/`):** Real-time execution flow graph and live agent lifecycle streaming.
6. **Data-Driven AI Experiments Layer (`site/experiments/experiments.json` → `site/experiments/`):** Declarative metadata registry powering modular case studies and prototype listings.

These public website files live only under `site/`. That directory is the deployment source for the server's `/public_html/`; harness, docs, and other repository files stay outside it.

---

## 2. Site Structure & Routes

| Route | Source Directory | Primary Technology | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| `/` | `site/index.html` | HTML5, CSS3, GSAP, Canvas 2D | Main homepage showcasing editorial profile, analytical expertise radar, process narrative, open-source commit matrix, and 24h Warsaw weather pulse. |
| `/observability/` | `site/observability/` | HTML5, CSS3, Polling, SVG Flow Graph | Live Agent Observability console streaming multi-agent execution trees, active model state, and chronological event logs. |
| `/experiments/` | `site/experiments/` | HTML5, CSS3, JSON Registry | AI Experiments gallery indexing deployed agents, orchestration harnesses, and analytical tools with category filtering. |
| `/experiments/scout/` | `site/experiments/scout/` | HTML5, CSS3, Responsive Diagram | Case study for the Scout autonomous X bookmark ingestion and evaluation pipeline running on Cloudflare Workers & GLM-4.7-Flash. |

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

## 5. External API Integration & Resiliency

- **Open-Meteo:** Forecast data is fetched asynchronously for Warsaw, parsed into the chart's hourly series, and replaced by a deterministic fallback when the request fails or the payload is malformed.
- **GitHub REST API:** Public repository activity is cached in session storage to reduce unauthenticated rate-limit pressure; the UI preserves useful static facts when the API is unavailable.
- **Observability telemetry:** The live console reads the sanitized `site/data/current-run.json` export and remains usable when the file is stale or temporarily unavailable.

---

## 6. Runtime Lifecycle & Performance Strategy

1. Intersection observers pause canvas and chart work when components leave the viewport.
2. The Page Visibility API halts rendering while the tab is hidden.
3. Canvas buffers are reused and device pixel ratio is capped at two to avoid unnecessary mobile memory pressure.
4. `prefers-reduced-motion` disables continuous loops and collapses transitions.
5. The experiments gallery uses a local JSON registry and a small progressive-enhancement script; each detail page remains a static route with no private runtime dependency.

---

## 7. Infrastructure Escalation Policy & Hosting Progression

The public site remains deployable as static HTML, CSS, JavaScript, JSON, and assets under `site/`. Use the simplest tier that fits the milestone:

- **Tier 1 — Static hosting:** Portfolio pages, public data files, client-side polling, and file-driven observability.
- **Tier 2 — Edge serverless and agents:** Lightweight APIs, scheduled agent work, webhooks, and stateful edge execution. Scout uses this tier independently of the local workstation.
- **Tier 3 — VPS / containers:** Long-running services, WebSockets, relational or vector databases, MCP servers, or workloads unsuitable for serverless execution.

Choose a higher tier only when product requirements justify its operational cost and maintenance burden. Secrets and private environment variables stay outside the public `site/` tree.

---

## 8. Headless CMS & Structured Content Architecture (`cms/`)

DataWarsaw separates application presentation from structured content using a headless CMS pattern:

```text
AI Agent / Editor (Sanity Studio / MCP)
      │
      ▼
Sanity Content Lake (oxemv355 / production)
      │ (Build-time Sync: scripts/sync_sanity_experiments.mjs)
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

### Operational & Backup Policy
- **Backup / Portability:** `npx sanity dataset export production export.ndjson --assets` creates full offline snapshots of documents and assets.
- **Resilience:** The browser first fetches the static build-time snapshot at `site/data/sanity-experiments.json` and falls back to `site/experiments/experiments.json` only if that local snapshot request fails, cannot be parsed, or has an invalid schema. An authoritative empty array `[]` is valid and does not trigger fallback.

### Automated Deployment Pipeline (Accepted, Pending Manual Wiring)
The accepted production deployment pipeline is:

```text
Sanity Content Lake (Publish / Update / Unpublish)
      │
      ▼ (Outgoing Sanity Webhook: coalesce(after()._type, before()._type) in ["experiment","technology","tag"])
Cloudflare Pages Deploy Hook (sanity-content)
      │
      ▼ (Build Command: node scripts/sync_sanity_experiments.mjs)
Deterministic Snapshot (site/data/sanity-experiments.json)
      │
      ▼ (Static Edge Output: site/)
Public Website (datawarsaw.com)
```

1. **Trigger Scope:** The content filter covers `experiment`, `technology`, and `tag` lifecycle events (`coalesce(after()._type, before()._type) in ["experiment","technology","tag"]`). Drafts and Versions/Releases remain disabled in the Sanity webhook settings, so draft-only edits do not trigger deploys.
2. **Build Verification:** Build fails with exit code 1 if Sanity sync fails, preserving the live production release.
3. **Secret Isolation:** The Cloudflare Pages Deploy Hook URL is stored strictly in the Sanity webhook settings and never committed to repository source code.
