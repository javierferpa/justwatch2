import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogProxy } from './index.js';

const env = { TMDB_READ_ACCESS_TOKEN: 'server-test-token' };
const origin = 'https://javierferpa.github.io';
function request(path, options = {}) {
  return new Request('https://catalog.example' + path, { ...options,
    headers: { Origin: origin, 'cf-connecting-ip': '192.0.2.1', ...options.headers } });
}

test('injects the secret only into a fixed TMDB GET request and never in the response', async () => {
  let received;
  const proxy = createCatalogProxy({ fetcher: async (url, options) => {
    received = { url, options };
    return new Response(JSON.stringify({ results: [{ id: 42, title: 'Movie' }] }));
  } });
  const response = await proxy.fetch(request('/api/tmdb/discover/movie?watch_region=ES&with_watch_providers=8&page=1'), env);
  assert.equal(response.status, 200);
  assert.ok(received.url.startsWith('https://api.themoviedb.org/3/discover/movie?'));
  assert.equal(new URL(received.url).searchParams.get('include_adult'), 'false');
  assert.equal(new URL(received.url).searchParams.has('api_key'), false);
  assert.equal(received.options.headers.Authorization, 'Bearer server-test-token');
  assert.equal(received.options.redirect, 'manual');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(response.headers.get('Authorization'), null);
  assert.ok(!(await response.text()).includes(env.TMDB_READ_ACCESS_TOKEN));
});

test('preserves the runtime fetch receiver when using the default transport', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function () {
    assert.equal(this, globalThis);
    return new Response('{}');
  };
  try {
    assert.equal((await createCatalogProxy().fetch(request('/api/tmdb/movie/42'), env)).status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('blocks private endpoints, SSRF URLs, writes and client-supplied credentials', async () => {
  let calls = 0;
  const proxy = createCatalogProxy({ fetcher: async () => { calls++; return new Response('{}'); } });
  for (const path of ['/api/tmdb/account', '/api/tmdb/authentication/token/new', '/api/tmdb/https://evil.example', '/api/tmdb/movie/42?api_key=anything']) {
    const response = await proxy.fetch(request(path), env);
    assert.ok([400, 404].includes(response.status));
  }
  assert.equal((await proxy.fetch(request('/api/tmdb/movie/42', {method:'POST'}),env)).status,405);
  assert.equal((await proxy.fetch(request('/api/tmdb/movie/42', {headers:{Authorization:'Bearer client-token'}}),env)).status,400);
  assert.equal(calls,0);
});

test('rejects another browser origin and disallows credentialed preflight', async () => {
  const proxy = createCatalogProxy();
  const response = await proxy.fetch(request('/api/tmdb/movie/42', {headers:{Origin:'https://evil.example'}}),env);
  assert.equal(response.status,403);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),null);
  const preflight = await proxy.fetch(request('/api/tmdb/movie/42', {method:'OPTIONS',headers:{'Access-Control-Request-Method':'GET'}}),env);
  assert.equal(preflight.status,204);
  assert.ok(!preflight.headers.get('Access-Control-Allow-Headers').toLowerCase().includes('authorization'));
});

test('rejects unknown, repeated, adult and oversized query values', async () => {
  const proxy = createCatalogProxy();
  for (const path of [
    '/api/tmdb/search/multi?query=a&query=b', '/api/tmdb/trending/all/week?page=501',
    '/api/tmdb/search/multi?query=', '/api/tmdb/search/multi?query='+ 'x'.repeat(201),
    '/api/tmdb/discover/tv?include_adult=true', '/api/tmdb/discover/tv?session_id=anything',
    '/api/tmdb/movie/42?append_to_response=account', '/api/tmdb/discover/tv?with_watch_providers=8',
  ]) assert.equal((await proxy.fetch(request(path),env)).status,400);
});

test('returns no secret material when runtime configuration is missing', async () => {
  const proxy = createCatalogProxy();
  const response = await proxy.fetch(request('/api/tmdb/movie/42'),{});
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{error:'catalog_unavailable'});
  const health=await proxy.fetch(request('/api/health'),env);
  assert.deepEqual(await health.json(),{status:'ok'});
});

test('sanitizes authentication and network failures and never caches them', async () => {
  let calls=0;
  const proxy=createCatalogProxy({fetcher:async()=>{
    calls++;
    return new Response(JSON.stringify({error:env.TMDB_READ_ACCESS_TOKEN}),{status:401});
  }});
  for(let i=0;i<2;i++){
    const response=await proxy.fetch(request('/api/tmdb/movie/42'),env);
    assert.equal(response.status,503);
    assert.ok(!(await response.text()).includes(env.TMDB_READ_ACCESS_TOKEN));
  }
  assert.equal(calls,2);
  const broken=createCatalogProxy({fetcher:async()=>{throw new Error('secret '+env.TMDB_READ_ACCESS_TOKEN);}});
  const failure=await broken.fetch(request('/api/tmdb/movie/42'),env);
  assert.equal(failure.status,502);
  assert.equal(await failure.text(),'{"error":"catalog_unavailable"}');
});

test('preserves not-found and throttling semantics without upstream details', async () => {
  for(const status of [404,429]){
    const proxy=createCatalogProxy({fetcher:async()=>new Response('private error',{status})});
    const response=await proxy.fetch(request('/api/tmdb/tv/42/watch/providers'),env);
    assert.equal(response.status,status);
    if(status===429)assert.equal(response.headers.get('Retry-After'),'60');
  }
});

test('rejects an upstream redirect without following its destination', async () => {
  let calls = 0;
  const proxy = createCatalogProxy({ fetcher: async (_url, options) => {
    calls++;
    assert.equal(options.redirect, 'manual');
    return new Response(null, { status: 302, headers: { Location: 'https://untrusted.example/' } });
  } });
  const response = await proxy.fetch(request('/api/tmdb/movie/42'), env);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Location'), null);
  assert.equal(calls, 1);
});

test('caches catalog reads until expiry and keeps search queries out of cache', async () => {
  let time=0,calls=0;
  const proxy=createCatalogProxy({now:()=>time,fetcher:async()=>{calls++;return new Response('{}');}});
  await proxy.fetch(request('/api/tmdb/movie/42'),env);
  await proxy.fetch(request('/api/tmdb/movie/42'),env);
  assert.equal(calls,1);
  time=5*60_000+1;
  await proxy.fetch(request('/api/tmdb/movie/42'),env);
  assert.equal(calls,2);
  await proxy.fetch(request('/api/tmdb/search/multi?query=dune'),env);
  await proxy.fetch(request('/api/tmdb/search/multi?query=dune'),env);
  assert.equal(calls,4);
});

test('coalesces concurrent requests for the same public metadata', async () => {
  let calls=0,release;
  const response=new Promise(resolve=>{release=resolve;});
  const proxy=createCatalogProxy({fetcher:async()=>{calls++;await response;return new Response('{}');}});
  const first=proxy.fetch(request('/api/tmdb/movie/42'),env);
  const second=proxy.fetch(request('/api/tmdb/movie/42'),env);
  assert.equal(calls,1);
  release();
  assert.equal((await first).status,200);
  assert.equal((await second).status,200);
});

test('bounds repeated requests and permits them again after the window', async () => {
  let time=0;
  const proxy=createCatalogProxy({now:()=>time,fetcher:async()=>new Response('{}')});
  for(let i=0;i<60;i++)assert.equal((await proxy.fetch(request('/api/tmdb/movie/42'),env)).status,200);
  assert.equal((await proxy.fetch(request('/api/tmdb/movie/42'),env)).status,429);
  time=60_001;
  assert.equal((await proxy.fetch(request('/api/tmdb/movie/42'),env)).status,200);
});

test('rejects malformed and oversized upstream payloads', async () => {
  for(const body of ['not JSON','"'+ 'x'.repeat(512*1024)+'"']){
    const proxy=createCatalogProxy({fetcher:async()=>new Response(body)});
    assert.equal((await proxy.fetch(request('/api/tmdb/movie/42'),env)).status,502);
  }
});
