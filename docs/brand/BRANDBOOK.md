# Warsaw Analytica — Brandbook

Canonical brand contract for **Warsaw Analytica**, the shared identity layer for internal Warsaw Analytica surfaces.

- **Status:** Warsaw Analytica Digital Brand **v1** — owner-reviewed and accepted on 2026-09-15.
- Primary visual source: `docs/brand/brand-reference.png` (the supplied Warsaw Analytica brandboard, 1122 x 1402 px)
- Companion documents: `docs/brand/DIGITAL_UI.md`, `site/assets/brand-tokens.css`
- Canonical assets: `site/assets/brand/wa-monogram.svg`, `site/assets/brand/wa-wordmark.svg`, `site/assets/brand/wa-lockup-horizontal.svg`, `site/assets/brand/favicon.svg`
- Task scope: brand contract and canonical asset status only. Cockpit and Wiki are intentionally not redesigned here.

---

## 0. Source classification legend

Every rule carries exactly one label:

| Label | Meaning |
| :--- | :--- |
| CONFIRMED FROM BRANDBOARD | Observable in the supplied brandboard, or stated by the brand owner as brandboard content. Treat as brand fact. |
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

The canonical vector assets exist and are owner-approved for v1. They are the authority for mark geometry; the brandboard is a reference, not production art.

| Asset | Canonical path | Primary use |
| :--- | :--- | :--- |
| WA monogram | `site/assets/brand/wa-monogram.svg` | Compact use: application headers, footers, dense toolbars |
| Wordmark | `site/assets/brand/wa-wordmark.svg` | Two-line `WARSAW` / `ANALYTICA` wordmark, including the tagline line |
| Horizontal lockup | `site/assets/brand/wa-lockup-horizontal.svg` | Standard application-header lockup |
| Favicon | `site/assets/brand/favicon.svg` | Browser tab and icon use |

The marks draw only in the canonical palette — Deep Teal `#0F4D4A`, Muted Lime `#C7D39B`, Charcoal `#1F2421`. Do not redraw, recolour, or re-space them in place; a change to a mark is a new owner decision. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 2.1 WA monogram

Accepted as canonical v1: `site/assets/brand/wa-monogram.svg`. Intended primarily for light surfaces. [CONFIRMED — OWNER DECISION (BRAND V1)]

- Geometric, overlapping construction of the letters W and A. [CONFIRMED FROM BRANDBOARD]
- Two-tone serif strokes — charcoal and deep teal — with pronounced thick/thin contrast. [CONFIRMED FROM BRANDBOARD]
- Crossed by a narrow diagonal bar in muted lime. [CONFIRMED FROM BRANDBOARD]
- On the board the mark is shown over faint construction geometry (circles, verticals, horizontals). The canonical asset contains no such geometry. Construction geometry is editorial and brand-reference material only, and is not part of normal internal-product UI. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Stroke weights, overlap order, and diagonal angle are fixed by `site/assets/brand/wa-monogram.svg`. That file, not the brandboard, governs future comparison. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 2.2 Warsaw Analytica wordmark

Accepted as canonical v1: `site/assets/brand/wa-wordmark.svg`. [CONFIRMED — OWNER DECISION (BRAND V1)]

Two-line uppercase serif lockup: `WARSAW` above `ANALYTICA`. High-contrast serif, tight measure, generous cap height. [CONFIRMED FROM BRANDBOARD]

- Set in Charcoal `#1F2421`, not pure black. [CONFIRMED — OWNER DECISION (BRAND V1)]
- The two lines are live text in the approved v1 digital display stack (section 4.3), not outlines. The exact final typeface remains a future refinement; the current approved stack is accepted for v1. [CONFIRMED — OWNER DECISION (BRAND V1); the typeface is a recorded future refinement]
- The `PEOPLE PLACES PERSPECTIVE` tagline line is part of this asset and is excluded from the horizontal lockup. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 2.3 Tagline

`PEOPLE PLACES PERSPECTIVE` — uppercase, widely tracked, set beneath the wordmark at a smaller optical size. [CONFIRMED FROM BRANDBOARD]

Optional brand element. It is not required in standard product headers or lockups, and its absence is not a brand violation. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 2.4 Standing descriptor

`ANALYSIS / STRATEGY / A CLEARER TOMORROW` — a three-part descriptor appearing as a standing header strip. [CONFIRMED FROM BRANDBOARD]

Optional brand copy, not a mandatory element. It is not part of the standard lockup: `site/assets/brand/wa-lockup-horizontal.svg` deliberately omits it. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 2.5 Horizontal lockup

Accepted as canonical v1: `site/assets/brand/wa-lockup-horizontal.svg`. [CONFIRMED — OWNER DECISION (BRAND V1)]

- Composition: the WA monogram set to the left of the two-line `WARSAW` / `ANALYTICA` wordmark, sharing one baseline grid. [CONFIRMED FROM BRANDBOARD as composition; the canonical asset fixes the proportions]
- The descriptor is not part of the standard lockup, and the tagline is omitted as well. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Spacing and proportions are fixed by the asset rather than by measured board geometry. [CONFIRMED — OWNER DECISION (BRAND V1)]

The board's full identity block — monogram, then wordmark, then tagline, beside a narrow adjacent column separated by a vertical hairline — remains brand-reference composition, not the production lockup. [CONFIRMED FROM BRANDBOARD as observed]

### 2.6 Compact use

Below lockup scale — application headers, document footers, dense toolbars — use the monogram alone. Do not stack a reduced wordmark beneath it. [INFERRED FOR DIGITAL USE]

### 2.7 Favicon use

Canonical v1 favicon: `site/assets/brand/favicon.svg` — the WA monogram, uniformly scaled and centred on a transparent 32 x 32 canvas with no background plate. [CONFIRMED — OWNER DECISION (BRAND V1)]

- Place it on a surface with enough contrast to carry the two-tone mark. [INFERRED FOR DIGITAL USE]
- Do not use the full lockup or the tagline at favicon scale. [INFERRED FOR DIGITAL USE]

Superseded guidance: an earlier revision of this section recommended a single-colour favicon. The accepted v1 favicon is the two-tone monogram, with the limitation recorded below. [CONFIRMED — OWNER DECISION (BRAND V1)]

**Known limitation (v1).** Legibility at 16 px is weak: the muted-lime diagonal and the thin charcoal hairline fall below one device pixel at that size, so at 16 px the mark reads as its two-tone mass. This is recorded as a known limitation and is not a blocker; downstream UI work must not wait on it. A compact favicon or simplified mark may replace this asset in a future version. [CONFIRMED — OWNER DECISION (BRAND V1)]

> The existing `site/assets/favicon.svg` is the DataWarsaw / domaradzki.com.pl mark (letter M, acid lime `#c6ff3e` on `#0b1514`). It is **not** a Warsaw Analytica asset and must not be reused as the Warsaw Analytica icon. The Warsaw Analytica icon is `site/assets/brand/favicon.svg`.

### 2.8 Clear space

Working minimum: clear space equal to the monogram's internal counter height on all four sides, with nothing entering that zone. With the canonical v1 assets available, measure that zone against `site/assets/brand/wa-monogram.svg` rather than against the brandboard. This stays an inferred digital rule and is not presented as a board-derived brand fact. [INFERRED FOR DIGITAL USE]

### 2.9 Prohibited modifications

Do not redraw, retype, or re-export the canonical v1 assets in place; a change to a mark is a new owner decision. [CONFIRMED — OWNER DECISION (BRAND V1)]

Do not recolour the mark outside the canonical palette; add gradients, glows, bevels, or drop shadows; rotate or skew; outline or emboss; stretch or condense; re-set the wordmark in a sans-serif or a different serif; reposition, recolour, or remove the lime diagonal; place the lockup over busy photography without a solid off-white or charcoal panel; or animate the monogram beyond a restrained opacity fade. [INFERRED FOR DIGITAL USE]

### 2.10 Surfaces

- The v1 marks are single-treatment and light-surface preferred. There is no separate dark colourway in v1. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Both the monogram and the wordmark use Charcoal `#1F2421`, so neither is legible directly on a charcoal surface. Where a mark has to sit on a dark surface, keep the standard treatment and place it on a solid Off-White panel rather than recolouring or inverting it. [INFERRED FOR DIGITAL USE, derived from the no-recolour rule in section 2.9 and the v1 light-surface preference]

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

The brandboard file does not establish exact font families, and the canonical v1 marks carry their wordmark text as live text in the approved digital stack rather than in a licensed brand family. Do not assert that the approved stack is the original brandboard typeface. For v1 the approved digital stack is the accepted implementation; identifying the original families remains a future refinement. [CONFIRMED — OWNER DECISION (BRAND V1) for the v1 stack; the original family identity is a recorded future refinement]

### 4.2 Digital role mapping

- **Display serif** — major headings and brand moments only: page titles, section titles, document headers, empty-state statements. [INFERRED FOR DIGITAL USE]
- **UI sans-serif** — every functional surface: navigation, labels, table content, buttons, form controls, help text, error text. [INFERRED FOR DIGITAL USE]
- **Tracked uppercase label** — eyebrow labels, table column headers, status labels, metadata keys. Keep tracking near `0.18em` and weight near 600 so small labels stay legible. [INFERRED FOR DIGITAL USE]
- **Monospace** — identifiers, timestamps, telemetry values, numeric ledgers, code. [INFERRED FOR DIGITAL USE; consistent with the existing DataWarsaw design system, which already uses monospace for technical annotations]

### 4.3 Interim font stacks

The repository's display stack in `site/styles.css` is `Bodoni MT, Didot, Palatino Linotype, Book Antiqua, Georgia, serif`, a high-contrast serif consistent with the brandboard's character, alongside `Avenir Next, Avenir, Segoe UI, Helvetica, Arial, sans-serif` for functional text. These are exposed as `--wa-font-display` and `--wa-font-ui` in `site/assets/brand-tokens.css`, and they are the **approved v1 digital stack**, including the live wordmark text in `wa-wordmark.svg` and `wa-lockup-horizontal.svg`. [CONFIRMED — OWNER DECISION (BRAND V1)]

They remain placeholders for the brand's original typeface: the licensed families are not identified, and confirming them is a future refinement rather than an open v1 blocker. Horizontal wordmark metrics depend on the resolved family, so the wordmark text should be converted to outlines when the licensed family is confirmed. [INFERRED FOR DIGITAL USE, future refinement]

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
- Do not treat the brandboard as canonical logo art; the canonical art is the four v1 assets listed in section 8.3.

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

The canonical Warsaw Analytica v1 vector marks exist and are owner-approved. They are the production art for v1:

```text
site/assets/brand/
  wa-monogram.svg            WA monogram, 233 x 124
  wa-wordmark.svg            WARSAW / ANALYTICA wordmark, 340 x 152
  wa-lockup-horizontal.svg   monogram plus wordmark, 598 x 124
  favicon.svg                WA monogram on a 32 x 32 canvas
```

- All four are canonical v1: reviewed and accepted by the owner. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Status wording: earlier drafts in this repository labelled these files *candidate canonical asset* while owner review was pending. That language is superseded; the files are canonical v1 and are no longer pending approval. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Format: each file is a standalone SVG with no `image` element, no `data:` URI, and no base64 payload, and each draws only in Deep Teal `#0F4D4A`, Muted Lime `#C7D39B`, and Charcoal `#1F2421`. [VERIFIED IN REPOSITORY]
- The wordmark and the lockup carry their lettering as live text in the approved v1 digital stack (section 4.3) rather than as outlines. Horizontal metrics therefore depend on the resolved font; convert to outlines once the licensed family is confirmed. [CONFIRMED — OWNER DECISION (BRAND V1) for the approved stack; outlining is a recorded follow-up]
- Reconstruction provenance is retained: the SVG headers record the brandboard regions the paths were measured from. Reconstruction is complete, and the assets, not the brandboard, govern future comparison. [VERIFIED IN REPOSITORY]
- `site/assets/favicon.svg` is a different asset — the DataWarsaw / domaradzki.com.pl mark from the older direction. The Warsaw Analytica favicon is `site/assets/brand/favicon.svg`. [VERIFIED IN REPOSITORY]
- `docs/brand/brand-reference.png` remains a visual reference. It is not a substitute for the canonical marks, and it must not be cropped or traced to produce production art. [CONFIRMED — OWNER DECISION (BRAND V1)]

### 8.4 Evidence and verification

- **Palette:** all six canonical hexes are present in `docs/brand/brand-reference.png` by direct pixel sampling (tolerance 14/255 per channel, every third pixel, 175,032 samples): Off-White 119,828; Stone Gray 6,296; Charcoal 5,842; Deep Teal 857; Forest Green 601; Muted Lime 595. No blue-dominant pixel was found, consistent with a six-colour palette containing no blue.
- **Board geometry:** 1122 x 1402 px, portrait.
- **Contrast ratios:** computed from the hex values using the WCAG 2.1 relative-luminance formula.
- **Text and layout elements:** transcribed from the supplied brandboard as presented in the task brief.
- **Limitation:** letterform-level inspection of the board was not independently re-performed in this session, and the typeface identity is not established by the file. Monogram stroke geometry and lockup proportions were therefore reconstructed, and are now fixed by the canonical v1 assets rather than by board measurement; the typeface identity remains unresolved.
- **Asset validation (Brand v1):** all four canonical SVGs parse as well-formed XML, contain no `image` element, no `data:` URI, and no base64 payload, and use only the colour literals `#0F4D4A`, `#C7D39B`, and `#1F2421`. [VERIFIED IN REPOSITORY]

### 8.5 Resolved by the Brand v1 approval

These items were open in the pre-approval draft and are now decided. The owner's decision is the brand fact; the reasoning above is unchanged.

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

### 8.7 Recorded v1 limitations

- **Favicon legibility at 16 px** is weak; at that size the mark reads only as its two-tone mass. Recorded, not a blocker, and downstream UI work must not wait on it. A compact favicon or simplified mark may replace `site/assets/brand/favicon.svg` in a future version. Detail in section 2.7.

---

## 9. Related documents

- `docs/brand/DIGITAL_UI.md` — internal-tool interpretation for Cockpit and Wiki.
- `site/assets/brand-tokens.css` — the token layer implementing section 3 and section 4.
- `site/assets/brand/` — the four canonical v1 vector marks (section 8.3).
- `docs/design-system.md` — the earlier DataWarsaw dark-graphite and acid-lime direction. It remains the public-site record but is **not** the Warsaw Analytica design language.
