#!/usr/bin/env node
/*
 * Serves the app locally at http://localhost:<port>/i-pray/ - the same path
 * it has on GitHub Pages, so the absolute /i-pray/... URLs used by the
 * service worker and the manifest work unchanged.
 *
 * Usage: node scripts/serve.js [port]      (default 8080)
 * Also used by the Playwright tests (playwright.config.js).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = '/i-pray/';
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
    '.ics': 'text/calendar; charset=utf-8'
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/' || url.pathname === '/i-pray') {
        res.writeHead(302, { Location: BASE });
        return res.end();
    }
    if (!url.pathname.startsWith(BASE)) {
        res.writeHead(404);
        return res.end('Not found');
    }
    let rel = decodeURIComponent(url.pathname.slice(BASE.length));
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    // Never serve anything outside the repo (../ tricks).
    if (!file.startsWith(ROOT + path.sep)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Not found');
        }
        res.writeHead(200, {
            'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('ipray running at http://localhost:' + PORT + BASE);
});
