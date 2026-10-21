// ipray Cloudflare Worker - Bible verses, Universalis hours, Kiswahili readings
// -----------------------------------------------------------------
// bolls.life (Bible verses), universalis.com (Midday Prayer, Vespers,
// Office of Readings) and mkatolikileo.com (the daily readings in
// Kiswahili) send no Access-Control-Allow-Origin, so a static site on
// GitHub Pages can't read them from the browser. This Worker sits in front
// of them and adds the CORS header.
//
//   /universalis/YYYYMMDD/<hour>.htm  ->  https://universalis.com/YYYYMMDD/<hour>.htm
//   /mkatolikileo/masomo-ya-misa      ->  https://mkatolikileo.com/masomo-ya-misa
//   /mkatolikileo/masomo-ya-misa/<id>/<weekday>-<month>-<dd>-<yyyy>
//                                     ->  that day's readings on mkatolikileo.com
//   anything else                     ->  https://bolls.life/<same path>
//
// The Universalis route only accepts a date within a few weeks of today
// and the hours the app uses, and the mkatolikileo route only the list of
// days and a day's readings, so neither can be used as a general proxy.
// Pages are cached at Cloudflare's edge (a day's office or readings for
// 12 hours, the list of days for an hour): everyone praying the same day
// shares one fetch.
//
// DEPLOY (free, ~5 minutes, no credit card required):
//   1. https://dash.cloudflare.com -> Workers & Pages -> open the existing
//      worker the app uses (ancient-rice-28a1), or create a new one.
//   2. "Edit code", replace everything with this file, click "Deploy".
//   3. If you created a new worker, put its URL in WORKER_BASE in
//      js/universalis-office.js, SW_WORKER in pages/daily-readings.html
//      and in js/bibilia-reader.js / js/somo-la-kwanza-bible.js.
// The app keeps working before this is deployed: it falls back to the
// r.jina.ai Reader and public CORS proxies when the Worker doesn't answer
// with an office or the readings.

const BOLLS = 'https://bolls.life';
const UNIVERSALIS = 'https://universalis.com';
const MKATOLIKILEO = 'https://mkatolikileo.com';
const HOURS = new Set(['readings', 'lauds', 'terce', 'sext', 'none', 'vespers', 'compline']);
const MAX_DAYS_AWAY = 40;
const DAY_TTL = 12 * 60 * 60;
// New days are added to the list ahead of time; an hour keeps it current.
const LIST_TTL = 60 * 60;

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

// Answers path (this Worker's) with the page at upstreamUrl, plus CORS,
// keeping it at the edge for ttl seconds.
async function cachedPage(request, path, upstreamUrl, ttl, ctx) {
    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + path);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const upstream = await fetch(upstreamUrl, {
        headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0 (compatible; ipray-app)' },
        redirect: 'follow'
    });
    const body = await upstream.text();
    const response = new Response(body, {
        status: upstream.status,
        headers: {
            ...corsHeaders(),
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': upstream.ok ? 'public, max-age=' + ttl : 'no-store'
        }
    });
    // Only keep real pages: an error or a redirect to another page (such
    // as another date) isn't worth sharing.
    if (upstream.ok && !upstream.redirected) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
}

function universalis(request, stamp, hour, ctx) {
    if (!validDate(stamp) || !HOURS.has(hour)) return reply('Not found', 404);
    const page = '/' + stamp + '/' + hour + '.htm';
    return cachedPage(request, '/universalis' + page, UNIVERSALIS + page, DAY_TTL, ctx);
}

// day: "/<id>/<weekday>-<month>-<dd>-<yyyy>", or '' for the list of days
function mkatolikileo(request, day, ctx) {
    const page = '/masomo-ya-misa' + day;
    return cachedPage(request, '/mkatolikileo' + page, MKATOLIKILEO + page, day ? DAY_TTL : LIST_TTL, ctx);
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
        const readings = path.match(/^\/mkatolikileo\/masomo-ya-misa((?:\/\d{1,7}\/[a-z]+-[a-z]+-\d{1,2}-\d{4})?)$/);
        if (readings) return mkatolikileo(request, readings[1], ctx);
        if (path.indexOf('/mkatolikileo') === 0) return reply('Not found', 404);
        return bolls(request);
    }
};
