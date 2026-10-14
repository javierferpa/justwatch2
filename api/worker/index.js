const WEBSITE = 'https://javierferpa.github.io';
const UPSTREAM = 'https://api.themoviedb.org/3';
const PREFIX = '/api/tmdb';
const MAX_BODY_BYTES = 512 * 1024;
const MAX_CACHE_ENTRIES = 64;
const MAX_CLIENTS = 1000;
const REQUESTS_PER_MINUTE = 60;
const MINUTE = 60_000;
const VERSION = '2026-10-14.1';

function routeKind(path) {
  if (path === '/trending/all/week') return 'trending';
  if (/^\/discover\/(movie|tv)$/.test(path)) return 'discover';
  if (/^\/search\/(multi|movie|tv)$/.test(path)) return 'search';
  if (/^\/(movie|tv)\/[1-9]\d{0,9}\/watch\/providers$/.test(path)) return 'availability';
  if (/^\/(movie|tv)\/[1-9]\d{0,9}$/.test(path)) return 'detail';
  if (/^\/watch\/providers\/(movie|tv)$/.test(path)) return 'providers';
  return null;
}

function validatedParams(url, kind) {
  const permitted = {
    trending: ['language', 'page', 'include_adult'],
    discover: ['language', 'page', 'include_adult', 'sort_by', 'vote_count.gte', 'with_genres', 'with_watch_providers', 'watch_region', 'with_watch_monetization_types', 'primary_release_date.lte', 'first_air_date.lte'],
    search: ['language', 'page', 'include_adult', 'query'],
    availability: [],
    detail: ['language', 'append_to_response'],
    providers: ['language', 'watch_region'],
  }[kind];
  const output = new URLSearchParams();
  for (const key of url.searchParams.keys()) {
    const values = url.searchParams.getAll(key);
    if (!permitted.includes(key) || values.length !== 1) return null;
    const value = values[0];
    let valid = false;
    if (key === 'language') valid = value === 'es-ES';
    if (key === 'page') valid = /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 500;
    if (key === 'include_adult') valid = value === 'false';
    if (key === 'query') valid = value.trim().length > 0 && value.length <= 200;
    if (key === 'sort_by') valid = ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc', 'first_air_date.desc'].includes(value);
    if (key === 'vote_count.gte') valid = ['20', '200'].includes(value);
    if (key === 'with_genres' || key === 'with_watch_providers') valid = /^[1-9]\d{0,7}$/.test(value);
    if (key === 'watch_region') valid = /^[A-Z]{2}$/.test(value);
    if (key === 'with_watch_monetization_types') valid = value === 'flatrate|free|ads';
    if (key.endsWith('_date.lte')) valid = /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
    if (key === 'append_to_response') valid = value === 'credits,videos';
    if (!valid) return null;
    output.set(key, value);
  }
  if (kind === 'search' && !output.has('query')) return null;
  if (kind === 'discover' && output.has('with_watch_providers') && !output.has('watch_region')) return null;
  if (kind !== 'availability') output.set('language', 'es-ES');
  if (['trending', 'discover', 'search'].includes(kind)) output.set('include_adult', 'false');
  output.sort();
  return output;
}

// Per-isolate bounds supplement the hosting platform. They are not global quotas.
export function createCatalogProxy({ fetcher = (url, options) => globalThis.fetch(url, options), now = Date.now } = {}) {
  const cache = new Map();
  const clients = new Map();
  const pending = new Map();

  function allowedClient(request) {
    const time = now();
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    for (const [key, entry] of clients) if (entry.expires <= time) clients.delete(key);
    let client = clients.get(ip);
    if (!client) {
      if (clients.size >= MAX_CLIENTS) return false;
      client = { count: 0, expires: time + MINUTE };
      clients.set(ip, client);
    }
    client.count += 1;
    return client.count <= REQUESTS_PER_MINUTE;
  }

  function respond(body, status, origin, additional = {}) {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Catalog-Version': VERSION,
      'Vary': 'Origin',
      ...additional,
    };
    if (origin === WEBSITE) headers['Access-Control-Allow-Origin'] = WEBSITE;
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
  }

  async function retrieve(target, kind, token) {
    let stage = 'signal';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      stage = 'request';
      const upstream = await fetcher(target, {
        // Workers supports manual redirects; reject them below without forwarding the secret.
        method: 'GET', redirect: 'manual',
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
        signal: controller.signal,
      });
      if (!upstream.ok) {
        const status = upstream.status === 404 ? 404 : upstream.status === 429 ? 429 : 503;
        return { body: JSON.stringify({ error: status === 404 ? 'not_found' : status === 429 ? 'rate_limited' : 'catalog_unavailable' }), status };
      }
      stage = 'body';
      const body = await upstream.text();
      if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return { status: 502, body: '{"error":"invalid_response"}' };
      stage = 'json';
      JSON.parse(body);
      const result = { body, status: 200 };
      // Search queries are never retained in this cache.
      if (kind !== 'search') {
        if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
        const ttl = kind === 'availability' || kind === 'providers' ? 15 * MINUTE : 5 * MINUTE;
        cache.set(target, { ...result, expires: now() + ttl });
      }
      return result;
    } catch (error) {
      // Never forward exception text, request headers or upstream credentials.
      const name = ['TypeError', 'SyntaxError', 'AbortError', 'TimeoutError'].includes(error?.name) ? error.name : 'Error';
      const reason = /Illegal invocation|incorrect this/.test(error?.message || '') ? 'fetch_binding'
        : /redirect/i.test(error?.message || '') ? 'redirect'
        : /network|connect|fetch failed/i.test(error?.message || '') ? 'network' : 'runtime';
      console.error(JSON.stringify({ event: 'catalog_failure', stage, name, reason }));
      return { status: 502, body: '{"error":"catalog_unavailable"}' };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const origin = request.headers.get('Origin');
      if (url.pathname === '/' && request.method === 'GET') {
        return Response.redirect(WEBSITE + '/justwatch2/', 302);
      }
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return respond({ status: env.TMDB_READ_ACCESS_TOKEN ? 'ok' : 'unavailable' },
          env.TMDB_READ_ACCESS_TOKEN ? 200 : 503, origin);
      }
      if (origin !== WEBSITE) return respond({ error: 'origin_not_allowed' }, 403, origin);
      if (request.method === 'OPTIONS') {
        if (request.headers.get('Access-Control-Request-Method') !== 'GET') return respond({ error: 'method_not_allowed' }, 405, origin);
        return new Response(null, { status: 204, headers: {
          'Access-Control-Allow-Origin': WEBSITE, 'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Accept', 'Access-Control-Max-Age': '600', 'Vary': 'Origin',
        } });
      }
      if (request.method !== 'GET') return respond({ error: 'method_not_allowed' }, 405, origin, { Allow: 'GET, OPTIONS' });
      if (request.headers.has('Authorization')) return respond({ error: 'client_credentials_not_allowed' }, 400, origin);
      if (url.href.length > 4096 || !url.pathname.startsWith(PREFIX + '/')) return respond({ error: 'invalid_path' }, 404, origin);
      const path = url.pathname.slice(PREFIX.length);
      const kind = routeKind(path);
      if (!kind) return respond({ error: 'invalid_path' }, 404, origin);
      const params = validatedParams(url, kind);
      if (!params) return respond({ error: 'invalid_query' }, 400, origin);
      if (!env.TMDB_READ_ACCESS_TOKEN) return respond({ error: 'catalog_unavailable' }, 503, origin);
      if (!allowedClient(request)) return respond({ error: 'rate_limited' }, 429, origin, { 'Retry-After': '60' });
      const target = UPSTREAM + path + (params.size ? '?' + params : '');
      const saved = cache.get(target);
      if (saved && saved.expires > now()) return respond(saved.body, 200, origin);
      if (saved) cache.delete(target);
      let operation = pending.get(target);
      if (!operation) {
        if (pending.size >= 32) return respond({ error: 'catalog_busy' }, 503, origin);
        operation = retrieve(target, kind, env.TMDB_READ_ACCESS_TOKEN);
        pending.set(target, operation);
      }
      let result;
      try { result = await operation; } finally { if (pending.get(target) === operation) pending.delete(target); }
      return respond(result.body, result.status, origin, result.status === 429 ? { 'Retry-After': '60' } : {});
    },
  };
}

export default createCatalogProxy();
