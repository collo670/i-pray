// ipray Cloudflare Worker - Bible verses and Universalis hours
// -----------------------------------------------------------------
// Neither bolls.life (Bible verses) nor universalis.com (Midday Prayer,
// Vespers, Office of Readings) sends Access-Control-Allow-Origin, so a
// static site on GitHub Pages can't read them from the browser. This
// Worker sits in front of both and adds the CORS header.
//
//   /universalis/YYYYMMDD/<hour>.htm  ->  https://universalis.com/YYYYMMDD/<hour>.htm
//   anything else                     ->  https://bolls.life/<same path>
//
// The Universalis route only accepts a date within a few weeks of today
// and the hours the app uses, so it can't be used as a general proxy.
// Each day's page is cached at Cloudflare's edge for 12 hours: everyone
// praying the same hour on the same day shares one fetch.
//
// DEPLOY (free, ~5 minutes, no credit card required):
//   1. https://dash.cloudflare.com -> Workers & Pages -> open the existing
//      worker the app uses (ancient-rice-28a1), or create a new one.
//   2. "Edit code", replace everything with this file, click "Deploy".
//   3. If you created a new worker, put its URL in WORKER_BASE in
//      js/universalis-office.js and in js/bibilia-reader.js /
//      js/somo-la-kwanza-bible.js.
// The app keeps working before this is deployed: it falls back to public
// CORS proxies when the Worker doesn't answer with an office.

const BOLLS = 'https://bolls.life';
const UNIVERSALIS = 'https://universalis.com';
const HOURS = new Set(['readings', 'lauds', 'terce', 'sext', 'none', 'vespers', 'compline']);
const MAX_DAYS_AWAY = 40;
const UNIVERSALIS_TTL = 12 * 60 * 60;

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Content-Type'
    };
}

function reply(body, status, extra) {
    return new Response(body, { status, headers: { ...corsHeaders(), 'Content-Type': 'text/plain; charset=utf-8', ...(extra || {}) } });
}

function validDate(stamp) {
    const y = Number(stamp.slice(0, 4)), m = Number(stamp.slice(4, 6)), d = Number(stamp.slice(6, 8));
    const date = Date.UTC(y, m - 1, d);
    const check = new Date(date);
    if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return false;
    return Math.abs(date - Date.now()) <= MAX_DAYS_AWAY * 86400000;
}

async function universalis(request, stamp, hour, ctx) {
    if (!validDate(stamp) || !HOURS.has(hour)) return reply('Not found', 404);

    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + '/universalis/' + stamp + '/' + hour + '.htm');
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const upstream = await fetch(UNIVERSALIS + '/' + stamp + '/' + hour + '.htm', {
        headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0 (compatible; ipray-app)' },
        redirect: 'follow'
    });
    const body = await upstream.text();
    const response = new Response(body, {
        status: upstream.status,
        headers: {
            ...corsHeaders(),
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': upstream.ok ? 'public, max-age=' + UNIVERSALIS_TTL : 'no-store'
        }
    });
    // Only keep real pages: an error or a redirect to another date isn't
    // worth sharing.
    if (upstream.ok && !upstream.redirected) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
}

async function bolls(request) {
    const url = new URL(request.url);
    const upstream = await fetch(BOLLS + url.pathname + url.search, { headers: { 'Accept': 'application/json' } });
    const body = await upstream.text();
    return new Response(body, {
        status: upstream.status,
        headers: {
            ...corsHeaders(),
            'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
            // Scripture text doesn't change: cache a day, and spare
            // bolls.life's single server.
            'Cache-Control': upstream.ok ? 'public, max-age=86400' : 'no-store'
        }
    });
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
        if (request.method !== 'GET') return reply('Only GET is supported', 405);

        const path = new URL(request.url).pathname;
        const match = path.match(/^\/universalis\/(\d{8})\/([a-z]+)\.htm$/);
        if (match) return universalis(request, match[1], match[2], ctx);
        if (path.indexOf('/universalis') === 0) return reply('Not found', 404);
        return bolls(request);
    }
};
