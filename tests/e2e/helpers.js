// Shared helpers for the end-to-end tests.
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'universalis');

// Hosts the app fetches Universalis through (public CORS proxies and the
// app's own Cloudflare Worker).
const PROXY_HOST = /^https:\/\/(corsproxy\.io|api\.cors\.lol|api\.allorigins\.win|[\w-]+\.[\w-]+\.workers\.dev)\//;

function universalisTarget(proxiedUrl) {
    const u = new URL(proxiedUrl);
    const target = u.searchParams.get('url') ? decodeURIComponent(u.searchParams.get('url')) : u.pathname;
    const m = target.match(/(\d{8})\/(\w+)\.htm/);
    return m ? { stamp: m[1], hour: m[2] } : null;
}

/**
 * Blocks every request that doesn't go to the local test server, and
 * answers Universalis requests (through any proxy) according to `mode`:
 *   'fixture' - the saved page for that hour, if there is one
 *   'fail'    - a network error
 *   'junk'    - a 200 response that holds no office
 */
async function isolate(target, { universalis = 'fixture' } = {}) {
    // `target` is a page, or a browser context when requests made by the
    // service worker have to be caught too.
    const calls = [];
    await target.route(/^https?:\/\/(?!localhost[:/])/, (route) => {
        const url = route.request().url();
        const target = PROXY_HOST.test(url) ? universalisTarget(url) : null;
        if (!target) return route.abort();
        calls.push(target);
        const file = path.join(FIXTURES, target.hour + '.html');
        if (universalis === 'fixture' && fs.existsSync(file)) {
            return route.fulfill({
                status: 200,
                contentType: 'text/html; charset=utf-8',
                headers: { 'access-control-allow-origin': '*' },
                body: fs.readFileSync(file, 'utf8')
            });
        }
        if (universalis === 'junk') {
            return route.fulfill({
                status: 200,
                contentType: 'text/html',
                headers: { 'access-control-allow-origin': '*' },
                body: '<html><body>' + 'Rate limited. '.repeat(80) + '</body></html>'
            });
        }
        return route.abort();
    });
    return calls;
}

/** Collects uncaught page errors (not console noise from blocked requests). */
function collectErrors(page) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    return errors;
}

async function setLanguage(page, lang) {
    await page.addInitScript((l) => {
        try { localStorage.setItem('preferredLanguage', l); } catch (e) {}
    }, lang);
}

module.exports = { isolate, collectErrors, setLanguage };
