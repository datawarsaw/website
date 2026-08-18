# Responsive Evaluation Checklist

Use this checklist during QA and code reviews to verify layout integrity, touch responsiveness, and visual fidelity across all target breakpoints.

---

## Target Breakpoints

- [ ] **Mobile Compact (375px × 667px):** iPhone SE / small Android handsets.
- [ ] **Mobile Standard (390px × 844px):** iPhone standard modern viewport.
- [ ] **Mobile Large (430px × 932px):** iPhone Pro Max / wide modern smartphones.
- [ ] **Desktop Baseline (1440px × 900px):** Standard desktop laptop / monitor viewport.

---

## Global Verification Items

- [ ] **No Horizontal Overflow:** `document.documentElement.scrollWidth === window.innerWidth` across all breakpoints (no unintentional horizontal scrollbars).
- [ ] **Typography Readability:** All heading, body, and monospace telemetry text remain crisp, legible, and proportionate without awkward word breaks.
- [ ] **Touch Targets:** Interactive buttons, nav links, and tabs have $ge 44\text{px}$ effective hit areas on mobile.
- [ ] **Zero Overlap:** No colliding text, overlapping buttons, or clipped bounding boxes.
- [ ] **Desktop Stability:** Mobile adjustments do not unintentionally alter desktop margins, padding, or alignment.

---

## Component-Specific Verification

### Hero Graph
- [ ] Canvas scales smoothly to full container width while maintaining square aspect ratio.
- [ ] Telemetry axis labels (X/Y coordinates, status badges) remain fully visible without clipping.
- [ ] Pointer tracking and 3D CSS perspective are disabled cleanly on screens $le 900\text{px}$.

### Experience Map (Radar)
- [ ] SVG radar circle is visually centered within its container on all mobile viewports.
- [ ] Active discipline description and key metrics stack neatly without overlapping the radar axes.
- [ ] No excessive vertical dead-space or collapsed section padding.

### Point of View & Process
- [ ] Chronological narrative order is preserved: `01 Understand` → `02 Explore` → `03 Explain` → `04 Decide`.
- [ ] Step numbers remain visually bound to their corresponding content headings on mobile.
- [ ] No desktop horizontal timeline connectors or wide column margins leaking into mobile layouts.

### Warsaw Data Pulse (Weather Chart)
- [ ] Dynamic X-axis tick reduction correctly renders 3–4 clean time labels on mobile and 6–8 on desktop.
- [ ] Zero time-axis label overlap or border truncation.
- [ ] Interactive touch drag on the chart operates smoothly without interrupting vertical page scrolling.
