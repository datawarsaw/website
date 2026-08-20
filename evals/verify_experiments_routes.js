const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8093;
const CHROME_PORT = 9253;
const SITE_DIR = path.resolve('site');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const USER_DATA = path.join(require('os').tmpdir(), 'chrome_exp_qa_' + Date.now());
const OUTPUT_DIR = path.resolve('benchmark-output/experiments-qa');

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
  if (reqPath.endsWith('/')) {
    reqPath += 'index.html';
  }
  let filePath = path.join(SITE_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found: ' + req.url);
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIMES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log('Static server listening on port ' + PORT);

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--no-sandbox',
    '--remote-debugging-port=' + CHROME_PORT,
    '--user-data-dir=' + USER_DATA,
    'http://127.0.0.1:' + PORT + '/'
  ]);

  let tabs = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch('http://127.0.0.1:' + CHROME_PORT + '/json');
      if (res.ok) {
        tabs = await res.json();
        if (tabs && tabs.length > 0) break;
      }
    } catch (e) {}
  }

  if (!tabs || !tabs.length) {
    console.error('Could not connect to Chrome debugging port');
    chrome.kill();
    server.close();
    process.exit(1);
  }

  const target = tabs.find(t => t.type === 'page') || tabs[0];
  const wsUrl = target.webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  const cdpReq = (method, params = {}) => new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const msg = JSON.stringify({ id, method, params });
    const handler = (evt) => {
      const parsed = JSON.parse(evt.data || evt);
      if (parsed.id === id) {
        ws.removeEventListener('message', handler);
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(msg);
  });

  const consoleErrors = [];
  ws.addEventListener('message', (evt) => {
    try {
      const msg = JSON.parse(evt.data || evt);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text + ': ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
    } catch (e) {}
  });

  await cdpReq('Page.enable', {});
  await cdpReq('Runtime.enable', {});

  const routes = [
    { name: 'homepage', path: '/' },
    { name: 'observability', path: '/observability/' },
    { name: 'experiments_index', path: '/experiments/' },
    { name: 'experiments_scout', path: '/experiments/scout/' }
  ];

  const viewports = [
    { width: 375, height: 667, name: 'mobile_375' },
    { width: 390, height: 844, name: 'mobile_390' },
    { width: 430, height: 932, name: 'mobile_430' },
    { width: 1440, height: 900, name: 'desktop_1440' }
  ];

  const results = [];

  for (const route of routes) {
    consoleErrors.length = 0;
    const url = 'http://127.0.0.1:' + PORT + route.path;
    await cdpReq('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 1200));

    for (const vp of viewports) {
      await cdpReq('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 900
      });

      await new Promise(r => setTimeout(r, 400));

      const evalRes = await cdpReq('Runtime.evaluate', {
        expression: 'JSON.stringify({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, title: document.title, headings: Array.from(document.querySelectorAll("h1, h2")).map(h => h.innerText.trim()).slice(0, 4) })'
      });

      const data = JSON.parse(evalRes.result.value);
      const hasOverflow = data.scrollWidth > data.innerWidth;

      results.push({
        route: route.name,
        path: route.path,
        viewport: vp.name,
        width: vp.width,
        scrollWidth: data.scrollWidth,
        overflow: hasOverflow,
        title: data.title,
        headings: data.headings,
        consoleErrors: [...consoleErrors]
      });

      const shot = await cdpReq('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(OUTPUT_DIR, route.name + '_' + vp.name + '.png'), Buffer.from(shot.data, 'base64'));
    }
  }

  console.log('--- TEST RESULTS ---');
  console.log(JSON.stringify(results, null, 2)); fs.writeFileSync('evals/test_results.json', JSON.stringify(results, null, 2), 'utf8');

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
