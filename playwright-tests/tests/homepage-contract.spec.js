const { test, expect } = require('@playwright/test');

test('homepage positioning, navigation, assets and responsive contract', async ({ page }, testInfo) => {
  const errors = [];
  const failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => failed.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Warsaw Analytica — AI Engineering & Infrastructure');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://datawarsaw.com/');
  await expect(page.locator('.hero-intro')).toContainText('independent AI engineering and infrastructure practice');
  await expect(page.locator('#platform .status-label')).toHaveText('Active development');
  await expect(page.locator('#evaluation')).toContainText('Planned integration & evaluation');
  await expect(page.locator('#evaluation')).toContainText('Claude Code');
  await expect(page.locator('#evaluation')).toContainText('Claude API');
  await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:michal@datawarsaw.com');
  await expect(page.locator('.principles li')).toHaveCount(4);
  const linkProblems = await page.evaluate(() => [...document.querySelectorAll('a')].flatMap(a => {
    const href = a.getAttribute('href');
    return !href || href === '#' || (href.startsWith('#') && !document.getElementById(href.slice(1))) ? [href] : [];
  }));
  expect(linkProblems).toEqual([]);
  // Trigger lazy footer assets before checking their load state.
  await page.locator('.footer-brand').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  const imageProblems = await page.locator('img').evaluateAll(images => images.filter(img => !img.complete || !img.naturalWidth).map(img => img.src));
  expect(imageProblems).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(testInfo.project.use.viewport.width);
  await page.evaluate(() => window.scrollTo(0, 0));

  if (testInfo.project.use.viewport.width < 801) {
    const toggle = page.getByRole('button', { name: /Menu/ });
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name: 'Architecture' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(nav).toBeHidden();
    await toggle.click();
    await nav.getByRole('link', { name: 'Platform', exact: true }).click();
    await expect(nav).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#platform')).toBeFocused();
    await expect(page).toHaveURL(/#platform$/);
  } else {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  }
  await page.getByRole('link', { name: /Explore Agent Platform/ }).click();
  await expect(page).toHaveURL(/#platform$/);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test('homepage remains readable and navigable without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto(testInfo.project.use.baseURL || 'http://127.0.0.1:8081');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.locator('.contact-email')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  await context.close();
});

test('existing routes, local assets and legacy data links remain reachable', async ({ page, request }) => {
  for (const route of ['/analytics/', '/experiments/', '/experiments/scout/', '/observability/', '/data/current-run.json', '/data/sanity-experiments.json']) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }
  await page.route(/^https:\/\/(api\.github\.com|api\.open-meteo\.com|air-quality-api\.open-meteo\.com)\//, route => route.abort());
  await page.goto('/#pulse');
  await expect(page).toHaveURL(/\/analytics\/#pulse$/);
  await expect(page.locator('#pulse-title')).toBeVisible();
  await page.goto('/#experience');
  await expect(page).toHaveURL(/\/analytics\/#experience$/);
  await expect(page.locator('#experience-title')).toBeVisible();
});
