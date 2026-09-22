// Cloudflare Worker: proxies Cloudflare Realtime's TURN credential endpoint
// so the TURN key's API token never ships in the static page's JS. Edge-
// caches the response for 5 minutes so upstream usage is capped at roughly
// one call per cache window regardless of how much traffic hits this
// worker (scraped URL included) - that cap is what protects the free
// 1000GB/month quota, not the CORS check below (CORS only stops in-browser
// callers, not curl/scripts, but they still only ever get the cached
// response).
//
// Deploy: Cloudflare dashboard -> Workers & Pages -> Create Worker -> paste
// this file -> Settings -> Variables -> add secrets TURN_KEY_ID and
// TURN_KEY_API_TOKEN (from dash.cloudflare.com/?to=/:account/calls ->
// TURN Keys -> Create) -> Deploy.
const ALLOWED_ORIGIN = 'https://wellorgs.github.io';
const CREDENTIAL_TTL_SECONDS = 86400; // 24h - safely longer than any single transfer

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

    const upstream = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: CREDENTIAL_TTL_SECONDS }),
      }
    );
    if (!upstream.ok) return new Response('turn credential fetch failed', { status: 502, headers: corsHeaders });

    // Cloudflare wraps the array as {iceServers:[...]} - unwrap here so the
    // frontend's fetchIceConfig() (which expects the plain array, same shape
    // every other TURN provider's REST API returns) doesn't need to change.
    const { iceServers } = await upstream.json();
    const response = new Response(JSON.stringify(iceServers), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};
