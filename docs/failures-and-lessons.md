# Failures & Engineering Lessons

This document captures confirmed lessons, historical layout regressions, and concrete failure patterns encountered during the evolution of the Data Warsaw codebase.

---

## 1. Desktop Min-Height Leakage into Mobile Radar (Experience Map)

### Symptom & Root Cause
Applying explicit desktop height constraints (e.g. `min-height: 675px` or fixed large aspect ratios) at the container level caused severe mobile regressions. On mobile viewports (375px–430px), the radar SVG was forced into disproportionate vertical space, creating huge dead-space gaps above and below the diagram while pushing narrative text offscreen.

### Concrete Fix & Rule
- Reset `min-height` to `auto` on mobile media queries ($le 900\text{px}$).
- Let container height derive naturally from the centered SVG radar diameter plus structured vertical content padding.
- Always check that vertical spacing remains proportional to screen height.

---

## 2. Desktop Multi-Column Timeline Margins Leaking into Mobile Process

### Symptom & Root Cause
The Point of View & Process section (`01 Understand` → `02 Explore` → `03 Explain` → `04 Decide`) initially shared desktop grid timeline margins and horizontal absolute offsets. When rendered on narrow viewports, step markers became visually detached from their corresponding explanatory text, resulting in confusing narrative flow and horizontal overflow.

### Concrete Fix & Rule
- Use clean vertical stack flow on mobile screens with dedicated mobile timeline markers.
- Anchor step numbers (`01`, `02`, etc.) directly above or inline with their header titles.
- Isolate desktop horizontal connector CSS within `@media (min-width: 901px)`.

---

## 3. Fixed X-Axis Tick Intervals on Mobile Weather Pulse

### Symptom & Root Cause
Using a fixed time step (e.g. displaying 6 or 8 static timestamps across the 24-hour weather curve) caused catastrophic text overlap on narrow 375px screens. The hour labels collided horizontally and clipped against canvas borders.

### Concrete Fix & Rule
- Compute X-axis tick interval dynamically based on rendered canvas width (`clientWidth / targetTickSpacing`).
- Render 3–4 evenly spaced ticks on mobile screens and 6–8 ticks on wide desktop displays.
- Enforce label truncation safety margins at the left (0%) and right (100%) bounds of the chart.

---

## 4. Uncapped DPR in Canvas Animation Loops

### Symptom & Root Cause
Initializing HTML5 Canvas backing buffers using raw `window.devicePixelRatio` on ultra-high-DPI mobile devices (e.g. 3x Retina screens) caused high memory consumption and GPU fill-rate throttling during continuous animation loops.

### Concrete Fix & Rule
- Cap DPR calculations globally to a maximum of 2: `Math.min(window.devicePixelRatio || 1, 2)`.
- Pause render loops via `IntersectionObserver` and the Page Visibility API whenever the element or tab is not actively viewed.

---

## 5. Empty GitHub Activity Grid Reads as Zero Work

### Symptom & Root Cause
An honest-but-empty 8-16 week matrix of lvl-0 cells, shown when the public GitHub API is unavailable, visually claims no commits rather than data unavailable.

### Concrete Fix & Rule
- If repository activity cannot be fetched, do not render day cells.
- Keep the public repository links and known static facts.
- State Live GitHub activity unavailable and hide the recent-commit ledger so no invented SHAs or empty activity remain on screen.
