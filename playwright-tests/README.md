# DataWarsaw Playwright tests

Browser-level verification for the public DataWarsaw site. Two suites live under
`tests/`:

- `smoke.spec.js` — live availability check against `https://datawarsaw.com`
  (absolute URL, so it always exercises production).
- `visual.spec.js` — deterministic Percy visual snapshots of the homepage at the
  validated desktop and mobile widths.

## Prerequisites

- Node 20+ and the Chromium browser: `npx playwright install chromium`
- Python 3 for the local static server that the visual suite starts
  (`python -m http.server`), unless `PW_BASE_URL` points at a remote origin.

## Commands

```powershell
npm test                      # both suites (desktop project; visual also on mobile)
npm run test:smoke            # live production availability check
npm run test:visual           # Percy visual snapshots, uploaded to Percy
npm run test:visual:dry-run   # Percy visual snapshots created locally, no upload
```

The visual suite serves `../site` on `http://127.0.0.1:8081` and captures the
homepage through the Percy CLI. `test:visual:dry-run` runs the same test through
the local Percy server without a token and without creating a remote build, which
is the way to verify the integration locally. An existing server on port 8081 is
reused.

## Percy token

`npm run test:visual` uploads snapshots and therefore needs a project token:

```powershell
$env:PERCY_TOKEN = "<token from the Percy project settings>"
npm run test:visual
```

The token is never committed. The first successful upload creates the build that
becomes the baseline for the snapshot names below, and that build has to be
approved in the Percy dashboard before later runs compare against it.

Snapshot names:

- `DataWarsaw homepage (desktop-chromium)` — 1440x900
- `DataWarsaw homepage (mobile-chromium)` — 390x844

## Determinism

Visual snapshots are intentionally captured in a fixed state:

- `prefers-reduced-motion: reduce` (playwright.config.js) makes the site render
  its complete static state and halt its animation loops.
- Requests to `api.github.com` and the Open-Meteo hosts are aborted, so the
  Warsaw Data Pulse and the GitHub activity module render their documented
  fallback states instead of live data.

Snapshotting the live-data states is a separate concern and would need masking or
API fixtures.

## Targeting another origin

```powershell
$env:PW_BASE_URL = "https://datawarsaw.com"
npm run test:visual
```
