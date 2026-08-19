const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8095;
const SITE_DIR = 'C:/AI/datawarsaw/site';
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const USER_DATA = 'C:/Users/micha/AppData/Local/Temp/chrome_test_profile_bench_qa';
const OUTPUT_DIR = 'C:/AI/datawarsaw/benchmark-output/benchmark-dashboard';

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MIMES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(SITE_DIR, reqPath);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

server.listen(PORT, async () => {
  console.log('Test server running on port ' + PORT);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--no-sandbox',
    '--remote-debugging-port=9230',
    '--user-data-dir=' + USER_DATA,
    'http://127.0.0.1:' + PORT + '/index.html#harness'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const results = {
    viewports: [],
    consoleErrors: [],
    interactions: []
  };

  try {
    const listRes = await fetch('http://127.0.0.1:9230/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) throw new Error('No page tab found');

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        results.consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        results.consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise(r => ws.onopen = r);

    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Runtime.enable');
    await send('Page.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html#harness' });
    await new Promise(r => setTimeout(r, 1500));

    // Test DOM and initial benchmark rendering
    const initCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const bench = document.querySelector("[data-model-benchmark]");' +
        'const tabs = document.querySelectorAll(".benchmark-tab");' +
        'const rows = document.querySelectorAll(".benchmark-table tbody tr");' +
        'const cols = document.querySelectorAll(".benchmark-table thead th");' +
        'const title = document.querySelector("[data-bmeta-title]");' +
        'const runs = document.querySelector("[data-bmeta-runs]");' +
        'const inspTitle = document.querySelector("[data-binspector-title]");' +
        'return {' +
          'benchExists: Boolean(bench),' +
          'tabsCount: tabs.length,' +
          'rowsCount: rows.length,' +
          'colsCount: cols.length,' +
          'metaTitle: title ? title.textContent : null,' +
          'metaRuns: runs ? runs.textContent : null,' +
          'inspectorTitle: inspTitle ? inspTitle.textContent : null' +
        '};' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Initial Render', details: initCheck.result.value });

    // Test switching to Dataset 2 (Harness Role Matrix)
    const tabSwitchCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const tabs = document.querySelectorAll(".benchmark-tab");' +
        'if (tabs.length > 1) {' +
          'tabs[1].click();' +
          'const rowsAfter = document.querySelectorAll(".benchmark-table tbody tr");' +
          'const titleAfter = document.querySelector("[data-bmeta-title]");' +
          'const inspTitleAfter = document.querySelector("[data-binspector-title]");' +
          'return {' +
            'switchedToTab2: true,' +
            'rowsCount: rowsAfter.length,' +
            'metaTitle: titleAfter ? titleAfter.textContent : null,' +
            'inspectorTitle: inspTitleAfter ? inspTitleAfter.textContent : null' +
          '};' +
        '}' +
        'return { switchedToTab2: false };' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Dataset Switch to Tab 2', details: tabSwitchCheck.result.value });

    // Switch back to Tab 1 (Frontend Workstation Benchmark V1)
    await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const tabs = document.querySelectorAll(".benchmark-tab");' +
        'if (tabs.length > 0) tabs[0].click();' +
      '})()'
    });
    await new Promise(r => setTimeout(r, 300));

    // Test clicking a model row (Gemini Flash)
    const rowClickCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const rows = document.querySelectorAll(".benchmark-table tbody tr");' +
        'if (rows.length > 1) {' +
          'rows[1].click();' +
          'const inspTitle = document.querySelector("[data-binspector-title]");' +
          'const inspTier = document.querySelector("[data-binspector-tier]");' +
          'const inspStatus = document.querySelector("[data-binspector-status]");' +
          'return {' +
            'clickedRow: 1,' +
            'inspectorTitle: inspTitle ? inspTitle.textContent : null,' +
            'inspectorTier: inspTier ? inspTier.textContent : null,' +
            'inspectorStatus: inspStatus ? inspStatus.textContent : null' +
          '};' +
        '}' +
        'return null;' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Row Click', details: rowClickCheck.result.value });

    // Test clicking a blocked model row (Ternary-Bonsai)
    const blockedRowClickCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const rows = document.querySelectorAll(".benchmark-table tbody tr");' +
        'if (rows.length > 4) {' +
          'rows[4].click();' +
          'const inspTitle = document.querySelector("[data-binspector-title]");' +
          'const inspStatus = document.querySelector("[data-binspector-status]");' +
          'const inspBottlenecks = document.querySelector("[data-binspector-bottlenecks]");' +
          'return {' +
            'clickedRow: 4,' +
            'inspectorTitle: inspTitle ? inspTitle.textContent : null,' +
            'inspectorStatus: inspStatus ? inspStatus.textContent : null,' +
            'inspectorBottlenecks: inspBottlenecks ? inspBottlenecks.textContent : null' +
          '};' +
        '}' +
        'return null;' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Blocked Model Click', details: blockedRowClickCheck.result.value });

    // Test column header click
    const colClickCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const metricBtns = document.querySelectorAll("th.is-metric-col button");' +
        'if (metricBtns.length > 0) {' +
          'metricBtns[0].click();' +
          'const highlightedTh = document.querySelectorAll("th.is-metric-col.is-highlighted");' +
          'const highlightedCells = document.querySelectorAll("td.is-col-highlighted");' +
          'const inspTitle = document.querySelector("[data-binspector-title]");' +
          'return {' +
            'clickedColBtn: 0,' +
            'highlightedThCount: highlightedTh.length,' +
            'highlightedCellsCount: highlightedCells.length,' +
            'inspectorTitle: inspTitle ? inspTitle.textContent : null' +
          '};' +
        '}' +
        'return null;' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Column Header Click', details: colClickCheck.result.value });

    // Viewport evaluations
    const viewports = [
      { name: 'mobile-375', width: 375, height: 667 },
      { name: 'mobile-390', width: 390, height: 844 },
      { name: 'mobile-430', width: 430, height: 932 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'tablet-1024', width: 1024, height: 768 },
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'desktop-1920', width: 1920, height: 1080 }
    ];

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });

      await new Promise(r => setTimeout(r, 400));

      const overflowCheck = await send('Runtime.evaluate', {
        expression: '(() => {' +
          'return {' +
            'scrollWidth: document.documentElement.scrollWidth,' +
            'innerWidth: window.innerWidth,' +
            'hasOverflow: document.documentElement.scrollWidth > window.innerWidth' +
          '};' +
        '})()',
        returnByValue: true
      });

      const overflowVal = overflowCheck.result.value;

      const rectRes = await send('Runtime.evaluate', {
        expression: '(() => {' +
          'const mod = document.querySelector(".benchmark-module");' +
          'if (!mod) return null;' +
          'mod.scrollIntoView({ block: "center" });' +
          'const r = mod.getBoundingClientRect();' +
          'return {' +
            'x: r.left + window.scrollX,' +
            'y: r.top + window.scrollY,' +
            'width: r.width,' +
            'height: r.height' +
          '};' +
        '})()',
        returnByValue: true
      });

      const r = rectRes.result.value;
      let shotSize = 0;
      if (r) {
        const shot = await send('Page.captureScreenshot', {
          clip: {
            x: Math.max(0, r.x),
            y: Math.max(0, r.y),
            width: r.width,
            height: r.height,
            scale: 1
          },
          captureBeyondViewport: true
        });

        const shotPath = path.join(OUTPUT_DIR, vp.name + '.png');
        fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
        shotSize = fs.statSync(shotPath).size;
      }

      results.viewports.push({
        viewport: vp.name + ' (' + vp.width + 'x' + vp.height + ')',
        scrollWidth: overflowVal.scrollWidth,
        innerWidth: overflowVal.innerWidth,
        hasOverflow: overflowVal.hasOverflow,
        screenshotSize: shotSize
      });
    }

    console.log('=== VERIFICATION RESULT ===');
    console.log(JSON.stringify(results, null, 2));
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    chrome.kill();
    server.close();
  }
});

