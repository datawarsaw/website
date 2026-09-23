// Playwright configuration for the DataWarsaw browser suites.
//
// Two suites live under ./tests:
//   - smoke.spec.js  : live availability check against production (absolute URL).
//   - visual.spec.js : deterministic Percy visual snapshots of the homepage.
//
// The visual suite targets a locally served copy of `site/` by default so the
// captured state is hermetic. Set PW_BASE_URL to snapshot a different origin,
// for example PW_BASE_URL=https://datawarsaw.com.

const { defineConfig } = require('@playwright/test');

const BASE_URL = process.env.PW_BASE_URL || 'http://127.0.0.1:8081';
const SERVES_LOCAL_SITE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(BASE_URL);
const LOCAL_PORT = new URL(BASE_URL).port || '80';
// The mobile viewports required by the repository guidelines are only covered by
// the visual suite, so the production smoke check keeps running once per run.
const VISUAL_ONLY = /visual\.spec\.js/;

module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // The visual suite scrolls lazy modules into view before snapshotting, so it
  // needs more than the default 30s only when something is genuinely wrong;
  // individual assertions stay bounded so failures still surface quickly.
  timeout: 60 * 1000,
  reporter: [['list']],

  webServer: SERVES_LOCAL_SITE
    ? {
        command: 'node scripts/static-server.js',
        env: { PORT: LOCAL_PORT },
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
      name: 'mobile-compact-chromium',
      testMatch: VISUAL_ONLY,
      use: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true }
    },
    {
      name: 'mobile-chromium',
      testMatch: VISUAL_ONLY,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
    },
    {
      name: 'mobile-large-chromium',
      testMatch: VISUAL_ONLY,
      use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true }
    }
  ]
});
