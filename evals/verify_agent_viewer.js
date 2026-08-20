const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8094;
const SITE_DIR = 'C:/AI/datawarsaw/site';
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const USER_DATA = 'C:/Users/micha/AppData/Local/Temp/chrome_test_profile_harness_qa';
const OUTPUT_DIR = 'C:/AI/datawarsaw/benchmark-output/agent-viewer';

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
    '--remote-debugging-port=9229',
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
    const listRes = await fetch('http://127.0.0.1:9229/json');
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

    // Test DOM and interactions
    const initCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const viewer = document.querySelector("[data-agent-viewer]");' +
        'const tabs = document.querySelectorAll(".harness-tab");' +
        'const nodes = document.querySelectorAll(".flow-node");' +
        'const inspectorTitle = document.querySelector("[data-inspector-title]");' +
        'const demoBadge = document.querySelector(".harness-demo-badge");' +
        'return {' +
          'viewerExists: Boolean(viewer),' +
          'tabsCount: tabs.length,' +
          'nodesCount: nodes.length,' +
          'inspectorTitle: inspectorTitle ? inspectorTitle.textContent : null,' +
          'demoBadgeText: demoBadge ? demoBadge.textContent : null' +
        '};' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Initial Render', details: initCheck.result.value });

    // Test tab switching
    const tabSwitchCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const tabs = document.querySelectorAll(".harness-tab");' +
        'if (tabs.length > 1) {' +
          'tabs[1].click();' +
          'const nodesAfter = document.querySelectorAll(".flow-node");' +
          'const metaTask = document.querySelector("[data-meta-task]");' +
          'return {' +
            'switchedToTab2: true,' +
            'nodesCount: nodesAfter.length,' +
            'metaTask: metaTask ? metaTask.textContent : null' +
          '};' +
        '}' +
        'return { switchedToTab2: false };' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Tab Switch', details: tabSwitchCheck.result.value });

    // Switch back to Tab 1
    await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const tabs = document.querySelectorAll(".harness-tab");' +
        'if (tabs.length > 0) tabs[0].click();' +
      '})()'
    });
    await new Promise(r => setTimeout(r, 300));

    // Test node clicking
    const nodeClickCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const nodes = document.querySelectorAll(".flow-node");' +
        'if (nodes.length > 1) {' +
          'nodes[1].click();' +
          'const inspectorRole = document.querySelector("[data-inspector-role]");' +
          'const inspectorTitle = document.querySelector("[data-inspector-title]");' +
          'return {' +
            'clickedNode: 1,' +
            'inspectorRole: inspectorRole ? inspectorRole.textContent : null,' +
            'inspectorTitle: inspectorTitle ? inspectorTitle.textContent : null' +
          '};' +
        '}' +
        'return null;' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Node Click', details: nodeClickCheck.result.value });

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
          'const mod = document.querySelector(".harness-module");' +
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

    console.log(JSON.stringify(results, null, 2));
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    chrome.kill();
    server.close();
  }
});
