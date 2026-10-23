// Reproducible, local-only social image. Uses the approved logo and brand tokens.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '../..');
  const tokens = fs.readFileSync(path.join(root, 'site/assets/brand-tokens.css'), 'utf8');
  const logo = fs.readFileSync(path.join(root, 'site/assets/brand/wa-lockup-horizontal.svg')).toString('base64');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><style>${tokens}
      * { box-sizing: border-box; } body { margin: 0; width: 1200px; height: 630px; padding: 48px 64px; background: var(--wa-off-white); color: var(--wa-charcoal); }
      header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 28px; border-bottom: 1px solid var(--wa-border); }
      img { width: 245px; } .label { font: 14px var(--wa-font-mono); text-transform: uppercase; letter-spacing: .1em; }
      h1 { margin: 42px 0 24px; font: 400 68px/1.06 var(--wa-font-display); letter-spacing: -.02em; color: var(--wa-deep-teal); }
      h1 span { display: block; } p { font: 21px/1.6 var(--wa-font-ui); margin: 0; }
      footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--wa-border); display: flex; justify-content: space-between; }
    </style><body><header><img src="data:image/svg+xml;base64,${logo}" alt="Warsaw Analytica"><span class="label">Independent engineering / Warsaw</span></header><h1><span>Agent Platform:</span>engineering AI agents<br>you can <em>inspect</em>.</h1><p>Scoped workflows. Inspectable evidence. Human acceptance.</p><footer class="label"><span>Active development</span><span>datawarsaw.com</span></footer></body></html>`);
    await page.locator('img').evaluate(img => img.decode());
    await page.screenshot({ path: path.join(root, 'site/assets/brand/og-agent-platform.png') });
    console.log('Rendered site/assets/brand/og-agent-platform.png (1200 × 630)');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
