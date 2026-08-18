# Visual Regression & Motion QA Checklist

Use this checklist to ensure that the Data Warsaw aesthetic identity, motion fidelity, and performance standards remain intact after code changes.

---

## 1. Brand & Design System Consistency

- [ ] **Core Palette Integrity:** Background remains dark graphite (`#0b0c0e` / `#111215`), text uses warm paper tones (`#f7f6f1`), and acid-lime (`#c8ff3d`) is applied strictly to signal focal points.
- [ ] **No Generic SaaS Tropes:** Verified absence of glassmorphism, multi-color rainbow gradients, pill badges, and generic card boxes.
- [ ] **Typography Contrast:** Editorial headline serifs and technical monospace annotations maintain clear visual hierarchy.
- [ ] **Grid & Borders:** Delicate 1px borders with controlled alpha (`0.12`–`0.18`) and background grid pattern (`72px 72px`) are preserved.

---

## 2. Hero Graph Visual Identity & Spatial Depth

- [ ] **Composition Intact:** The analytical scatter points (38 signals), cubic Bézier trajectory curve, and central decision node remain recognizably identical.
- [ ] **Shallow Depth:** Spatial layering feels subtle and analytical, not like a heavy 3D game or generic WebGL demo.
- [ ] **Pointer Parallax:** Parallax responds with smooth exponential damping ($k = 0.055$) and returns smoothly to neutral on pointer exit without snapping.
- [ ] **Decision Node Geometry:** Elevated decision node displays soft occlusion shadow, outer telemetry orbits, and specular core bead.

---

## 3. Motion, Accessibility & Performance

- [ ] **Prefers-Reduced-Motion:** When `prefers-reduced-motion: reduce` is active:
  - Animation loops are halted immediately.
  - Complete static representations of the Hero Graph and Weather Pulse are rendered.
  - CSS transitions and animations are set to zero duration.
- [ ] **Viewport & Tab Pausing:** `requestAnimationFrame` loops pause automatically when elements are offscreen (`IntersectionObserver`) or when the tab is hidden (`visibilitychange`).
- [ ] **DPR Capped:** Canvas DPR is capped at 2 to prevent GPU memory pressure on high-density displays.
- [ ] **Zero Console Errors:** Browser developer console reports zero runtime exceptions, unhandled rejections, or 404 resource errors.
- [ ] **Layout Shifts (CLS):** Zero noticeable layout shift or flashing components during initial page load and asset rendering.

---

## 4. Work in Practice (GitHub Activity Showcase)

- [ ] **Discrete Intensity Styling:** Activity matrix uses dark graphite cell borders with acid-lime intensity (never generic GitHub green).
- [ ] **Inspector Fidelity:** Hovering or selecting any day cell dynamically reflects the correct commit count and message.
- [ ] **Honest Fallback State:** If offline or rate-limited, displays clean empty cells (level 0) and static project facts rather than fake intensity.

---

## 5. Live Data Pulse (Decision Timeline)

- [ ] **Live Data Indicator:** Status dot displays live beacon state (`.is-ready`) when Open-Meteo API succeeds, and fallback state (`.is-fallback`) when offline.
- [ ] **Composite Suitability Plot:** Glowing lime curve and area cleanly communicate the 0–100% outdoor suitability index across the 24-hour horizon.
- [ ] **Best Window Bounding Highlight:** Optimal 3-hour window is framed by an animated bounding highlight.
- [ ] **Graceful Fallback:** Status dot displays fallback indicator (`.is-fallback`) without breaking layout or throwing uncaught errors when offline or throttled.
