// cloudflare-worker/ipray-worker.js, run in Node with fetch and the edge
// cache replaced by fakes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadWorker(fakeFetch) {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'cloudflare-worker', 'ipray-worker.js'), 'utf8')
        .replace('export default', 'module.exports =');
    const store = new Map();
    const sandbox = {
        module: {}, URL, Request, Response, Headers, Date, Set, Math, Number,
        fetch: fakeFetch,
        caches: { default: {
            match: async (req) => (store.has(req.url) ? store.get(req.url).clone() : undefined),
            put: async (req, res) => { store.set(req.url, res); }
        } }
    };
    vm.runInNewContext(src, sandbox);
    return { worker: sandbox.module.exports, store };
}

function stamp(offsetDays) {
    const d = new Date(Date.now() + offsetDays * 86400000);
    return d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');
}

const ctx = () => { const waits = []; return { waitUntil: (p) => waits.push(p), done: () => Promise.all(waits) }; };

test('fetches a Universalis hour, adds CORS and caches it', async () => {
    const calls = [];
    const { worker, store } = loadWorker(async (url) => {
        calls.push(url);
        return new Response('<div id="texts"><div class="v">O God, come to our aid.</div></div>', { status: 200 });
    });
    const day = stamp(0);
    const c = ctx();
    const res = await worker.fetch(new Request('https://w.example/universalis/' + day + '/vespers.htm'), {}, c);
    await c.done();
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
    assert.match(await res.text(), /come to our aid/);
    assert.deepEqual(calls, ['https://universalis.com/' + day + '/vespers.htm']);
    assert.equal(store.size, 1);

    const again = await worker.fetch(new Request('https://w.example/universalis/' + day + '/vespers.htm'), {}, ctx());
    assert.equal(again.status, 200);
    assert.equal(calls.length, 1, 'second request answered from the cache');
});

test('only the app hours and nearby dates are proxied', async () => {
    const { worker } = loadWorker(async () => { throw new Error('must not fetch'); });
    for (const p of ['/universalis/' + stamp(0) + '/index.htm', '/universalis/' + stamp(120) + '/vespers.htm', '/universalis/20261340/vespers.htm', '/universalis/x']) {
        const res = await worker.fetch(new Request('https://w.example' + p), {}, ctx());
        assert.equal(res.status, 404, p);
    }
});

test('everything else is passed to bolls.life as before', async () => {
    const calls = [];
    const { worker } = loadWorker(async (url) => { calls.push(url); return new Response('[{"verse":1}]', { status: 200, headers: { 'Content-Type': 'application/json' } }); });
    const res = await worker.fetch(new Request('https://w.example/get-text/SUV/1/1/'), {}, ctx());
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
    assert.deepEqual(calls, ['https://bolls.life/get-text/SUV/1/1/']);
});
