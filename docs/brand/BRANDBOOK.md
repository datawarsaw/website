# Warsaw Analytica — Brandbook

Canonical brand contract for **Warsaw Analytica**, the shared identity layer for internal Warsaw Analytica surfaces.

- **Status:** Digital Brand **v1** contract retained; **Brand Assets v2** production pass validated on 2026-09-21. Variant D is owner-selected; this does not claim a separate owner sign-off on the delivered vectors.
- Supporting visual source: `docs/brand/brand-reference.png` (the supplied Warsaw Analytica brandboard, 1122 x 1402 px)
- Asset geometry authority: `docs/brand/brand-assets-v2-approved.png` — **Variant D, smoother transitions**. Priority: approved Variant D board, Brand v1 contract, original brandboard. [CONFIRMED — OWNER DECISION]
- Companion documents: `docs/brand/DIGITAL_UI.md`, `site/assets/brand-tokens.css`
- Canonical assets: `site/assets/brand/wa-monogram.svg`, `site/assets/brand/wa-wordmark.svg`, `site/assets/brand/wa-lockup-horizontal.svg`, `site/assets/brand/favicon.svg`
- Task scope: brand contract and canonical asset status only. Cockpit and Wiki are intentionally not redesigned here.

---

## 0. Source classification legend

Every rule carries exactly one label:

| Label | Meaning |
| :--- | :--- |
| CONFIRMED FROM BRANDBOARD | Observable in the supplied brandboard, or stated by the brand owner as brandboard content. Treat as brand fact. |
| CONFIRMED — OWNER DECISION | Owner-selected Variant D and explicit v2 production requirements. |
| CONFIRMED — OWNER DECISION (BRAND V1) | Stated by the brand owner in the Brand v1 approval. Binding for v1, and it supersedes a brandboard reading where the two differ. |
| INFERRED FOR DIGITAL USE | A digital-interface decision derived from the brandboard because the board does not specify UI behaviour. Reviewable, not canonical. |
| VERIFIED IN REPOSITORY | A measured or inspected property of a file in this repository. Reproducible by re-running the stated check. |
| TBD / REQUIRES OWNER DECISION | Unknown or undecided. Must never be presented as a brand fact. |

An inference is never a brand fact. Where this document is uncertain it says so.

---

## 1. Brand identity

### 1.1 Name

**Warsaw Analytica.** Two words. Uppercase only inside the wordmark and in tracked labels. [CONFIRMED FROM BRANDBOARD]

### 1.2 Essence

Analytical clarity delivered with editorial authority: rigorous analysis and strategy expressed as calm, legible structure rather than persuasion. [CONFIRMED FROM BRANDBOARD — the board frames the brand as analysis and strategy toward a clearer tomorrow]

### 1.3 Visual character

Architectural editorial. The board labels its own direction `ARCHITECTURAL EDITORIAL DIRECTION` under the board header `DIRECTION 6`. The character is built from construction geometry, high-contrast serif letterforms, hairline rules, and deep whitespace. [CONFIRMED FROM BRANDBOARD]

### 1.4 Tone

Restrained, considered, factual, declarative. [CONFIRMED FROM BRANDBOARD]

Wording rules that follow from that character: no superlatives, no hype, no exclamation marks, no second-person sales address. [INFERRED FOR DIGITAL USE]

### 1.5 Intended feel

A quiet institutional publication: the confidence of an architectural drawing sheet or a printed annual report. Internal tools should read as working documents inside that publication, not as a product marketing site. [INFERRED FOR DIGITAL USE]

---

## 2. Logo system

The owner selected **Variant D — smoother transitions**. The approved Variant D board governs the v2 reconstruction; the old v1 traced paths are implementation history, not v2 geometry authority. [CONFIRMED — OWNER DECISION]

The four paths below now contain validated Brand Assets v2. This records production validation, not an additional owner approval of the final vector interpretation. The v1 palette and digital typography contract remain in force. [VERIFIED IN REPOSITORY]

| Asset | Canonical path | Canvas / primary use |
| :--- | :--- | :--- |
| Full monogram | `site/assets/brand/wa-monogram.svg` | 432 × 240; headers, editorial and larger applications |
| Wordmark | `site/assets/brand/wa-wordmark.svg` | 320 × 144; two-line WARSAW / ANALYTICA, no tagline |
| Horizontal lockup | `site/assets/brand/wa-lockup-horizontal.svg` | 516 × 132; standard application header |
| Compact favicon | `site/assets/brand/favicon.svg` | 32 × 32; optically corrected for 16–32 px |

### 2.1 WA monogram

Five intentional filled paths replace the v1 raster-derived contour fragments. Straight primary strokes meet cubic Bézier serif transitions. A charcoal W and upper central stroke overlap the deep-teal forms; the muted-lime diagonal sits above them. The full master has 49 path endpoints, including move points, plus 24 cubic control points. No masks, raster, filters or construction lines are present. Geometry occupies x=8…424 and y=8…232, leaving 8 units of internal clearance on all sides. [VERIFIED IN REPOSITORY]

The construction preserves Variant D's proportions, pronounced thick/thin contrast, smooth serif terminals and overlap hierarchy. The board's texture, incidental contour noise and construction guides are not production geometry. [INFERRED FOR DIGITAL USE]

### 2.2 Warsaw Analytica wordmark

Two-line uppercase serif: `WARSAW` above `ANALYTICA`, in Charcoal `#1F2421`. The v2 wordmark contains only those two lines. [CONFIRMED — OWNER DECISION]

Live text retains the approved stack: `"Bodoni MT", Didot, "Palatino Linotype", "Book Antiqua", Georgia, serif`. No font has been silently substituted or declared the canonical licensed family. Explicit `textLength` values of 245 and 294 units, with `lengthAdjust="spacingAndGlyphs"`, fix line measures; glyph shapes still depend on the locally resolved font. This modest metric normalization does not establish the original board typeface. No fonts are embedded or redistributed. [VERIFIED IN REPOSITORY]

Exact brand family and outline licensing remain **TBD**. The local review render resolves Bodoni MT; fallback bounds were also checked for Palatino Linotype, Book Antiqua, Georgia and generic serif. Didot was not available for independent verification. [VERIFIED IN REPOSITORY]

### 2.3 Tagline

`PEOPLE PLACES PERSPECTIVE` remains optional brand copy. It is not included in the v2 wordmark or standard product-header lockup. [CONFIRMED — OWNER DECISION]

### 2.4 Standing descriptor

`ANALYSIS / STRATEGY / A CLEARER TOMORROW` remains optional brand copy and is excluded from the standard lockup. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 2.5 Horizontal lockup

The lockup embeds the full master's exact five paths at `translate(8 16) scale(0.416666667)` and the wordmark's exact text group at `translate(220 2) scale(0.9)`. A 1-unit Stone Gray divider at x=202 follows the approved board composition. It has no tagline, descriptor or construction geometry. [VERIFIED IN REPOSITORY]

The copies are standalone for runtime use; any future master edit must be propagated into the lockup, preserving identical path data and text attributes. [INFERRED FOR DIGITAL USE]

### 2.6 Compact use

Use the full master where its fine strokes remain legible. Prefer the compact favicon for 16–32 px icon contexts. Do not use the large wordmark at favicon scale. [INFERRED FOR DIGITAL USE]

### 2.7 Favicon use

The transparent 32 × 32 favicon is a **compact optical derivative**, not the full master uniformly reduced. Its 16-unit design grid is scaled by two. The silhouette is slightly taller, the connecting stroke and lime diagonal are strengthened, serif shelves are 1 device pixel deep at 16 px, and small curved terminal details are removed. The charcoal/teal/lime relationship and recognizable overlap remain. Five paths contain 42 endpoints plus 10 cubic control points. [VERIFIED IN REPOSITORY]

At 16 px the icon communicates the WA silhouette and lime separator, not full editorial detail. Use the full master at larger sizes; the compact shape is not an alternate full-size identity. The v1 weak-favicon limitation is superseded by this derivative on light surfaces. [INFERRED FOR DIGITAL USE]

`site/assets/favicon.svg` remains the separate DataWarsaw mark and is not a Warsaw Analytica asset. [VERIFIED IN REPOSITORY]

### 2.8 Clear space

Working minimum: external clear space equal to the monogram's internal counter height on all four sides. The master's 8-unit canvas inset is clipping clearance, not sufficient layout clear space. [INFERRED FOR DIGITAL USE]

### 2.9 Prohibited modifications

Do not stretch the assets, substitute a new serif, reposition the lime diagonal, add gradients, effects or decorative geometry, or mix Variant A/B/C into the approved direction. Changes to the identity require a new owner decision. [CONFIRMED — OWNER DECISION]

### 2.10 Surfaces

Canonical full-color assets remain light-surface oriented. They were inspected on Off-White `#F8F7F2`, White `#FFFFFF` and Charcoal `#1F2421`. Charcoal strokes and text disappear on Charcoal; teal also has poor contrast. This is a known limitation, not a passed dark-surface legibility claim. [VERIFIED IN REPOSITORY]

On dark product surfaces, use an Off-White panel. A reverse treatment shown in reference material is **FUTURE VARIANT**, not a delivered canonical asset. [INFERRED FOR DIGITAL USE]

---

## 3. Color system

The six canonical colours are exactly those on the brandboard. No additional canonical colour exists.

### 3.1 Canonical palette

| Name | Hex | CSS token | Semantic role |
| :--- | :--- | :--- | :--- |
| Charcoal | `#1F2421` | `--wa-charcoal` | Primary ink; primary dark surface |
| Deep Teal | `#0F4D4A` | `--wa-deep-teal` | Primary brand accent; structural emphasis; links and active states |
| Forest Green | `#2F5E46` | `--wa-forest-green` | Secondary accent; supporting depth; non-primary emphasis |
| Muted Lime | `#C7D39B` | `--wa-muted-lime` | Signal accent; selection and focus; small areas only |
| Stone Gray | `#A7A9A2` | `--wa-stone-gray` | Hairline rules, inert surfaces, disabled affordances, large metadata |
| Off-White | `#F8F7F2` | `--wa-off-white` | Canonical canvas; primary light surface; reverse text on dark |

All six are CONFIRMED FROM BRANDBOARD and independently verified against the reference file by pixel sampling (section 8.4).

### 3.2 Recommended combinations

- **Default light surface:** Off-White canvas, Charcoal text, Deep Teal for links and active states, Stone for hairline rules. [INFERRED FOR DIGITAL USE]
- **Dark surface:** Charcoal canvas, Off-White text, Stone for muted text, Muted Lime for focus and signal. [INFERRED FOR DIGITAL USE]
- **Signal:** Muted Lime fill with Charcoal text, for selected rows, active markers, and focus states — never as a large background field. [CONFIRMED FROM BRANDBOARD in character; specific UI application INFERRED]
- **Emphasis panel:** Deep Teal with Off-White text, or Forest Green with Off-White text. [INFERRED FOR DIGITAL USE]
- **Area economy:** off-white dominates; charcoal carries text and occasional dark surfaces; deep teal is the structural accent; forest green is a rare secondary; muted lime is always the smallest area on screen. [CONFIRMED FROM BRANDBOARD]

### 3.3 Accessibility

Measured WCAG 2.1 contrast ratios:

| Pair | Ratio | Verdict | Intended use |
| :--- | :--- | :--- | :--- |
| Charcoal `#1F2421` on Off-White `#F8F7F2` | 14.69:1 | AAA, and AA for all text | Body text, headings, table content |
| Deep Teal `#0F4D4A` on Off-White `#F8F7F2` | 8.98:1 | AAA, and AA for all text | Links, active navigation, emphasis |
| Forest Green `#2F5E46` on Off-White `#F8F7F2` | 6.97:1 | AA for all text | Secondary emphasis, positive status |
| Stone Gray `#A7A9A2` on Off-White `#F8F7F2` | 2.21:1 | Below AA - do not use for text | Hairline rules, inert surfaces, disabled affordances |
| Muted Lime `#C7D39B` on Off-White `#F8F7F2` | 1.48:1 | Below AA - do not use for text | Tested as a misuse case; rejected for text |
| Off-White `#F8F7F2` on Charcoal `#1F2421` | 14.69:1 | AAA, and AA for all text | Reverse text on dark surfaces |
| Off-White `#F8F7F2` on Deep Teal `#0F4D4A` | 8.98:1 | AAA, and AA for all text | Reverse text on teal panels |
| Charcoal `#1F2421` on Muted Lime `#C7D39B` | 9.92:1 | AAA, and AA for all text | Text on lime signal fills |
| Muted Lime `#C7D39B` on Charcoal `#1F2421` | 9.92:1 | AAA, and AA for all text | Dark-surface focus ring, signal accent |
| Stone Gray `#A7A9A2` on Charcoal `#1F2421` | 6.63:1 | AA for all text | Muted text on dark surfaces |
| Deep Teal `#0F4D4A` on Charcoal `#1F2421` | 1.64:1 | Below AA - do not use for text | Teal text on dark surfaces |
| Forest Green `#2F5E46` on Deep Teal `#0F4D4A` | 1.29:1 | Below AA - do not use for text | Forest text on teal panels |

Binding consequences:

- **Stone Gray must not carry text on Off-White** (2.21:1). Use it for hairlines, inert panels, and disabled affordances. Stone Gray as text is only acceptable on Charcoal (6.63:1).
- **Muted Lime must not carry text on Off-White** (1.48:1). Lime is a fill and signal colour; text on lime is Charcoal (9.92:1).
- **Deep Teal text on Charcoal is unusable** (1.64:1), as is Forest Green on Deep Teal (1.29:1). Never pair these as foreground on background.
- Derived muted text (`#6b6e69`) reaches 4.82:1 on Off-White and 4.53:1 on the sunken surface, so quiet metadata can stay legible.
- Status must never be communicated by colour alone; always pair colour with a text label. [INFERRED FOR DIGITAL USE — accessibility requirement]

---

## 4. Typography

### 4.1 Roles observed on the brandboard

- **Display serif:** high-contrast serif with strong thick/thin modulation, used for the wordmark and large headings. [CONFIRMED FROM BRANDBOARD]
- **Tracked uppercase label:** small, uppercase, wide letter-spacing, used for section labels and the standing descriptor. [CONFIRMED FROM BRANDBOARD]
- **Supporting text:** quiet, smaller, secondary to the display and label roles. [CONFIRMED FROM BRANDBOARD as a role; its typeface is not established]

The brandboard file does not establish exact font families, and the v2 marks retain their wordmark text as live text in the approved digital stack rather than in a licensed brand family. Do not assert that the approved stack is the original brandboard typeface. For v1 the approved digital stack is the accepted implementation; identifying the original families remains a future refinement. [CONFIRMED — OWNER DECISION (BRAND V1) for the v1 stack; the original family identity is a recorded future refinement]

### 4.2 Digital role mapping

- **Display serif** — major headings and brand moments only: page titles, section titles, document headers, empty-state statements. [INFERRED FOR DIGITAL USE]
- **UI sans-serif** — every functional surface: navigation, labels, table content, buttons, form controls, help text, error text. [INFERRED FOR DIGITAL USE]
- **Tracked uppercase label** — eyebrow labels, table column headers, status labels, metadata keys. Keep tracking near `0.18em` and weight near 600 so small labels stay legible. [INFERRED FOR DIGITAL USE]
- **Monospace** — identifiers, timestamps, telemetry values, numeric ledgers, code. [INFERRED FOR DIGITAL USE; consistent with the existing DataWarsaw design system, which already uses monospace for technical annotations]

### 4.3 Interim font stacks

The repository's display stack in `site/styles.css` is `Bodoni MT, Didot, Palatino Linotype, Book Antiqua, Georgia, serif`, a high-contrast serif consistent with the brandboard's character, alongside `Avenir Next, Avenir, Segoe UI, Helvetica, Arial, sans-serif` for functional text. These are exposed as `--wa-font-display` and `--wa-font-ui` in `site/assets/brand-tokens.css`, and they are the **approved v1 digital stack**, including the live wordmark text in `wa-wordmark.svg` and `wa-lockup-horizontal.svg`. [CONFIRMED — OWNER DECISION (BRAND V1)]

They remain placeholders for the brand's original typeface: the licensed families are not identified, and confirming them is a future refinement rather than an open v1 blocker. V2 fixes overall line measures through SVG text lengths, but glyph shapes and vertical metrics depend on the resolved family. Convert to outlines only when the exact family and licensing are confirmed. [INFERRED FOR DIGITAL USE, future refinement]

### 4.4 Hierarchy principles

- One display serif element per view.
- Labels sit above the content they describe, not beside it.
- Hierarchy is carried by weight, spacing, and case more than by size.
- Cap measure around 65–75 characters for reading text.
- No display serif in table cells, buttons, navigation, or form labels. [INFERRED FOR DIGITAL USE]

---

## 5. Layout and composition

- **Grid:** a strong underlying grid with visible column structure. The board composes sections against hairline rules and aligned columns. [CONFIRMED FROM BRANDBOARD] Digital translation: a 12-column desktop grid, 4-column mobile, on a 4 px base unit with an 8 px vertical rhythm. [INFERRED FOR DIGITAL USE]
- **Whitespace:** generous at page level, deliberate and tighter inside data regions. Whitespace separates sections instead of containers or cards. [CONFIRMED FROM BRANDBOARD]
- **Borders and dividers:** 1 px hairlines only — low-opacity charcoal on light surfaces, low-opacity off-white on dark surfaces. No drop shadows as separators. [CONFIRMED FROM BRANDBOARD for hairline discipline; alpha values INFERRED FOR DIGITAL USE]
- **Alignment:** left-aligned text; labels share the left edge of the content they describe; numeric columns may be right-aligned for comparison. [INFERRED FOR DIGITAL USE]
- **Image use:** rare, anchored in a panel or as a deliberate full-bleed band, never behind text. [INFERRED FOR DIGITAL USE]
- **Editorial hierarchy:** tracked label, then serif headline, then one supporting sans-serif sentence, then the data. [CONFIRMED FROM BRANDBOARD as page structure; digital translation INFERRED]

---

## 6. Imagery

- **Language:** architectural, urban, structural, and analytical — facades, geometry, drawing-sheet abstraction, light and material. [CONFIRMED FROM BRANDBOARD]
- **Restraint:** imagery is an occasional anchor, not a recurring device. Text, structure, and whitespace carry the identity. [CONFIRMED FROM BRANDBOARD]
- **Appropriate:** brand or section openers, document and report covers, presentation title slides, empty states that need orientation. [INFERRED FOR DIGITAL USE]
- **Not appropriate:** behind working data, inside tables or forms, as repeated card imagery, in dense internal tool views, or as decoration on every page. [INFERRED FOR DIGITAL USE]
- **Treatment:** full colour but quiet; never overlaid with text without a solid off-white or charcoal panel; no duotone, glow, blur, or heavy grain effects. [INFERRED FOR DIGITAL USE]

---

## 7. Brand do / do not

**Do**

- Lead with structure: hairline rules, aligned columns, generous margins.
- Keep display serif for major headings and brand moments.
- Reserve muted lime for the smallest, most meaningful area on screen.
- Write plainly and declaratively.
- Use off-white as the working canvas for internal tools.

**Do not**

- Do not use generic SaaS dashboard aesthetics, pill-shaped badges, or rainbow gradients.
- Do not use glassmorphism, frosted panels, or blurred backdrops.
- Do not use neon glow, bloom, or shader effects.
- Do not wrap content in unnecessary cards or nested containers.
- Do not add advertising or cyberpunk visual language.
- Do not pair deep teal with charcoal, or forest green with deep teal, as text on background.
- Do not use muted lime or stone gray as text on off-white.
- Do not set functional UI text in the display serif.
- Do not use the raster board as runtime logo art; use the four v2 assets listed in section 8.3. The owner-selected Variant D board remains the visual authority for assessing this reconstruction.

---

## 8. Source classification

### 8.1 Confirmed from brandboard

- Warsaw Analytica naming; WA monogram; two-line serif wordmark; `PEOPLE PLACES PERSPECTIVE` tagline; `ANALYSIS / STRATEGY / A CLEARER TOMORROW` standing descriptor.
- Architectural editorial direction with construction geometry, hairline separators, and generous whitespace.
- The six canonical colours and their relative area economy.
- High-contrast serif display role and tracked uppercase label role.
- Architectural imagery as an occasional brand element.

### 8.2 Inferred for digital use

- All token naming and semantic role assignments (`--wa-*`).
- Derived surfaces, derived muted text, derived control-boundary grey, focus-ring colours.
- Grid dimensions, hairline alpha values, spacing primitives, radius and shadow restraint.
- Component-level guidance (navigation, tables, index rows, buttons, badges) in `docs/brand/DIGITAL_UI.md`.
- Typeface choices, including the interim stacks, and the monospace role.

### 8.3 Logo asset status

Brand Assets v2 replace the four canonical files listed in section 2. The approved Variant D reference is retained at `docs/brand/brand-assets-v2-approved.png`; the original board remains supporting context. V1 files remain recoverable from Git commit `8d9f85f`. [VERIFIED IN REPOSITORY]

Production review artifacts (never runtime assets):

- `docs/brand/brand-assets-v2-preview.html` — responsive review page referencing the final SVGs.
- `docs/brand/brand-assets-v2-preview.png` — Chromium capture at 1440 px / device scale 1.
- `docs/brand/brand-assets-v2-validation.md` — construction, refinement and validation record.

The owner selected Variant D; no claim is made that the delivered v2 vector interpretation has already received a separate final owner review. [CONFIRMED — OWNER DECISION for the direction; VERIFIED IN REPOSITORY for production status]

### 8.4 Evidence and verification

**V2 evidence:** see `brand-assets-v2-validation.md`. The records below describe the original board and historical v1 validation; they do not establish v2 geometry authority.


- **Palette:** all six canonical hexes are present in `docs/brand/brand-reference.png` by direct pixel sampling (tolerance 14/255 per channel, every third pixel, 175,032 samples): Off-White 119,828; Stone Gray 6,296; Charcoal 5,842; Deep Teal 857; Forest Green 601; Muted Lime 595. No blue-dominant pixel was found, consistent with a six-colour palette containing no blue.
- **Board geometry:** 1122 x 1402 px, portrait.
- **Contrast ratios:** computed from the hex values using the WCAG 2.1 relative-luminance formula.
- **Text and layout elements:** transcribed from the supplied brandboard as presented in the task brief.
- **Limitation:** letterform-level inspection of the board was not independently re-performed in this session, and the typeface identity is not established by the file. Monogram stroke geometry and lockup proportions were therefore reconstructed, and are now fixed by the canonical v1 assets rather than by board measurement; the typeface identity remains unresolved.
- **Asset validation (Brand v1):** all four canonical SVGs parse as well-formed XML, contain no `image` element, no `data:` URI, and no base64 payload, and use only the colour literals `#0F4D4A`, `#C7D39B`, and `#1F2421`. [VERIFIED IN REPOSITORY]

### 8.5 Historical Brand v1 approval

These decisions record the v1 baseline. Section 2 supersedes asset geometry, wordmark contents and favicon implementation for v2; unrelated brand decisions remain in force.

- Monogram vector specification and production-ready lockup proportions — resolved: both are fixed by the canonical assets in section 8.3.
- Whether construction geometry may appear in product surfaces — resolved: it is editorial and brand-reference material only, never internal-product UI.
- Whether the `ANALYSIS / STRATEGY / A CLEARER TOMORROW` descriptor is required on internal surfaces — resolved: optional brand copy, and not part of the standard lockup.
- Whether the `PEOPLE PLACES PERSPECTIVE` tagline is required — resolved: optional, and not required in standard product headers or lockups.
- Favicon form and colourway — resolved: the two-tone monogram on a transparent square canvas, with the 16 px limitation recorded in section 2.7.
- Whether the `DIRECTION 6` board direction is the accepted one — resolved for v1: the owner accepted the reconstructed assets as canonical v1, so this is the accepted direction.
- Whether a separate dark colourway is needed — resolved: no dark colourway in v1; the standard treatment is light-surface preferred.

### 8.6 Remaining open items

- Exact typeface families for the display serif, UI sans-serif, and monospace roles. The approved v1 digital stack is accepted for use, so this is a refinement rather than a blocker.
- Whether a warning or critical status colour may be introduced; the palette provides no such colour (see `docs/brand/DIGITAL_UI.md`, section 11).

### 8.7 Current asset limitations

- Exact licensed wordmark family remains TBD; live glyph shapes vary across systems.
- Full-master hairlines and serifs lose detail at 16–24 px; use the compact favicon.
- Direct dark-surface use is not supported by the full-color treatment. A reverse asset is a future variant, not part of v2.

---

## 9. Related documents

- `docs/brand/DIGITAL_UI.md` — internal-tool interpretation for Cockpit and Wiki.
- `site/assets/brand-tokens.css` — the token layer implementing section 3 and section 4.
- `site/assets/brand/` — the four canonical v2 vector assets (section 8.3).
- `docs/design-system.md` — the earlier DataWarsaw dark-graphite and acid-lime direction. It remains the public-site record but is **not** the Warsaw Analytica design language.
