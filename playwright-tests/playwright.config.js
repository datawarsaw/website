// Playwright configuration for the DataWarsaw browser suites.
//
// Two suites live under ./tests:
//   - smoke.spec.js  : live availability check against production (absolute URL).
//   - visual.spec.js : deterministic Percy visual snapshots of the homepage.
//
// The visual suite targets a locally served copy of `site/` by default so the
// captured state is hermetic. Set PW_BASE_URL to snapshot a different origin,
// for example PW_BASE_URL=https://datawarsaw.com.

const path = require('path');
const { defineConfig } = require('@playwright/test');

const BASE_URL = process.env.PW_BASE_URL || 'http://127.0.0.1:8081';
const SERVES_LOCAL_SITE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(BASE_URL);
const SITE_DIR = path.resolve(__dirname, '..', 'site');

module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],

  webServer: SERVES_LOCAL_SITE
    ? {
        command: `python -m http.server 8081 --directory "${SITE_DIR}"`,
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 30 * 1000
      }
    : undefined,

  use: {
    baseURL: BASE_URL,
    // The site renders a complete, static state under prefers-reduced-motion and
    // halts its animation loops, which keeps the visual snapshots deterministic.
    reducedMotion: 'reduce',
    trace: 'off',
    video: 'off'
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { viewport: { width: 1440, height: 900 } }
    },
    {
      // Mobile coverage is scoped to the visual suite so the production smoke
      // check keeps running once per run.
      name: 'mobile-chromium',
      testMatch: /visual\.spec\.js/,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
    }
  ]
});
