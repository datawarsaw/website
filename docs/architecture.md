# Technical Architecture

This document describes the software architecture, rendering pipelines, runtime lifecycles, and component interactions of the Data Warsaw web application.

---

## 1. High-Level Architecture Overview

Data Warsaw is architected as a high-performance, single-page vanilla web application with zero runtime framework dependencies (no React, Vue, or build-step bundler). 

The application is structured into four core layers:
1. **Semantic DOM Layer (`index.html`):** Structured accessible markup with aria roles, metadata, and progressive enhancement anchors.
2. **Design System & Layout Engine (`styles.css`):** CSS custom properties, grid/flex layouts, CSS 3D stage perspectives, and media-query breakpoints.
3. **Motion & Interaction Orchestrator (`script.js` + GSAP):** Timeline sequencing, scroll triggers, active state toggling, and user interaction management.
4. **Rendering Engines (`script.js` Canvas 2D / SVG):** Projective 3D analytical hero graph renderer and responsive time-series weather chart renderer.

---

## 2. Major Page Sections & Components

| Section | Target Element ID | Rendering & Technology | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Hero** | `#top` (`.hero`) | HTML5 Canvas 2D + GSAP | Renders the projective 3-layer analytical scatter plot, trajectory curve, and decision node with damped pointer parallax. |
| **About** | `#about` (`.about`) | Semantic HTML + CSS | Communicates background, analytical philosophy, and business positioning. |
| **Experience Map** | `#experience` (`.experience`) | SVG Radar + Interactive DOM | Interactive multidimensional map connecting business questions with analytical solutions across 8 core axes. |
| **Approach & Process** | `#approach` (`.approach`) | CSS Timeline + State Manager | Four-step narrative flow (01 Understand, 02 Explore, 03 Explain, 04 Decide) with interactive question toggling. |
| **Work in Practice** | `#practice` (`.practice`) | SVG Matrix + GitHub REST API | Public working artifact showcase with unauthenticated commit matrix, real-time repository metadata, and commit ledger. |
| **Warsaw Data Pulse** | `#pulse` (`.pulse`) | SVG Timeline + Open-Meteo API | 24-hour analytical Decision Timeline plotting continuous temperature, precipitation, wind, AQI, and derived hourly outdoor suitability. |
| **Contact** | `#contact` (`.contact`) | Accessible Form + Status Indicator | Direct reach-out channel with project availability status. |

---

## 3. Visualization Engines

### 3.1 Hero Graph (Projective Canvas 2D)
The hero graph visualizes the journey from data complexity to clear decision making:
- **Geometry & Spatial Depth:**
  - 38 scattered signal points distributed across three discrete depth planes ($z \in [-56, -32]$, $z \in [-12, +12]$, $z \in [+28, +52]$).
  - An elevated central Decision Node positioned at $z = +45$.
  - A cubic Bézier curve projecting from background noise through to the decision focal point.
- **Camera & Perspective Transformation:**
  - Uses an analytical 3D-to-2D perspective projection model ($x' = x \cdot s + x_0$, $y' = y \cdot s + y_0$, where scale factor $s = d / (d - z)$).
  - Damped yaw/pitch rotation and viewport-normalized camera offset driven by pointer movement with exponential smoothing ($k = 0.055$).
- **Visual Depth Cues:**
  - Layer-dependent point alphas, scale, and connection line weights.
  - Decision node rendering with floor occlusion shadow, lime radiance glow, outer telemetry orbits, and specular core bead.

### 3.2 Work in Practice Matrix Engine
Visualizes repository commit activity:
- **Data Model:** Direct public commit history on `datawarsaw/website` grouped by calendar date.
- **Geometry:** 7-row by 16-week grid rendered via dynamic SVG with discrete intensity levels (0, 1, 2, 3+ commits/day) in dark graphite and acid-lime.
- **Interactivity:** Pointer hover, click, and keyboard focus update the live Inspector panel with date, commit count, and commit message.

### 3.3 Warsaw Data Pulse (Decision Timeline Engine)
Visualizes atmospheric conditions and derived suitability:
- **Data Model:** 24-hour continuous temperature (°C), precipitation probability (%), wind speed (km/h), and European AQI series.
- **Derived Suitability Formula:** Deterministic outdoor score: `clamp(1 - (max(0, rain-35)/65 + max(0, aqi-60)/60 + max(0, wind-30)/40), 0, 1)`.
- **Best Window Highlight:** Evaluates all 3-consecutive-hour windows (06:00–19:00 daytime) and bounds the optimal window with an animated acid-lime frame.
- **Interaction:** Scrub tracker calculates active hour index, updates live metric pills, and positions the floating precision tooltip.

---

## 4. External API Integration & Resiliency

### Open-Meteo API
- **Endpoint:** `https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&hourly=temperature_2m,precipitation&timezone=Europe%2FWarsaw`
- **Lifecycle & Fallback:**
  1. Asynchronous fetch executed on page initialization.
  2. Data parser extracts hourly arrays and derives relative timestamps.
  3. If network fails, API returns non-200, or payload is malformed, the engine seamlessly activates a built-in deterministic baseline fallback dataset.
  4. Status indicator reflects live state (`.is-ready`) or fallback state (`.is-fallback`).

### GitHub REST API (Public & Unauthenticated)
- **Endpoints:**
  - `https://api.github.com/repos/datawarsaw/website`
  - `https://api.github.com/repos/datawarsaw/website/commits?per_page=100`
- **Lifecycle & Cache:**
  1. Session-cached in `sessionStorage` (10 min TTL) to avoid unauthenticated IP rate limiting (60 req/hr).
  2. Extracts branch, language, push timestamp, and commit date arrays.
  3. If rate-limited or offline, gracefully reveals technical facts and static fallback state with zero layout shift or crash.

---

## 5. Runtime Lifecycle & Performance Strategy

1. **IntersectionObserver Management:**
   - Both the Hero Canvas and the Weather Pulse canvas are attached to `IntersectionObserver` instances.
   - When a component scrolls out of the visible viewport, its `requestAnimationFrame` loop and internal timers are paused.
2. **Page Visibility API:**
   - Listens for `visibilitychange` events on `document` to halt CPU rendering when the user switches tabs or minimizes the window.
3. **Zero Per-Frame Allocations:**
   - Point buffers, projected coordinate structures, and vector arrays are pre-allocated during initialization and window resize events, preventing GC pauses during animation.
4. **Device Pixel Ratio (DPR) Capping:**
   - Canvas resolution uses `Math.min(window.devicePixelRatio || 1, 2)` to prevent memory blowup and fill-rate throttling on ultra-high-DPI mobile screens.
5. **Reduced Motion Compliance:**
   - Detects `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - Halts continuous animation loops, renders static representations of all graphs, and sets CSS transitions to zero duration.
