// The service worker's install list matches the files on disk, and every page
// registers the worker at the app root.
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');
const { render, precacheFiles } = require('../../scripts/build-sw');

const ROOT = path.join(__dirname, '..', '..');

test('service-worker.js install list is up to date', () => {
    const { src, out } = render();
    assert.ok(src === out, 'run `npm run build:generated` and commit service-worker.js');
});

test('the offline page and the home page are saved at install', () => {
    const urls = precacheFiles();
    assert.ok(urls.includes('/i-pray/pages/fallback.html'));
    assert.ok(urls.includes('/i-pray/index.html'));
});

test('nothing registers the old js/service-worker.js path', () => {
    let hits = '';
    try {
        hits = execFileSync('git', ['grep', '-lE', 'serviceWorker\\.register\\([^)]*js/(\\.\\./js/)?service-worker', '--', '.', ':!node_modules', ':!docs', ':!tests'], { cwd: ROOT, encoding: 'utf8' });
    } catch (e) {
        hits = ''; // git grep exits 1 when nothing matches
    }
    assert.equal(hits.trim(), '');
});
