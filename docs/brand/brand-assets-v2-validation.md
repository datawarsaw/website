# Brand Assets v2 — production validation

Date: 2026-09-21. Direction: **Variant D — smoother transitions**, selected by the owner. [CONFIRMED — OWNER DECISION]

## Authority and scope

Visual comparison used `brand-assets-v2-approved.png` (1448 × 1086), especially the large selected monogram, horizontal lockup and enlarged terminal detail. `brand-reference.png` and the approved Digital Brand v1 contract provided supporting context. No A/B/C geometry, automated raster tracing or image-generated lettering was used.

Only `site/assets/brand/` and `docs/brand/` changed. Public layout, Cockpit, Wiki, deployment configuration and brand tokens were not changed. No dependencies were installed. The review HTML and PNG are documentation, not runtime assets.

## Construction

| Asset | viewBox | Paths | Path endpoints¹ | Cubic control points |
| --- | --- | ---: | ---: | ---: |
| `wa-monogram.svg` | 0 0 432 240 | 5 | 49 | 24 |
| `wa-wordmark.svg` | 0 0 320 144 | 0; two live text lines | 0 | 0 |
| `wa-lockup-horizontal.svg` | 0 0 516 132 | 6; includes divider | 53 | 24 |
| `favicon.svg` | 0 0 32 32 | 5 | 42 | 10 |

¹ Counts M/L/H/V/C endpoints, including moves; Z closes to the existing start point. All paths use explicit absolute commands. [VERIFIED IN REPOSITORY]

The full master uses straight sloping strokes, cubic serif transitions, a continuous teal central stroke with a charcoal upper overlap, and a lime foreground diagonal. Eight units of transparent clearance surround the painted bounds. The lockup reuses identical master path attributes and the identical wordmark group, with uniform transforms; this identity was checked programmatically.

The compact derivative uses a 16-unit grid scaled by two. Its painted bounds are x=1…31, y=6…26 on a 32-unit canvas. Its taller silhouette, thicker connecting stroke, broader lime diagonal and one-pixel serif shelves at 16 px are optical corrections, not a new full-size mark.

The wordmark uses live text in the approved stack, beginning with Bodoni MT. Explicit 245/294-unit line measures use `spacingAndGlyphs`; installed fonts still determine letter shapes. Exact licensed brand family remains **TBD**. No font binaries or outlines were distributed.

## Refinement record

Initial render: five clean paths reproduced the board's broad proportions, W vertex, teal strokes, lime angle and serif flow. The reference's texture and pixel irregularities were excluded deliberately.

1. Compact correction: subpixel serif shelves were strengthened to one pixel at 16 px, and the connecting stroke/lime separator were widened. Rerendered both marks across the requested sizes.
2. Wordmark correction: browser font bounds crossed the original canvas despite visible capitals fitting. Added vertical clearance and propagated the same text group to the lockup. Repeated size renders.
3. Fallback correction: Palatino Linotype required additional top clearance. Final wordmark canvas is 320 × 144; all tested fallback bounds fit. Repeated final asset and size/surface renders.

Visual judgment, not a silhouette similarity score, governed comparison. The full mark retains the selected direction's serif character and overlap. The compact shape is intentionally blunter when enlarged; it is intended for 16–32 px.

## Checks and results

- Python standard-library XML parsing: all four SVGs passed. Valid positive viewBoxes; only svg/g/path/text/title/desc elements. No raster, base64/data URLs, scripts, event handlers, animation, external dependencies, gradients, filters or masks. No automated-trace path explosion.
- Exact asset colors: Charcoal `#1F2421`, Deep Teal `#0F4D4A`, Muted Lime `#C7D39B`; the lockup additionally uses Stone Gray `#A7A9A2` for the divider. Review palette also includes Forest Green `#2F5E46` and Off-White `#F8F7F2`.
- Chromium through the already-present Playwright installation, device scale 1: transformed geometry/text bounding boxes remained within all four SVG viewBoxes. No runtime console errors, page errors or failed requests in the local asset review.
- Wordmark fallback bounds passed for Bodoni MT, Palatino Linotype, Book Antiqua, Georgia and generic serif. Didot was unavailable and was not independently tested. Preview typography uses the local Windows font environment; this is not cross-platform glyph identity.
- Full master and compact icon rendered at **16, 24, 32, 48, 64, 128 and 256 CSS px** on each of **Off-White, White and Charcoal** (42 size/surface cases). Full-master size denotes width with natural aspect ratio; favicon size denotes its square canvas.
- At 16–24 px the full master's hairline/serif details soften. The compact derivative carries a clearer two-letter silhouette and lime separator on light surfaces. At 32 px its strengthened structure remains useful; at 48–256 px the full master retains more refined serif detail. No unintended disconnected stroke or gap was identified in the final visual inspection.
- Charcoal surface: charcoal strokes/text disappear and teal contrast is weak. This is an intentionally demonstrated **limitation**, not approved direct dark-surface usage. Use an Off-White panel. A reverse treatment is **FUTURE VARIANT**.
- Responsive review page: `document.documentElement.scrollWidth === window.innerWidth` at **375, 390, 430 and 1440 × 900**; all image loads completed. Static layout has no animation or asynchronous data dependency. The public site was not changed or claimed to have undergone a new full regression run.
- Lockup master-path and wordmark-group equality passed. Git diff scope and whitespace checks passed before the focused local commit.

## Review artifacts and limitations

- `brand-assets-v2-preview.html`: responsive preview referencing the final production SVGs; inspect at 100% zoom for actual CSS pixel samples.
- `brand-assets-v2-preview.png`: final 1440 × 2390 Chromium capture at device scale 1.
- `brand-assets-v2-approved.png`: unchanged owner-supplied Variant D authority, retained for comparison.

Production validation is complete. This record does not assert an independent reviewer verdict or a separate final owner sign-off on the delivered vector interpretation. Remaining limitations are live-font variability, full-master detail loss at tiny sizes, and direct dark-surface contrast. [VERIFIED IN REPOSITORY]
