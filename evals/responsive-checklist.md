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

### Work in Practice (Commit Activity Matrix)
- [ ] Activity matrix fits smoothly within container across all mobile viewports without causing horizontal page overflow.
- [ ] Touch interaction / tap on day cells opens the day inspector without zooming or erratic viewport shifts.
- [ ] 4-item technical metadata strip wraps cleanly into single-column or 2-column cards on mobile.
- [ ] Recent public commits ledger wraps long commit messages cleanly without text overflow or clipped timestamps.

### Warsaw Data Pulse (Decision Timeline)
- [ ] 24-hour composite timeline scales responsively; dynamic X-axis tick reduction renders 3–4 clean time labels on mobile and 5–6 on desktop.
- [ ] Zero time-axis label overlap, clipping, or border truncation.
- [ ] 3-stage pipeline cards stack cleanly into single-column cards on screens $le 640	ext{px}$.
- [ ] Interactive touch scrub on the chart operates smoothly without capturing vertical page scroll.
