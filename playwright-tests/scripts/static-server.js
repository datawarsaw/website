// Minimal static file server for the local `site/` directory.
//
// Used by playwright.config.js as the webServer for the visual suite. Python's
// `http.server` was the original choice, but it intermittently resets
// connections under Chrome's parallel request burst, which occasionally dropped
// `script.js` and left the page uninitialised.

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', 'site');
const PORT = Number(process.env.PORT || 8081);
const HOST = process.env.HOST || '127.0.0.1';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
};

function send(response, status, headers, body, method) {
  response.writeHead(status, headers);
  response.end(method === 'HEAD' ? undefined : body);
}

const server = http.createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${HOST}:${PORT}`);
  const target = path.join(ROOT, decodeURIComponent(pathname));

  if (!target.startsWith(ROOT)) {
    send(response, 403, { 'content-type': 'text/plain; charset=utf-8' }, 'Forbidden', request.method);
    return;
  }

  fs.stat(target, (statError, stats) => {
    const filePath = !statError && stats.isDirectory() ? path.join(target, 'index.html') : target;

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        send(
          response,
          404,
          { 'content-type': 'text/plain; charset=utf-8' },
          'Not found',
          request.method
        );
        return;
      }

      send(
        response,
        200,
        {
          'content-type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
          'content-length': data.length,
          // Keep snapshots independent of whatever the browser cached last run.
          'cache-control': 'no-store'
        },
        data,
        request.method
      );
    });
  });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`serving ${ROOT} on http://${HOST}:${PORT}\n`);
});
