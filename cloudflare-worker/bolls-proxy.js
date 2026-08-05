// Bolls Bible API CORS proxy — Cloudflare Worker
// -----------------------------------------------------------------
// bolls.life does not send Access-Control-Allow-Origin, so a static
// site (GitHub Pages, no backend of its own) cannot call it directly
// from the browser. This Worker sits in front of bolls.life, adds a
// permissive CORS header, and passes the request straight through.
//
// DEPLOY (free, ~5 minutes, no credit card required):
//   1. https://dash.cloudflare.com -> sign up / log in (free plan)
//   2. Workers & Pages -> Create -> "Create Worker"
//   3. Delete the sample code, paste this whole file in, click "Deploy"
//   4. You'll get a URL like https://bolls-proxy.<you>.workers.dev
//   5. Put that URL in js/somo-la-kwanza-bible.js as WORKER_PROXY
//      (see the comment next to that constant).
//
// This only relays GET requests to bolls.life — it does not add a
// key, does not store anything, and works within Cloudflare's free
// tier (100,000 requests/day) indefinitely.

const UPSTREAM = 'https://bolls.life';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'GET') {
      return new Response('Only GET is supported', { status: 405, headers: corsHeaders() });
    }

    const upstreamUrl = UPSTREAM + url.pathname + url.search;

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { 'Accept': 'application/json' }
    });

    const body = await upstreamResponse.text();

    return new Response(body, {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json',
        // Cache successful chapter lookups for a day — this is static
        // scripture text, and it's kinder to bolls.life's single-core
        // server than re-fetching on every page view.
        'Cache-Control': upstreamResponse.ok ? 'public, max-age=86400' : 'no-store'
      }
    });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Content-Type'
  };
}
