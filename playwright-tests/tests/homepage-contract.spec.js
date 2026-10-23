const { test, expect } = require('@playwright/test');

test('homepage positioning, navigation, assets and responsive contract', async ({ page }, testInfo) => {
  const errors = [];
  const failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => failed.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fontState = await page.evaluate(() => ({
    display: getComputedStyle(document.querySelector('h1')).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    mono: getComputedStyle(document.querySelector('.eyebrow')).fontFamily,
    loaded: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family.replaceAll('"', '')),
    external: performance.getEntriesByType('resource').filter(entry => new URL(entry.name).origin !== location.origin).map(entry => entry.name)
  }));
  expect(fontState.display).toMatch(/^"Bodoni Moda"/);
  expect(fontState.body).toMatch(/^Inter/);
  expect(fontState.mono).toMatch(/^"JetBrains Mono"/);
  expect(fontState.loaded).toEqual(expect.arrayContaining(['Bodoni Moda', 'Inter', 'JetBrains Mono']));
  expect(fontState.external).toEqual([]);
  await expect(page).toHaveTitle('Agent Platform — Warsaw Analytica');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Agent Platform: engineering AI agents you can inspect.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://datawarsaw.com/');
  await expect(page.locator('.hero-note')).toContainText('early-stage, founder-led');
  await expect(page.locator('#platform .specimen-status')).toContainText('Active development');
  await expect(page.locator('.readiness-column')).toHaveCount(3);
  await expect(page.locator('#planned-title')).toHaveText('Planned');
  await expect(page.locator('#evaluation')).toContainText('Claude Code');
  await expect(page.locator('#evaluation')).toContainText('Claude API');
  await expect(page.locator('#evaluation')).toContainText('Grok API & Grok Build');
  await expect(page.locator('.topology figcaption')).toContainText('Illustrative architecture');
  await expect(page.locator('.pipeline-grid li')).toHaveCount(6);
  await expect(page.locator('#contact .contact-email')).toHaveAttribute('href', 'mailto:michal@datawarsaw.com');
  await expect(page.locator('.header-briefing')).toBeInViewport();
  const linkProblems = await page.evaluate(() => [...document.querySelectorAll('a')].flatMap(a => {
    const href = a.getAttribute('href');
    return !href || href === '#' || (href.startsWith('#') && !document.getElementById(href.slice(1))) ? [href] : [];
  }));
  expect(linkProblems).toEqual([]);
  await page.locator('.footer-brand').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(testInfo.project.use.viewport.width);
  // Every readable region must fit its own box, not merely the document.
  const clipped = await page.locator('h1, h2, h3, h4, p, dt, dd, .button').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent));
  expect(clipped).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));

  if (testInfo.project.use.viewport.width <= 1000) {
    const toggle = page.getByRole('button', { name: /Menu/ });
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name: 'Agent Platform', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(nav).toBeHidden();
    await toggle.click();
    await nav.getByRole('link', { name: 'Architecture', exact: true }).click();
    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#architecture')).toBeFocused();
    await expect(page).toHaveURL(/#architecture$/);
  } else {
    // Start from a fresh document so the skip link is the first tab stop.
    await page.reload();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  }
  await page.getByRole('link', { name: /Explore Agent Platform/ }).click();
  await expect(page).toHaveURL(/#system-ledger$/);
  const targetTop = await page.locator('#system-ledger').evaluate(el => el.getBoundingClientRect().top);
  const headerBottom = await page.locator('.site-header').evaluate(el => el.getBoundingClientRect().bottom);
  expect(targetTop).toBeGreaterThanOrEqual(headerBottom);
  await page.locator('.hero-body').getByRole('link', { name: /Request technical briefing/ }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact .contact-panel .button')).toHaveAttribute('href', /^mailto:michal@datawarsaw\.com\?subject=/);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test('homepage remains readable and navigable without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto(testInfo.project.use.baseURL || 'http://127.0.0.1:8081');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.locator('#contact .contact-email')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  await context.close();
});

test('existing routes, local assets and legacy data links remain reachable', async ({ page, request }) => {
  for (const route of ['/analytics/', '/experiments/', '/experiments/scout/', '/observability/', '/data/current-run.json', '/data/sanity-experiments.json']) {
    expect((await request.get(route)).status(), route).toBe(200);
  }
  await page.route(/^https:\/\/(api\.github\.com|api\.open-meteo\.com|air-quality-api\.open-meteo\.com)\//, route => route.abort());
  await page.goto('/#pulse');
  await expect(page).toHaveURL(/\/analytics\/#pulse$/);
  await expect(page.locator('#pulse-title')).toBeVisible();
  await page.goto('/#experience');
  await expect(page).toHaveURL(/\/analytics\/#experience$/);
  await expect(page.locator('#experience-title')).toBeVisible();
});

test('social preview is a real local PNG and unknown routes return a usable 404', async ({ page, request }) => {
  await page.goto('/');
  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(imageUrl).toBe('https://datawarsaw.com/assets/brand/og-agent-platform.png');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', imageUrl);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const image = await request.get(new URL(imageUrl).pathname);
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toBe('image/png');
  const data = await image.body();
  expect(data.subarray(1, 4).toString()).toBe('PNG');
  expect(data.readUInt32BE(16)).toBe(1200);
  expect(data.readUInt32BE(20)).toBe(630);
  for (const route of ['/this-page-does-not-exist/', '/experiments/missing-nested-page/', '/missing-file.html']) {
    const response = await page.goto(route);
    expect(response.status()).toBe(404);
    await expect(page).toHaveTitle('Page not found — Warsaw Analytica');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  }
  await page.getByRole('link', { name: /Return to Agent Platform/ }).click();
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('homepage fonts do not change typography on existing routes or the 404 page', async ({ page }) => {
  for (const route of ['/404.html', '/analytics/', '/experiments/', '/observability/']) {
    await page.route('**/api/telemetry', route => route.fulfill({ status: 503, body: '{}' }));
    await page.route(/^https:\/\/(api\.github\.com|api\.open-meteo\.com|air-quality-api\.open-meteo\.com)\//, route => route.abort());
    await page.goto(route, { waitUntil: 'load' });
    await expect(page.locator('link[href="/assets/fonts/homepage-fonts.css"]')).toHaveCount(0);
    expect(await page.evaluate(() => [...document.fonts].some(font => /Bodoni Moda|Inter|JetBrains Mono/.test(font.family)))).toBe(false);
    if (route === '/404.html') expect(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily)).not.toMatch(/^Inter/);
  }
});

test('evidence links render existing experiments and observability fallbacks', async ({ page }) => {
  const errors = [];
  const failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failed.push(request.url()));
  // Explicit service failures exercise the preserved frontend fallbacks locally.
  // They do not run or modify Cloudflare Functions, D1, or the CMS.
  await page.route('**/data/sanity-experiments.json', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/telemetry', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/');
  await page.locator('.evidence-list a[href="/experiments/"]').click();
  await expect(page).toHaveURL(/\/experiments\/$/);
  await expect(page.locator('.exp-card').first()).toBeVisible();
  await expect(page.locator('[data-exp-count]')).toContainText('experiment');
  const count = await page.locator('.exp-card').count();
  expect(count).toBeGreaterThan(0);
  await page.locator('[data-filter]').first().click();
  await expect(page.locator('.exp-card:visible')).toHaveCount(count);
  await page.goto('/');
  await page.locator('.evidence-list a[href="/observability/"]').click();
  await expect(page).toHaveURL(/\/observability\/$/);
  await expect(page.locator('[data-run-task]')).not.toHaveText(/^(—|Loading.*|)$/);
  await expect(page.locator('[data-global-status-text]')).not.toHaveText(/^(Loading.*|)$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});
