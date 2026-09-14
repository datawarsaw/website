# Warsaw Analytica — Digital UI

Interpretation of the Warsaw Analytica brand for internal tools. Guidance only: this document does not redesign Cockpit or Wiki.

- Applies to: `cockpit.datawarsaw.com` (Cockpit), the connected Wiki, and future internal Warsaw Analytica tools
- Brand source: `docs/brand/BRANDBOOK.md`
- Token layer: `site/assets/brand-tokens.css`
- Canonical logo assets (Brand v1, owner-approved): `site/assets/brand/wa-monogram.svg`, `site/assets/brand/wa-wordmark.svg`, `site/assets/brand/wa-lockup-horizontal.svg`, `site/assets/brand/favicon.svg`

## 0. Principle

> Warsaw Analytica editorial language translated into a quiet internal utility UI.

The brand supplies the tone and the constraints; the tool supplies the density. An internal surface is a working document inside the publication, not a marketing page.

## 1. Shared principles

- Utility over decoration. [INFERRED FOR DIGITAL USE]
- Text over imagery. [INFERRED FOR DIGITAL USE]
- Index rows over promotional card grids. [INFERRED FOR DIGITAL USE]
- Thin separators over shadows, borders, and containers. [INFERRED FOR DIGITAL USE]
- Off-White surfaces as the default working background. [INFERRED FOR DIGITAL USE]
- Serif only for major headings and brand moments; sans-serif for all functional UI. [INFERRED FOR DIGITAL USE]
- Restrained colour: colour carries meaning, not decoration. [CONFIRMED FROM BRANDBOARD in character; UI application INFERRED]
- Compact operational layouts inside data regions, generous whitespace at page level. [INFERRED FOR DIGITAL USE]

## 2. Cockpit

- Opens on operational state, not on a hero. First screen is a page shell with a defined title and a dense index of what the operator can act on. [INFERRED FOR DIGITAL USE]
- Dense but aligned: one primary table or index per view, with hairline row separators and no zebra striping. [INFERRED FOR DIGITAL USE]
- Metrics are set as numbers with a tracked uppercase label above them, not as decorative stat cards. [INFERRED FOR DIGITAL USE]
- Charts use the palette sparingly: charcoal or deep teal for series, muted lime only for the selected or highlighted series. [INFERRED FOR DIGITAL USE]
- Sidebar and header stay visually quiet so the data region is the brightest element on screen. [INFERRED FOR DIGITAL USE]

## 3. Wiki

- Reads like a printed reference: serif document title, sans-serif body, tracked uppercase section labels. [INFERRED FOR DIGITAL USE]
- Table of contents is an index of rows with hairline separators, not a grid of cards. [INFERRED FOR DIGITAL USE]
- Code and configuration blocks are monospace on the raised or sunken surface, with a hairline border and no shadow. [INFERRED FOR DIGITAL USE]
- Callouts are a left hairline rule plus a tracked uppercase label — never a large tinted rounded panel. [INFERRED FOR DIGITAL USE]
- Imagery, when used at all, sits at document or section openers only. [INFERRED FOR DIGITAL USE]

## 4. Navigation

- Horizontal navigation is a single row of plain sans-serif links separated by hairline rules or spacing, not by pills. [INFERRED FOR DIGITAL USE]
- The active state is carried by a charcoal-to-charcoal weight shift plus a deep teal underline or left hairline marker. [INFERRED FOR DIGITAL USE]
- No rounded button-shaped navigation items, no gradients, no glow on hover. [INFERRED FOR DIGITAL USE]
- Keyboard focus is always visible: a 2 px deep teal ring on light surfaces, a 2 px muted lime ring on dark surfaces. [INFERRED FOR DIGITAL USE]

## 5. Page shell

- Order: tracked uppercase eyebrow (optional), serif page title, one supporting sans-serif sentence, then content. [INFERRED FOR DIGITAL USE]
- Maximum content width around 1400 px on desktop; reading articles capped near 72 characters. [INFERRED FOR DIGITAL USE]
- A single 1 px hairline separates the header from the content region. No card wrapper around the page body. [INFERRED FOR DIGITAL USE]

## 6. Sidebar

- Off-White or sunken surface with a single right-edge hairline; no shadow and no floating panel. [INFERRED FOR DIGITAL USE]
- Group items under tracked uppercase section labels. [INFERRED FOR DIGITAL USE]
- Item height stays compact and uniform so long lists scan vertically. [INFERRED FOR DIGITAL USE]
- The active item uses charcoal text at higher weight plus a deep teal left marker 2 px wide. [INFERRED FOR DIGITAL USE]

## 7. Search

- A single input with a hairline border at #8d9089 (3.02:1 against Off-White) so the control boundary clears non-text contrast. [INFERRED FOR DIGITAL USE]
- Filtering narrows the index in place; results are rows, not cards. [INFERRED FOR DIGITAL USE]
- Empty and no-result states are one plain sentence in muted text (#6b6e69), not an illustration. [INFERRED FOR DIGITAL USE]

## 8. Tables

- Header row: tracked uppercase sans-serif labels on the sunken surface with a bottom hairline. [INFERRED FOR DIGITAL USE]
- Row separation: 1 px hairline only. No zebra stripes, no vertical grid lines unless the data is genuinely tabular. [INFERRED FOR DIGITAL USE]
- Numbers right-aligned and monospace; text left-aligned; identifiers monospace. [INFERRED FOR DIGITAL USE]
- Selected row: muted lime wash with charcoal text (9.92:1), never lime text. [INFERRED FOR DIGITAL USE]
- Density: compact row height by default, with comfortable spacing preserved above and below the table. [INFERRED FOR DIGITAL USE]

## 9. Index and link rows

- The primary list pattern: a row with a serif or sans-serif title on the left, quiet metadata in the middle or right, and a hairline separator beneath. [INFERRED FOR DIGITAL USE]
- Metadata is small, muted, and monospace where it is numeric or a timestamp. [INFERRED FOR DIGITAL USE]
- Hover and focus change the title weight or colour to deep teal; they do not raise the row with a shadow or move it. [INFERRED FOR DIGITAL USE]
- Use index rows instead of card grids wherever items are comparable and numerous. [INFERRED FOR DIGITAL USE]

## 10. Buttons

- Three levels only: primary (charcoal fill, off-white text), secondary (hairline outline, charcoal text), quiet (deep teal text, no border). [INFERRED FOR DIGITAL USE]
- Restrained geometry: 2–3 px radius, no pills, no gradients, no shadow. [INFERRED FOR DIGITAL USE; consistent with the repository's existing ban on generic pill badges]
- Labels are short, sentence case, and sans-serif. [INFERRED FOR DIGITAL USE]
- Focus uses the surface-appropriate ring; disabled buttons drop to Stone Gray and are never the only indication of a state change. [INFERRED FOR DIGITAL USE]

## 11. Status badges

- Form: a short uppercase tracked label, optionally with a 3 px leading square marker. Not a pill, not a filled rounded chip. [INFERRED FOR DIGITAL USE]
- Use of palette colours: neutral uses Stone Gray (on charcoal) or the sunken surface (on off-white); positive uses Forest Green; attention and critical have **no canonical colour in the brandboard**. Still open at Brand v1: the v1 approval did not introduce a status colour. [TBD / REQUIRES OWNER DECISION]
- Interim fallback until the owner decides: express attention and critical states with charcoal text plus a distinct hairline border and a text label, rather than inventing a red or amber brand colour. [INFERRED FOR DIGITAL USE]
- Status is never colour alone; the label always carries the meaning. [Accessibility requirement]

## 12. Typography

- Serif: page titles and Wiki document titles only. [INFERRED FOR DIGITAL USE]
- Sans-serif: all UI text, labels, tables, buttons, controls. [INFERRED FOR DIGITAL USE]
- Monospace: identifiers, timestamps, telemetry, numeric columns, code. [INFERRED FOR DIGITAL USE]
- Uppercase tracked labels stay small and are limited to eyebrows, column headers, status labels, and metadata keys. [INFERRED FOR DIGITAL USE]
- Body measure stays near 65–75 characters; line height near 1.55 for UI text and 1.65 for reading text. [INFERRED FOR DIGITAL USE]
- The approved v1 stack is the one exposed by `--wa-font-display`, `--wa-font-ui`, and `--wa-font-mono` in `site/assets/brand-tokens.css`. It is accepted for v1 product use, including the live wordmark text inside the canonical logo assets. Exact final brand families remain a future refinement; see `docs/brand/BRANDBOOK.md`, section 4. [CONFIRMED — OWNER DECISION (BRAND V1); final families are a future refinement]

## 13. Spacing

- Use the 4 px base unit exposed as `--wa-space-*` in `site/assets/brand-tokens.css`; it mirrors the existing repository scale in `site/styles.css`. [INFERRED FOR DIGITAL USE]
- Inside a data region, favour a tight rhythm (8–12 px) between related rows and a clear 24–32 px break between regions. [INFERRED FOR DIGITAL USE]
- Page-level padding stays generous so dense regions still read as editorial. [CONFIRMED FROM BRANDBOARD in character]

## 14. Responsive behaviour

- Validate every surface at 375 px, 390 px, 430 px, and 1440 x 900, per the repository's existing responsive rule set. [CONFIRMED — existing repository standard]
- No horizontal overflow: `document.documentElement.scrollWidth` equals `window.innerWidth` at every validated viewport. [CONFIRMED — existing repository standard]
- Tables collapse to stacked index rows or scroll within their own container; the page body never scrolls sideways. [INFERRED FOR DIGITAL USE]
- The sidebar becomes a drawer or a top-level index on compact viewports; it never squeezes the content column below a readable measure. [INFERRED FOR DIGITAL USE]
- Mobile is composed for its own information density, not scaled down from desktop. [CONFIRMED — existing repository standard]

## 15. Anti-patterns for internal surfaces

- No large marketing hero sections.
- No heavy architectural photography inside working views.
- No ornamental layouts that reduce usability.
- No generic SaaS dashboard aesthetics.
- No gradients unless explicitly justified.
- No glassmorphism or frosted panels.
- No excessive shadows or excessive rounded cards.
- No AI or cyberpunk visual language.

## 16. Brand assets in internal surfaces

- Standard application header mark: the horizontal lockup `site/assets/brand/wa-lockup-horizontal.svg`. [INFERRED FOR DIGITAL USE]
- Compact contexts — collapsed sidebars, document footers, dense toolbars — use the monogram `site/assets/brand/wa-monogram.svg` alone. [INFERRED FOR DIGITAL USE]
- Scale the assets proportionally and keep clear space; do not redraw, recolour, re-space, or re-export them to fit a header. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Neither the descriptor nor the tagline belongs in a product header lockup. [CONFIRMED — OWNER DECISION (BRAND V1)]
- Construction geometry from the brandboard is reference material only and never appears in product surfaces. [CONFIRMED — OWNER DECISION (BRAND V1)]
- The marks are light-surface preferred and there is no dark colourway in v1. On a dark header, place the standard mark on a solid Off-White panel. [CONFIRMED — OWNER DECISION (BRAND V1) for the light-surface preference; the panel mechanics are INFERRED FOR DIGITAL USE]
- Known v1 limitation: `site/assets/brand/favicon.svg` reads weakly at 16 px. Do not block header or favicon integration on it; a compact mark may replace it later. [CONFIRMED — OWNER DECISION (BRAND V1)]

## 17. Source classification

- The principle, restrained colour in character, generous page whitespace, and the responsive validation standard are grounded in the brandboard or in existing repository rules.
- Every component-level rule in sections 2–13 and 15 is INFERRED FOR DIGITAL USE and is reviewable by the brand owner.
- Resolved at Brand v1: the descriptor is optional brand copy and is not part of the standard lockup; the tagline is optional and is not required in product headers; the approved digital font stack is accepted for v1 product use, with exact final brand families a future refinement.
- Still open: attention and critical status colours, which the v1 approval did not introduce.
