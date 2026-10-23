# Homepage typography

Owner-approved on 2026-10-23: Bodoni Moda / Inter / JetBrains Mono on the homepage only. Canonical brand tokens, SVG logos, the 404 page, other routes and the existing social image retain their original typography.

The homepage alone loads `homepage-fonts.css`; its custom-property overrides are scoped to `.homepage`. All runtime requests use local files. Latin and Latin Extended subsets cover the English copy and Polish founder name. Font faces retain their upstream Unicode ranges and use `font-display: swap`. Three critical Latin faces (Bodoni regular/italic and Inter) are preloaded with `crossorigin`; monospace and extended subsets are discovered through CSS. Supported browsers normalize fallback x-height with `font-size-adjust: from-font`; others retain the native fallback scale.

Files were downloaded without modification from Google's font CDN on 2026-10-23 using this official CSS API request with a Chromium user agent:

`https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=Inter:wght@400..600&family=JetBrains+Mono:wght@400..500&display=swap`

- Bodoni Moda: CDN v28, normal and italic 400, Latin/Latin Extended.
- Inter: CDN v20, variable weight 400–600, normal, Latin/Latin Extended.
- JetBrains Mono: CDN v24, variable weight 400–500, normal, Latin/Latin Extended.

Redistributed under the SIL Open Font License 1.1. Complete upstream copyright and license notices are included as `OFL-bodonimoda.txt`, `OFL-inter.txt`, and `OFL-jetbrainsmono.txt`, retrieved from the corresponding `ofl/<family>/OFL.txt` files in https://github.com/google/fonts. No Google Fonts stylesheet, remote font request, external font service or additional JavaScript is used at runtime.
