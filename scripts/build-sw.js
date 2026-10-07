#!/usr/bin/env node
/*
 * Writes the list of files service-worker.js saves at install time, and the
 * VERSION that names its cache, from the files actually on disk.
 *
 *   node scripts/build-sw.js           rewrite service-worker.js
 *   node scripts/build-sw.js --check   exit 1 if it is out of date
 *
 * VERSION is a hash of the file list, so it changes when files are added,
 * removed or renamed - which is when the installed cache has to be rebuilt.
 * Edits to existing files don't need it: pages are fetched network-first
 * and everything else is refreshed in the background.
 *
 * Saved at install: the home page, the prayer pages directly under pages/,
 * all styles, scripts and data, and the few small images those pages show.
 * Not saved at install (cached when first opened instead): the 230
 * Amefufuka song pages, the old per-week Office of Readings pages, PDFs
 * and the large illustration folders - several MB nobody needs up front.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SW_FILE = path.join(ROOT, 'service-worker.js');
const BASE = '/i-pray/';

const IMAGES = [
    'assets/images/favicon.ico.jpg',
    'assets/images/logo-small.jpg',
    'assets/images/maria-mdogo.jpg',
    'assets/images/carmen.jpg',
    'assets/images/icon-192x192.png',
    'assets/images/icon-512x512.png'
];

function list(dir, filter) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((d) => {
        const rel = path.posix.join(dir, d.name);
        if (d.isDirectory()) return list(rel, filter);
        return filter(rel) ? [rel] : [];
    });
}

function precacheFiles() {
    const files = [
        'index.html',
        'manifest.json',
        'dist/output.css',
        ...fs.readdirSync(path.join(ROOT, 'pages'))
            .filter((f) => f.endsWith('.html') && !/^mwaka/.test(f))
            .map((f) => 'pages/' + f),
        ...list('css', (f) => f.endsWith('.css')),
        ...list('js', (f) => f.endsWith('.js') && f !== 'js/service-worker.js'),
        ...list('data', (f) => f.endsWith('.json')),
        ...IMAGES
    ];
    files.forEach((f) => {
        if (!fs.existsSync(path.join(ROOT, f))) throw new Error('precache file missing: ' + f);
    });
    return [BASE, ...Array.from(new Set(files)).sort().map((f) => BASE + f.split('/').map(encodeURIComponent).join('/'))];
}

function generatedBlock() {
    const urls = precacheFiles();
    const version = crypto.createHash('sha1').update(urls.join('\n')).digest('hex').slice(0, 10);
    return '// BEGIN GENERATED\n'
        + "const VERSION = '" + version + "';\n"
        + 'const PRECACHE = ' + JSON.stringify(urls, null, 4).replace(/"/g, "'") + ';\n'
        + '// END GENERATED';
}

function render() {
    const src = fs.readFileSync(SW_FILE, 'utf8');
    const out = src.replace(/\/\/ BEGIN GENERATED[\s\S]*?\/\/ END GENERATED/, generatedBlock());
    return { src, out };
}

if (require.main === module) {
    const { src, out } = render();
    if (process.argv.includes('--check')) {
        if (src !== out) {
            console.error('service-worker.js is out of date: run `npm run build:generated`.');
            process.exit(1);
        }
        console.log('service-worker.js is up to date.');
    } else {
        fs.writeFileSync(SW_FILE, out);
        console.log('service-worker.js: ' + precacheFiles().length + ' files to save at install.');
    }
}

module.exports = { precacheFiles, render };
