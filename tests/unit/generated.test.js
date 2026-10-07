// Generated files match their sources (CI also rebuilds and diffs them).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { render, PAGES } = require('../../scripts/build-masifu-pages');

test('Masifu ya Asubuhi pages are built from templates/ and content/', () => {
    assert.equal(PAGES.length, 28);
    for (const name of PAGES) {
        const page = fs.readFileSync(path.join(__dirname, '..', '..', 'pages', name + '.html'), 'utf8');
        assert.ok(page === render(name), name + ' is out of date: run `npm run build:generated`');
    }
});

test('every page loads the shared language module', () => {
    const { execFileSync } = require('child_process');
    const missing = execFileSync('git', ['ls-files', '-z', '--', 'index.html', 'pages/*.html', 'pages/**/*.html'], { cwd: path.join(__dirname, '..', '..'), encoding: 'utf8' })
        .split('\0').filter(Boolean)
        .filter((f) => !/fallback\.html$|masifu-asubuhi\.html$/.test(f))
        .filter((f) => !fs.readFileSync(path.join(__dirname, '..', '..', f), 'utf8').includes('js/i18n.js"'));
    assert.deepEqual(missing, []);
});
