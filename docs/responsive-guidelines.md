# Responsive Guidelines & Breakpoint Standards

This document specifies the responsive layout rules, required test viewports, and component-specific mobile handling for Data Warsaw.

---

## 1. Core Responsive Principle

> **Mobile is never a scaled-down desktop layout.**

Mobile viewports require intentional restructuring of spatial layouts, touch target ergonomics, typography scales, and information density rather than generic CSS downscaling or viewport zoom.

---

## 2. Mandatory Validation Viewports

Every layout change or new component must be validated across the following four target viewports:

| Viewport Category | Dimensions (Width × Height) | Representative Devices / Target Context |
| :--- | :--- | :--- |
| **Mobile Compact** | `375px × 667px` | iPhone SE, small Android handsets |
| **Mobile Standard** | `390px × 844px` | iPhone 12/13/14/15 standard |
| **Mobile Large** | `430px × 932px` | iPhone 14/15 Pro Max, large modern smartphones |
| **Desktop Baseline** | `1440px × 900px` | Standard laptop and desktop monitors |

---

## 3. Global Quality Criteria (All Viewports)

- **Zero Horizontal Overflow:** `document.documentElement.scrollWidth` must equal `window.innerWidth`. No element may bleed beyond the horizontal viewport.
- **Typography & Label Legibility:** Text must never drop below readable thresholds, clip inside bounding containers, or suffer unintended line breaks.
- **No Overlapping Elements:** Interactive targets and textual labels must maintain clear spatial clearance without collision.
- **Desktop Preservation:** Responsive adjustments targeting mobile screens must never alter or compromise desktop layout geometry.

---

## 4. Component-Specific Mobile Rules

### 4.1 Hero Graph
- **Perspective & Interaction:** On mobile screens ($le 900\text{px}$) and touch devices, 3D CSS perspective and pointer parallax tracking are disabled to prevent CPU/battery overhead and erratic touch-scroll behavior.
- **Framing & Aspect Ratio:** Hero canvas retains square aspect ratio (`1:1`), scaling cleanly to container width without clipping telemetry axis markers.

### 4.2 Experience Map (Radar & Orbit)
- **Centering:** The multi-axis SVG radar must remain visually centered in the mobile container.
- **Information Architecture:** Active metric details and commercial narratives render in a clean stacked layout below or within the orbit bounds without colliding.
- **Spacing Stability:** Avoid excessive empty vertical gaps or collapsed sections on narrow viewports.

### 4.3 Point of View & Process
- **Narrative Sequence:** Retain strict canonical order:
  1. `01 Understand`
  2. `02 Explore`
  3. `03 Explain`
  4. `04 Decide`
- **Step Connectivity:** Mobile step markers must remain anchored directly to their corresponding descriptive blocks.
- **Timeline Rhythm:** Desktop horizontal timeline layout rules and wide column margins must not leak into mobile single-column layouts.

### 4.4 Warsaw Conditions / Weather Pulse
- **Adaptive Axis Tick Density:** The X-axis time scale dynamically computes tick density based on available screen width (e.g. 3–4 ticks on compact mobile vs 7–8 ticks on desktop) to prevent overlapping hour labels.
- **Touch Ergonomics:** The interactive scrub area must respond fluidly to horizontal touch drags without capturing or jamming vertical page scrolling.
- **Metrics Hierarchy:** Current condition badges, temperature readouts, and status indicators must stack cleanly above the chart on narrow viewports.
