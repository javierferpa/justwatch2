import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CatalogService, apiErrorMessage } from './catalog.service';
import { PreferencesService } from './preferences.service';
import { CatalogQuery } from './media';

describe('Catalog API', () => {
  let api: CatalogService;
  let http: HttpTestingController;
  let preferences: PreferencesService;
  const query: CatalogQuery = { type: 'all', search: '', genre: '', provider: '', sort: 'popular', region: 'ES', page: 1 };
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
    preferences = TestBed.inject(PreferencesService);
  });
  afterEach(() => http.verify());

  it('offers bounded, searchable demo pages without requesting the API', () => {
    api.catalog(query).subscribe(page => { expect(page.results).toHaveLength(12); expect(page.total_pages).toBe(2); });
    api.catalog({ ...query, page: 2 }).subscribe(page => expect(page.results).toHaveLength(8));
    api.catalog({ ...query, search: 'dune' }).subscribe(page => expect(page.results.every(item => item.title.toLowerCase().includes('dune'))).toBe(true));
    http.expectNone(request => request.url.includes('api.themoviedb.org'));
  });
  it('filters people and adult titles out of multi-search and normalizes TV fields', () => {
    preferences.setToken('fake-read-token');
    api.catalog({ ...query, search: 'a show' }).subscribe(page => {
      expect(page.results).toHaveLength(1);
      expect(page.results[0].media_type).toBe('tv');
      expect(page.results[0].title).toBe('A show');
    });
    const request = http.expectOne(req => req.url.endsWith('/search/multi') && req.params.get('query') === 'a show');
    expect(request.request.headers.get('Authorization')).toBe('Bearer fake-read-token');
    expect(request.request.params.has('api_key')).toBe(false);
    request.flush({ results: [{ id: 1, name: 'A show', media_type: 'tv' }, { id: 2, name: 'A person', media_type: 'person' }, { id: 3, title: 'Adult', media_type: 'movie', adult: true }], page: 1, total_pages: 1, total_results: 3 });
  });
  it('sends TV discovery filters, regional streaming scope and the correct sort', () => {
    preferences.setToken('fake-read-token');
    api.catalog({ ...query, type: 'tv', genre: '18', provider: '8', sort: 'rating', region: 'MX', page: 2 }).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/discover/tv'));
    expect(request.request.params.get('watch_region')).toBe('MX');
    expect(request.request.params.get('with_watch_providers')).toBe('8');
    expect(request.request.params.get('with_genres')).toBe('18');
    expect(request.request.params.get('with_watch_monetization_types')).toBe('flatrate|free|ads');
    expect(request.request.params.get('sort_by')).toBe('vote_average.desc');
    expect(request.request.params.get('vote_count.gte')).toBe('200');
    request.flush({ results: [], page: 2, total_pages: 1000, total_results: 20000 });
  });
  it('requests series details and providers from TV endpoints', () => {
    preferences.setToken('fake-read-token');
    api.detail('tv', 42).subscribe(item => expect(item.title).toBe('Show'));
    api.providers('tv', 42).subscribe(data => expect(data.results).toEqual({}));
    http.expectOne(req => req.url.endsWith('/tv/42')).flush({ id: 42, name: 'Show', genres: [] });
    http.expectOne(req => req.url.endsWith('/tv/42/watch/providers')).flush({ results: {} });
  });
  it('does not publish or simulate availability in demo mode', () => {
    api.providers('movie', 693134).subscribe(data => expect(data.results).toEqual({}));
    api.providerOptions('movie', 'ES').subscribe(providers => expect(providers).toEqual([]));
  });
  it('validates a candidate token without replacing the current connection', () => {
    preferences.setToken('current-fake-token');
    api.validateToken('Bearer candidate-fake-token').subscribe();
    const request = http.expectOne('https://api.themoviedb.org/3/configuration');
    expect(request.request.headers.get('Authorization')).toBe('Bearer candidate-fake-token');
    request.flush({ images: {} });
    expect(preferences.token()).toBe('current-fake-token');
  });
  it('gives actionable authentication, not-found and rate-limit errors', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 401 }))).toContain('token');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 404 }))).toContain('No encontramos');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 429 }))).toContain('demasiadas');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('conexión');
  });
});
