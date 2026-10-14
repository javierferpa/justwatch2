import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError, timeout } from 'rxjs';
import { DEMO_CATALOG } from './demo-catalog';
import { CatalogPage, CatalogQuery, MediaDetail, MediaType, Provider, ProviderResponse, TmdbMedia, normalizeMedia } from './media';
import { PreferencesService } from './preferences.service';
import { CATALOG_API_BASE } from './api.config';

interface TmdbPage { results: TmdbMedia[]; page: number; total_pages: number; total_results: number }
interface TmdbDetail extends TmdbMedia {
  tagline?: string;
  runtime?: number;
  number_of_seasons?: number;
  credits?: { cast: MediaDetail['cast'] };
  videos?: { results: MediaDetail['videos'] };
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401 || error.status === 403 || error.status === 503) return 'El servicio de catálogo no está disponible ahora. Vuelve a intentarlo en unos instantes.';
    if (error.status === 404) return 'No encontramos este título. Puede haber sido retirado del catálogo.';
    if (error.status === 429) return 'TMDB ha recibido demasiadas peticiones. Espera un momento y vuelve a intentarlo.';
    if (error.status === 0) return 'No se puede conectar con TMDB. Comprueba tu conexión y vuelve a intentarlo.';
  }
  return 'No se han podido cargar los datos. Vuelve a intentarlo en unos instantes.';
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly preferences = inject(PreferencesService);
  private readonly base = inject(CATALOG_API_BASE);

  catalog(query: CatalogQuery): Observable<CatalogPage> {
    if (this.preferences.demo()) return of(this.demoPage(query));
    const type = query.type === 'tv' ? 'tv' : 'movie';
    const params: Record<string, string> = { language: 'es-ES', page: String(query.page), include_adult: 'false' };
    let path: string;
    if (query.search) {
      path = `/search/${query.type === 'all' ? 'multi' : type}`;
      params['query'] = query.search;
    } else if (query.type === 'all') {
      path = '/trending/all/week';
    } else {
      path = `/discover/${type}`;
      params['sort_by'] = query.sort === 'rating' ? 'vote_average.desc'
        : query.sort === 'newest' ? (type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc') : 'popularity.desc';
      const today = new Date().toISOString().slice(0, 10);
      params[type === 'tv' ? 'first_air_date.lte' : 'primary_release_date.lte'] = today;
      if (query.sort === 'rating') params['vote_count.gte'] = '200';
      if (query.sort === 'newest') params['vote_count.gte'] = '20';
      if (query.genre) params['with_genres'] = query.genre;
      if (query.provider) {
        params['with_watch_providers'] = query.provider;
        params['watch_region'] = query.region;
        params['with_watch_monetization_types'] = 'flatrate|free|ads';
      }
    }
    return this.get<TmdbPage>(path, params).pipe(map(page => ({
      ...page,
      total_pages: Math.min(page.total_pages, 500),
      results: page.results.filter(item => Number.isSafeInteger(item.id) && item.id > 0 && !item.adult &&
        (!item.media_type || item.media_type === 'movie' || item.media_type === 'tv'))
        .map(item => normalizeMedia(item, type)),
    })));
  }

  detail(type: MediaType, id: number): Observable<MediaDetail> {
    if (this.preferences.demo()) {
      const item = DEMO_CATALOG.find(media => media.media_type === type && media.id === id);
      return item ? of(item) : throwError(() => new HttpErrorResponse({ status: 404 }));
    }
    return this.get<TmdbDetail>(`/${type}/${id}`, { language: 'es-ES', append_to_response: 'credits,videos' })
      .pipe(map(item => ({
        ...normalizeMedia(item, type), tagline: item.tagline || '', runtime: item.runtime || null,
        number_of_seasons: item.number_of_seasons || null, genres: item.genres || [],
        cast: (item.credits?.cast || []).slice(0, 8), videos: item.videos?.results || [],
      })));
  }

  providers(type: MediaType, id: number): Observable<ProviderResponse> {
    return this.preferences.demo() ? of({ results: {} }) : this.get(`/${type}/${id}/watch/providers`);
  }

  providerOptions(type: MediaType, region: string): Observable<Provider[]> {
    if (this.preferences.demo()) return of([]);
    return this.get<{ results: Provider[] }>(`/watch/providers/${type}`, { watch_region: region, language: 'es-ES' })
      .pipe(map(response => response.results));
  }

  health(): Observable<{ status: string }> {
    // Check a real catalog read, not only the presence of server configuration.
    return this.get<TmdbPage>('/trending/all/week', { language: 'es-ES', page: '1', include_adult: 'false' })
      .pipe(map(page => ({ status: Array.isArray(page.results) ? 'ok' : 'unavailable' })));
  }

  private get<T>(path: string, params: Record<string, string> = {}): Observable<T> {
    return this.http.get<T>(this.base + path, {
      params, headers: new HttpHeaders({ accept: 'application/json' }),
    }).pipe(timeout(15000));
  }

  private demoPage(query: CatalogQuery): CatalogPage {
    const search = query.search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    let items = DEMO_CATALOG.filter(item => query.type === 'all' || query.type === item.media_type);
    if (search) items = items.filter(item => (item.title + ' ' + item.original_title).normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(search));
    if (query.genre && !query.search) items = items.filter(item => item.genre_ids.includes(Number(query.genre)));
    if (query.provider && !query.search) items = [];
    if (query.sort === 'rating') items = [...items].sort((a, b) => b.vote_average - a.vote_average);
    if (query.sort === 'newest') items = [...items].sort((a, b) => b.release_date.localeCompare(a.release_date));
    const pageSize = 12;
    return { results: items.slice((query.page - 1) * pageSize, query.page * pageSize), page: query.page,
      total_pages: Math.ceil(items.length / pageSize), total_results: items.length };
  }
}
