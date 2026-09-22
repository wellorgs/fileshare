// Cloudflare Worker: proxies Metered's TURN credential endpoint so the
// Metered API key never ships in the static page's JS. Edge-caches the
// response for 5 minutes so upstream Metered usage is capped at roughly
// one call per cache window regardless of how much traffic hits this
// worker (scraped URL included) - that cap is what actually protects the
// $30 credit, not the CORS check below (CORS only stops in-browser callers,
// not curl/scripts, but they still only ever get the cached response).
//
// Deploy: Cloudflare dashboard -> Workers & Pages -> Create Worker -> paste
// this file -> Settings -> Variables -> add secret METERED_API_KEY -> Deploy.
const ALLOWED_ORIGIN = 'https://wellorgs.github.io';
const METERED_DOMAIN = 'newfileshare.metered.live';

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (request.method !== 'GET') return new Response('method not allowed', { status: 405, headers: corsHeaders });

    const cache = caches.default;
    const cacheKey = new Request('https://turn-proxy.internal/credentials');
    const cached = await cache.match(cacheKey);
    if (cached) return new Response(cached.body, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const upstream = await fetch(`https://${METERED_DOMAIN}/api/v1/turn/credentials?apiKey=${env.METERED_API_KEY}`);
    if (!upstream.ok) return new Response('turn credential fetch failed', { status: 502, headers: corsHeaders });

    const body = await upstream.text();
    const response = new Response(body, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};
