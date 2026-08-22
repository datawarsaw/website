# Architecture & Design Decision Log (ADR)

This log records significant architectural, technical, and visual design decisions made for the Data Warsaw project, including the context, rationale, and consequences of each choice.

---

## ADR 001: Use Native Canvas 2D + GSAP for Spatial Hero Depth (Reject Three.js)

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Implement shallow spatial depth and pointer-driven parallax in the hero graph using a custom Canvas 2D projective 3D camera model combined with CSS perspective, rather than introducing Three.js or WebGL.

### Reason
The desired visual effect is a 2D analytical visualization with subtle spatial layering and restrained parallax, not an immersive 3D scene. Adding Three.js would introduce ~600KB+ of bundle overhead, WebGL context lifecycle complexity, GPU/battery drain on mobile, and unnecessary maintenance friction.

### Consequence
- Zero third-party bundle weight added.
- Smooth 60fps performance across all devices.
- Fully deterministic rendering and clean integration with existing GSAP timeline hooks.
- Preserves the exact mathematical aesthetic of the scatter points and trajectory curve.

---

## ADR 002: Dynamic X-Axis Tick Density for Mobile Weather Chart

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Dynamically calculate the number of X-axis time labels on the Warsaw Data Pulse chart based on the rendered container width (e.g. 3–4 ticks on compact mobile viewports vs 7–8 ticks on desktop).

### Reason
A static tick interval (e.g. every 3 hours) causes severe label overlap, text truncation, and visual clutter on narrow screens (375px–430px), rendering the time axis illegible.

### Consequence
- Clean, uncluttered time-axis labels across all screen sizes.
- Eliminates horizontal overflow and text collision issues on mobile.
- Requires minor dynamic step calculation during chart render/resize.

---

## ADR 003: Intentional Mobile Layout Refactoring (Anti-Scaling Principle)

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Explicitly disallow global viewport downscaling or naive percentage-scaling of desktop components on mobile. Restructure layout hierarchies per breakpoint.

### Reason
Downscaling desktop multi-column layouts results in tiny, unreadable typography, microscopic touch targets, and excessive empty vertical margins.

### Consequence
- Component structures (e.g. Experience Map, Process steps) re-flow into clean, single-column stacks on mobile.
- Touch targets remain $ge 44\text{px}$ for comfortable interaction.
- Higher CSS specificity and deliberate media queries required.

---

## ADR 004: Preservation of Restrained Editorial & Analytical Aesthetic

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Strictly preserve the dark graphite palette, acid-lime signal accents, editorial serif typography, and fine grid styling while explicitly banning generic SaaS templates, glassmorphism, heavy gradients, and neon glow.

### Reason
Data Warsaw is positioned as a bespoke high-level data consultancy and storytelling showcase. Generic SaaS visual tropes detract from intellectual rigor, analytical clarity, and brand distinction.

### Consequence
- Consistent, memorable brand presence.
- Strict design discipline required during any UI extension or refactoring.

---

## ADR 005: Website Source Repository Named website

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
The website source repository is named website.

### Reason
The GitHub account itself is now datawarsaw, so datawarsaw/website clearly distinguishes the website repository from the account/profile namespace.

### Consequence
- Website source lives at github.com/datawarsaw/website.
- datawarsaw/datawarsaw becomes available for the special GitHub profile README repository later.

---

## ADR 006: Removal of Redundant "What I Do" Services Section

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Remove section 02 "What I do" (`.services` / `#expertise`) completely from the narrative sequence.

### Reason
The section duplicated the core Process section (Analyze / Visualize / Explain / Improve vs Understand / Explore / Explain / Decide) without offering additional analytical or structural depth. Removing it tightens the editorial rhythm.

### Consequence
- Clean narrative flow: 01 About → 02 Experience map → 03 Process → 04 Work in Practice → 05 Warsaw Data Pulse → Contact.
- Navigation streamlined to: About · Practice · Approach · Let’s talk.
- Orphan `#expertise` anchors and dead styles eliminated.

---

## ADR 007: Work in Practice Section and Honest Public GitHub Data Strategy

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Replace fabricated case study metrics (+18%, 84%, 1.32) in section 04 with a live "Work in Practice" module backed directly by unauthenticated client-side GitHub REST API calls (`datawarsaw/website`).

### Reason
Fabricated case study metrics directly violate the evidence brief and credibility requirements of an analytical consultancy showcase. The website itself is the primary working artifact.

### Consequence
- Client-side unauthenticated fetching with session caching (`sessionStorage` 10 min TTL) prevents API rate-limiting.
- Custom Data Warsaw commit activity matrix styled in graphite cells with acid-lime intensity (never generic GitHub greens).
- Responsive reflow: renders 8 weeks on mobile (<=480px), 12 weeks on tablet (<=900px), and 16 weeks on desktop, rebuilding on debounced window resize.
- Date grouping converted in `Europe/Warsaw` timezone so evening commits do not shift calendar days.
- Honest degradation: when rate-limited or offline, displays public links, static technical facts, and an honest status placeholder rather than a false grid of zero-activity cells (no fake empty matrix, recent-commit ledger hidden).
- Interactive date inspector and compact recent commit ledger.

---

## ADR 008: Decision Timeline Architecture for Warsaw Data Pulse

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Rebuild Warsaw Data Pulse from four disconnected single-metric tabs into a single composed 24-hour horizontal analytical Decision Timeline that simultaneously plots raw conditions (24-column Rain, Wind, and AQI signal strip with friction highlights), continuous composite outdoor suitability (0–100%), temperature context, and highlights the optimal 3-hour window.

### Reason
A decision-making dashboard should answer immediately: "What are conditions doing?", "When is the best window?", "Why?", and "What should I do?" rather than requiring the user to switch across separate metric charts and perform mental arithmetic.

### Consequence
- Deterministic suitability formula: `suitability = clamp(1 - (rainPenalty + aqiPenalty + windPenalty), 0, 1)` documented and exposed.
- Single unified SVG timeline with glowing lime suitability area curve, dotted temperature context line, bounding best-window highlight, and a 24-column raw-signal strip under the chart for precipitation probability, wind speed, and European AQI.
- Interactive scrubbing, keyboard arrow navigation, and responsive tick reduction across all viewports.

---

## ADR 009: AI Workstation Benchmark, Explorer and Lab

- **Date:** 2026-08-18
- **Status:** Accepted

### Decision
Add three connected, client-only sections: a metric-switching benchmark, a task-based model explorer, and a cloud/local AI lab.

### Reason
The benchmark needs to communicate model differences through interaction rather than a static score dump. The explorer turns those signals into a practical recommendation with an explicit trade-off, while the lab explains cloud versus local experimentation without implying that an unavailable backend is live.

### Consequence
- The benchmark supports signal-bar and table views, metric selection, and strongest-model highlighting.
- Recommendations are deterministic and transparent: each task maps to a model and a stated trade-off.
- Ternary-Bonsai-27B is explicitly positioned as the local option; all lab states are labelled conceptual and send no requests.
- Mobile navigation traps focus while open, closes on Escape or navigation, and marks the main content inert to prevent background interaction.
