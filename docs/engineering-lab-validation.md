# Engineering Lab — local implementation and validation

Date: 2026-10-23. Status: WAITING_FOR_USER / Human Acceptance. No push, merge, deployment, Cloudflare configuration change, credential access or telemetry publication.

## Scope and source

Implemented the Product-Focused Editorial Engineering Lab from the exact required export:
`C:/Users/micha/Downloads/stitch_warsaw_analytica_agent_platform_website_redesign(1).zip` (`screen.png`, `code.html`, `DESIGN.md`).
Archive SHA-256: `FA1E39D1B56B8E1621309DAD9E7210B9281BE424A553D1AB1950D99825FD345D`.
The earlier export was not substituted.

Preflight fetched `origin` successfully. Working branch and upstream: `codex/warsaw-analytica-stitch` / `origin/codex/warsaw-analytica-stitch`, starting HEAD `e80d647`. `origin/main` was `868ebfb` (merge of the previous redesign). This records remote Git state, not a new verification of live production. Pre-existing untracked `.wrangler/`, `research/`, `site/.wrangler/` were preserved and excluded.

## Implementation and visual assessment

- Agent Platform is the homepage's central initiative. The approved hero leads into readiness, execution topology, genuine evidence, vendor-neutral evaluation, founder profile and technical briefing.
- Preserved the reference's asymmetric 2:1 hero/specimen, metadata ledger, three readiness columns, six-stage workflow and dark task-record band, evidence rows, three evaluation columns, split founder profile and numbered editorial rhythm.
- Canonical warm off-white, charcoal/deep teal, hairlines, square corners and Variant D lockup take precedence over generated colors and mock branding. No canonical token or logo was changed.
- Owner's follow-up decision on 2026-10-23 authorizes Bodoni Moda / Inter / JetBrains Mono on the homepage only. The homepage now uses locally hosted WOFF2 files (Latin and Latin Extended), retaining their OFL licenses and original family names. Overrides are scoped to `body.homepage`; canonical token stacks, SVG logos, 404, existing routes and the social image remain unchanged. No external font service is called at runtime. See `site/assets/fonts/README.md` for provenance.
- Functional table/matrix text remains sans-serif per brandbook, rather than copying generated serif labels. Text was rewritten after a full [claim audit](engineering-lab-claim-audit.md).
- The reference's fake terminal is replaced by a clearly illustrative task record. Fictional publications, benchmark figures, security guarantees, legal identity, PGP and street address were removed. A direct founder email replaces the form.
- No separate `/agent-platform/` page: this homepage already supplies its definition, status, architecture, evidence and contact. Another page would duplicate that information within this iteration.
- Responsive layout uses single-column readiness/evaluation/workflow on narrow screens and a keyboard-operable progressive-enhancement menu. Header briefing remains visible at 375px. Existing analytics modules retain their own CSS/JS and routes.

Rendered desktop composition was visually compared with the supplied screenshot; homepage and analytics screenshots were inspected at all six widths, with enlarged hero crops for 375/390/768/1440. Structural composition is faithful; this is not a pixel-identical reproduction. Shorter factual content, canonical logo/palette, a simpler contact area and responsive rearrangement intentionally change wrapping and section heights. The homepage typography now follows the owner's selected Stitch families.

## Technical corrections

- Added a real local 1200×630 PNG, full Open Graph image metadata and X/Twitter large-image metadata with alt text. `playwright-tests/scripts/render-social-image.js` reproducibly renders the asset from the canonical logo/tokens using existing Playwright; no external image service or new dependency.
- Added `site/404.html` with working recovery links and `noindex`. A top-level 404 prevents the default Pages SPA fallback, per [Cloudflare's serving documentation](https://developers.cloudflare.com/pages/configuration/serving-pages/). Updated only the local static server to mirror custom HTML 404 responses; no Cloudflare settings were changed. Edge behavior remains to be checked after any separately authorized deployment.
- Preserved `/analytics/`, `/experiments/`, `/experiments/scout/`, `/observability/`, public JSON, and legacy root `#pulse` / `#experience` redirection.
- Kept initiative terminology consistently “Active development”; capability states are Existing / Experimental / Planned. No production SLA or completed Claude/Grok integration implied.

## Executed validation

| Viewport | Homepage + no JS | Overflow/text bounds | Keyboard / CTA / 404 / image | Analytics fallback screenshot | Evidence-page fallbacks |
| --- | --- | --- | --- | --- | --- |
| 375×667 | PASS | PASS | PASS | PASS | PASS |
| 390×844 | PASS | PASS | PASS | PASS | PASS |
| 430×932 | PASS | PASS | PASS | PASS | PASS |
| 768×1024 | PASS | PASS | PASS | PASS | PASS |
| 1024×900 | PASS | PASS | PASS | PASS | PASS |
| 1440×900 | PASS | PASS | PASS | PASS | PASS |

From `playwright-tests/`:

```powershell
npx.cmd playwright test tests/homepage-contract.spec.js tests/visual.spec.js
# 36 passed (37.3s); before adding the additional evidence-link test below
npx.cmd playwright test tests/homepage-contract.spec.js --grep "evidence links" --output=test-results-evidence
# 6 passed (11.0s)
```

The first run found header wrapping at 375px and anchor occlusion. A shorter mobile briefing label fixed the underlying header width; the full 36-test run then passed. No test tolerance was relaxed. The evidence test follows real homepage links and deliberately returns 503 for CMS/API requests to exercise the existing JSON fallbacks. These intentional service failures are distinct from unexpected resource errors.

After the typography follow-up, both suites were repeated together with the first command: **48 passed (52.5s)**. Added checks verify the three loaded font families, no external resource requests on the homepage, and absence of the homepage font stylesheet/font faces from `/404.html`, `/analytics/`, `/experiments/` and `/observability/`. Homepage snapshots explicitly wait for `document.fonts.ready`. Existing Percy adapter reported “Percy is not running, disabling snapshots”; Playwright still produced actual PNG screenshots. No Percy upload, baseline comparison, credentials or remote visual service was used. Production smoke was deliberately excluded from this local-only task.

From repository root, all passed:

```powershell
node --check site/homepage.js
node --check playwright-tests/scripts/static-server.js
node --check playwright-tests/scripts/render-social-image.js
node --check playwright-tests/tests/homepage-contract.spec.js
node --check playwright-tests/playwright.config.js
node evals/test_frontend_observability.mjs
node evals/test_experiments_runtime.mjs
node evals/test_sync_failure.mjs
git diff --check
```

Experiments checks cover valid and empty primary data, filters, missing/malformed/structurally invalid data and total failure. The build-sync failure test uses an intentionally invalid host, verifies nonzero exit and preserves the existing snapshot byte-for-byte; no live CMS sync/build was performed. This is a buildless static site: validation does not require a framework build or new dependencies.

Initial implementation measurements, before local web fonts: six widths × reduced and normal motion (12 states), zero document overflow, observed CLS 0, no runtime or console errors. Under reduced motion, scroll behavior is `auto` and both button transitions are `0s`. Desktop → 768px → desktop focus/navigation behavior passed after waiting for the media-query event.

After the typography follow-up, six fresh Chromium contexts measured zero document overflow and CLS values `0 / 0 / 0 / 0.000044799 / 0.000404977 / 0.000303540` at 375/390/430/768/1024/1440 respectively. These are small measured shifts, not a claim of exact zero or of slow-network performance. DevTools' platform-font inspection confirmed the actual custom Bodoni Moda face was used. An intentional font-request failure at 375px retained readable content and zero document overflow. Evidence: `playwright-tests/test-results/font-layout-evidence.json`. Three critical font faces are preloaded with `crossorigin`; `font-size-adjust: from-font` progressively normalizes fallback x-height in supporting browsers.

Screenshots: `playwright-tests/test-results/visual-Warsaw-Analytica-redesigned-homepage-visual-snapshot-<project>/homepage.png`, plus corresponding analytics snapshots and enlarged `*-top.png` crops. Local screenshot evidence is ignored by Git.

## Independent review

The initial implementation used two read-only subagents. The first audited the complete export against accessible platform/project evidence. The second reviewed source/diff, content, scope and screenshot fidelity in fresh context and returned PASS with no actionable findings. A third read-only reviewer checked the subsequent homepage-only typography change, including scope, font metadata, licenses and final 1440/375 screenshots, and returned PASS with no actionable findings. No delegated agent edited files.

- Claim auditor: model UNAVAILABLE (self-reported Codex/GPT-6, exact model not independently observable); reasoning effort UNAVAILABLE; active duration UNAVAILABLE. Scope: evidence/classification only.
- Fresh-context reviewer: model UNAVAILABLE (self-reported Codex/GPT-6); requested reasoning effort `medium`; active duration UNAVAILABLE. Observed dispatch-to-result wall interval approximately 211 seconds. Scope: read-only final source/content/visual review.
- Typography reviewer: model UNAVAILABLE; requested reasoning effort `medium`; active duration UNAVAILABLE. Scope: read-only font asset, scoping, license and desktop/mobile screenshot review.

## Files changed

- `site/index.html`, `site/homepage.css`, `site/homepage.js`
- `site/404.html`, `site/assets/brand/og-agent-platform.png`
- `site/assets/fonts/`: eight WOFF2 subsets, scoped `homepage-fonts.css`, three OFL license notices and provenance `README.md` (typography follow-up)
- `playwright-tests/playwright.config.js`
- `playwright-tests/scripts/static-server.js`, `playwright-tests/scripts/render-social-image.js`
- `playwright-tests/tests/homepage-contract.spec.js`
- `playwright-tests/tests/visual.spec.js` (wait for homepage web fonts)
- `docs/engineering-lab-claim-audit.md`, this report, `state/project-state.md`

No edits to existing analytics/experiments/observability source, shared CSS/JS, Functions, CMS snapshots, deployment files, credentials or other projects.

## Local preview and remaining limits

```powershell
cd C:\AI\datawarsaw
node playwright-tests/scripts/static-server.js
```

Open `http://127.0.0.1:8081/`. Stop with Ctrl+C. Test server started by this task is stopped at closeout; screenshots remain available.

Remaining review limits: Chromium only; no real screen-reader, Safari/Firefox, production Pages/D1, live CMS, live API behavior, email delivery or remote social scraper verification. Mailto destinations and PNG/metadata are checked locally. No production change is asserted or performed.

Human Acceptance: approve the rendered composition with the selected homepage typography, factual capability wording, artifact choices, and direct email interaction. The font-family choice itself was explicitly approved by the owner on 2026-10-23. Production delivery remains separate authorized work. No additional product feature or new external runtime service was introduced.

PROJECT_STATE_UPDATED: YES — `state/project-state.md`.
NOTION_UPDATED: NO — this task is restricted to this repository; no external project-management mutation requested.
CAN_ARCHIVE: NO — awaits Human Acceptance. Local commit and final Git status are recorded in the chat closeout; no remote action is authorized.
