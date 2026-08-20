const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8098;
const CHROME_PORT = 9245;
const SITE_DIR = 'C:/AI/datawarsaw/site';
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const USER_DATA = path.join(require('os').tmpdir(), 'chrome_obs_qa_' + Date.now());
const OUTPUT_DIR = 'C:/AI/datawarsaw/benchmark-output/observability-page';

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
  if (reqPath === '/' || reqPath === '/observability' || reqPath === '/observability/') {
    reqPath = '/observability/index.html';
  }
  const cleanRelPath = reqPath.startsWith('/') ? reqPath.slice(1) : reqPath;
  const filePath = path.join(SITE_DIR, cleanRelPath);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + reqPath);
    } else {
      res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log('Observability test server running on port ' + PORT);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--no-sandbox',
    '--remote-debugging-port=' + CHROME_PORT,
    '--user-data-dir=' + USER_DATA,
    'http://127.0.0.1:' + PORT + '/observability/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  console.log('Connecting to Chrome debugging port ' + CHROME_PORT + '...');
  const results = {
    viewports: [],
    consoleErrors: [],
    interactions: []
  };

  try {
    let tabs = null;
    for (let i = 0; i < 10; i++) {
      try {
        const listRes = await fetch('http://127.0.0.1:' + CHROME_PORT + '/json');
        if (listRes.ok) {
          tabs = await listRes.json();
          if (tabs && tabs.length) break;
        }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 500));
    }
    if (!tabs) throw new Error('Could not connect to Chrome debugging endpoint');
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    if (!pageTab) throw new Error('No page tab found');

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    let msgId = 1;
    const pending = new Map();

    ws.addEventListener('message', (event) => {
      const raw = typeof event.data === 'string' ? event.data : event.data.toString('utf-8');
      const msg = JSON.parse(raw);
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
    });

    await new Promise((resolve, reject) => {
      if (ws.readyState === 1) return resolve();
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Runtime.enable');
    await send('Page.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/observability/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    // Test initial rendering
    const initCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const header = document.querySelector(".obs-header");' +
        'const nodes = document.querySelectorAll(".flow-node-item");' +
        'const events = document.querySelectorAll(".obs-event-row");' +
        'const task = document.querySelector("[data-run-task]");' +
        'const statusBadge = document.querySelector("[data-run-status-badge]");' +
        'return {' +
          'headerExists: Boolean(header),' +
          'nodesCount: nodes.length,' +
          'eventsCount: events.length,' +
          'taskTitle: task ? task.textContent : null,' +
          'statusText: statusBadge ? statusBadge.textContent : null' +
        '};' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Initial Render', details: initCheck.result.value });

    // Test node clicking & inspector modal
    const nodeClickCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const nodes = document.querySelectorAll(".flow-node-item");' +
        'if (nodes.length > 0) {' +
          'nodes[0].click();' +
          'const inspector = document.querySelector("[data-node-inspector]");' +
          'const isHidden = inspector ? inspector.classList.contains("is-hidden") : true;' +
          'const title = document.querySelector("[data-ins-title]");' +
          'return {' +
            'clickedNode: 0,' +
            'inspectorOpen: !isHidden,' +
            'inspectorTitle: title ? title.textContent : null' +
          '};' +
        '}' +
        'return null;' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Node Inspector Open', details: nodeClickCheck.result.value });

    // Close inspector
    await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const closeBtn = document.querySelector("[data-inspector-close]");' +
        'if (closeBtn) closeBtn.click();' +
      '})()'
    });
    await new Promise(r => setTimeout(r, 200));

    const closeCheck = await send('Runtime.evaluate', {
      expression: '(() => {' +
        'const inspector = document.querySelector("[data-node-inspector]");' +
        'return { inspectorClosed: inspector ? inspector.classList.contains("is-hidden") : true };' +
      '})()',
      returnByValue: true
    });
    results.interactions.push({ step: 'Inspector Close', details: closeCheck.result.value });

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

      results.viewports.push({
        viewport: vp.name + ' (' + vp.width + 'x' + vp.height + ')',
        scrollWidth: overflowVal.scrollWidth,
        innerWidth: overflowVal.innerWidth,
        hasOverflow: overflowVal.hasOverflow
      });
    }

    console.log('=== OBSERVABILITY PAGE VERIFICATION RESULT ===');
    console.log(JSON.stringify(results, null, 2));
    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    chrome.kill();
    server.close();
  }
});

