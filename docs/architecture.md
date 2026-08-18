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
| **Services / Expertise** | `#expertise` (`.services`) | CSS Grid + ScrollTrigger | Displays four core analytical competencies with hover and reveal states. |
| **Experience Map** | `.experience` | SVG Radar + Interactive DOM | Interactive orbit map connecting business questions with analytical solutions across disciplines. |
| **Approach & Process** | `#approach` (`.approach`) | CSS Timeline + State Manager | Four-step narrative flow (01 Understand, 02 Explore, 03 Explain, 04 Decide) with interactive question toggling. |
| **Warsaw Data Pulse** | `#pulse` (`.pulse`) | HTML5 Canvas 2D / SVG + Open-Meteo API | Real-time weather dashboard fetching 24h temperature and precipitation forecast for Warsaw with interactive scrub cursor. |
| **Work & Case Studies** | `.work` | Interactive Tabs + SVG Plots | Interactive case study selector with synchronized statistical mini-plots. |
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

### 3.2 Warsaw Data Pulse (Time-Series Engine)
The weather pulse module visualizes atmospheric conditions:
- **Data Model:** 24-hour continuous temperature (°C) and precipitation (mm) forecast arrays.
- **Dynamic X-Axis Ticks:** Analyzes canvas client width and calculates adaptive tick density (fewer ticks on narrow mobile viewports, full density on desktop) to prevent label overlap.
- **Scrubbing & Interaction:** `pointermove` tracker calculates nearest data index, positions SVG vertical guide line, and updates floating metric tooltip in real time.

---

## 4. External API Integration & Resiliency

### Open-Meteo API
- **Endpoint:** `https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&hourly=temperature_2m,precipitation&timezone=Europe%2FWarsaw`
- **Lifecycle & Fallback:**
  1. Asynchronous fetch executed on page initialization.
  2. Data parser extracts hourly arrays and derives relative timestamps.
  3. If network fails, API returns non-200, or payload is malformed, the engine seamlessly activates a built-in deterministic baseline fallback dataset.
  4. Status indicator reflects live state (`.is-ready`) or fallback state (`.is-fallback`).

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
