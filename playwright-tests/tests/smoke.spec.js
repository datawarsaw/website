const { test, expect } = require('@playwright/test');

test('DataWarsaw smoke test', async ({ page }) => {
  const errors = [];

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  const response = await page.goto('https://datawarsaw.com', {
    waitUntil: 'domcontentloaded'
  });

  expect(response).not.toBeNull();
  expect(response.status()).toBeLessThan(400);

  await expect(page.locator('body')).toBeVisible();

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});
