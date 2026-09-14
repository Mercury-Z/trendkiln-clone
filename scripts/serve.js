#!/usr/bin/env node
// serve.js — tiny static file server for local preview.
// Usage: node scripts/serve.js [port]  (default 4173)
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.argv[2], 10) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'text/xml; charset=utf-8',
  '.atom': 'application/atom+xml',
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(ROOT, urlPath);

  // directory -> index.html (so /github/ works)
  try {
    if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch { /* not found */ }

  if (!filePath.startsWith(ROOT)) return send(res, 403, 'forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // fall back to 404.html
      fs.readFile(path.join(ROOT, '404.html'), (e2, d2) => {
        if (!e2) return send(res, 404, d2, MIME['.html']);
        return send(res, 404, 'Not found');
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, MIME[ext] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log('Trendkiln preview: http://localhost:' + PORT);
});
