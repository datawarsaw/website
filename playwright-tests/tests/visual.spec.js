// Deterministic Percy visual smoke test for the DataWarsaw homepage.
//
// Snapshots are created by the Percy CLI, which wraps the Playwright run:
//
//   npm run test:visual           create snapshots and upload them to Percy
//   npm run test:visual:dry-run   create snapshots locally, no upload, no token
//
// Determinism has two sources: prefers-reduced-motion (set in
// playwright.config.js) makes the site render its complete static state, and the
// third-party live APIs are aborted so the Warsaw Data Pulse and the GitHub
// activity module render their documented fallback states instead of data that
// changes between runs.

const { test, expect } = require('@playwright/test');
const percySnapshot = require('@percy/playwright');

const LIVE_APIS =
  /^https:\/\/(api\.github\.com|api\.open-meteo\.com|air-quality-api\.open-meteo\.com)\//;

const MAX_REPORTED_FAILURES = 20;

const KEY_HEADINGS = [
  '#hero-title',
  '#about-title',
  '#experience-title',
  '#approach-title',
  '#practice-title',
  '#pulse-title',
  '#contact-title'
];

// The Data Pulse and Work in Practice modules load once they scroll into view,
// so the page has to be traversed before the snapshot is taken.
async function scrollThroughPage(page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  for (let offset = 0; offset < pageHeight; offset += 600) {
    await page.evaluate(y => window.scrollTo(0, y), offset);
    await page.waitForTimeout(50);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
}

test('DataWarsaw homepage visual snapshot', async ({ page }, testInfo) => {
  // Every project declares its own viewport in playwright.config.js and the
  // Percy snapshot is bound to it, so an unexpected project shape is a hard
  // error rather than a silent fall back to Percy's default widths.
  const viewport = testInfo.project.use && testInfo.project.use.viewport;

  if (!viewport || !viewport.width || !viewport.height) {
    throw new Error(
      `Project "${testInfo.project.name}" has no explicit \`use.viewport\`, so its Percy snapshot ` +
        'cannot be bound to a viewport. Set one in playwright.config.js.'
    );
  }

  const pageErrors = [];
  const failedRequests = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    // The live third-party APIs are aborted on purpose. Anything else failing —
    // a dropped local asset such as script.js, for example — fails the test.
    if (LIVE_APIS.test(request.url())) return;

    if (failedRequests.length < MAX_REPORTED_FAILURES) {
      const reason = (request.failure() || {}).errorText || 'unknown error';
      failedRequests.push(`${request.url()} :: ${reason}`);
    }
  });

  await page.route(LIVE_APIS, route => route.abort());
  await page.goto('/', { waitUntil: 'load' });

  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle(/\S/);

  // script.js marks the reveal elements visible as it boots. Asserting that here
  // turns a dropped local asset (which leaves every lazy module unregistered)
  // into an immediate, readable failure instead of a downstream timeout.
  await expect(page.locator('.reveal.is-visible').first()).toBeVisible({ timeout: 10000 });

  await scrollThroughPage(page);

  // Fallback states settle asynchronously; waiting for them keeps the snapshot
  // from capturing a half-populated module.
  await expect(page.locator('[data-practice-status]')).toHaveClass(/is-fallback/, { timeout: 10000 });
  await expect(page.locator('[data-pulse-status]')).toHaveClass(/is-fallback/, { timeout: 10000 });

  for (const heading of KEY_HEADINGS) {
    await expect(page.locator(heading)).toBeVisible();
  }

  // Repository responsive rule: no horizontal overflow at any validated width.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  expect(pageErrors).toEqual([]);
  expect(failedRequests, `Unexpected failed requests:\n${failedRequests.join('\n')}`).toEqual([]);

  await percySnapshot(page, `DataWarsaw homepage (${testInfo.project.name})`, {
    // Binding the snapshot to the project viewport: these two options are what
    // the CLI and renderer use, and they default to 375/1280 plus a 1024px
    // minimum height when omitted.
    widths: [viewport.width],
    minHeight: viewport.height,
    percyCSS: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
});
