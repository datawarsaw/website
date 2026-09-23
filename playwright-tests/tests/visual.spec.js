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
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

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

  await percySnapshot(page, `DataWarsaw homepage (${testInfo.project.name})`, {
    percyCSS: '*, *::before, *::after { animation: none !important; transition: none !important; }'
  });
});
