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
