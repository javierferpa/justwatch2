export type MediaType = 'movie' | 'tv';
export type CatalogType = MediaType | 'all' | 'watchlist';
export type CatalogSort = 'popular' | 'rating' | 'newest';

export interface Media {
  id: number;
  media_type: MediaType;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface Genre { id: number; name: string }
export interface Provider { provider_id: number; provider_name: string; logo_path: string | null }
export interface ProviderRegion {
  link?: string;
  flatrate?: Provider[];
  free?: Provider[];
  ads?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
}
export interface ProviderResponse { results: Record<string, ProviderRegion> }
export interface CastMember { id: number; name: string; character: string; profile_path: string | null }
export interface Video { key: string; site: string; type: string; name: string; official: boolean }
export interface MediaDetail extends Media {
  tagline: string;
  runtime: number | null;
  number_of_seasons: number | null;
  genres: Genre[];
  cast: CastMember[];
  videos: Video[];
}
export interface CatalogPage { results: Media[]; page: number; total_pages: number; total_results: number }
export interface CatalogQuery {
  type: CatalogType;
  search: string;
  genre: string;
  provider: string;
  sort: CatalogSort;
  region: string;
  page: number;
}

// Names/dates differ in TMDB movie and TV responses. Normalize at the API boundary.
export interface TmdbMedia {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: Genre[];
  adult?: boolean;
}

export function normalizeMedia(item: TmdbMedia, fallback: MediaType = 'movie'): Media {
  return {
    id: item.id,
    media_type: item.media_type === 'tv' ? 'tv' : item.media_type === 'movie' ? 'movie' : fallback,
    title: item.title || item.name || 'Título sin nombre',
    original_title: item.original_title || item.original_name || item.title || item.name || '',
    overview: item.overview || '',
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    release_date: item.release_date || item.first_air_date || '',
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    genre_ids: item.genre_ids || item.genres?.map(genre => genre.id) || [],
  };
}

export function mediaKey(item: Pick<Media, 'id' | 'media_type'>): string {
  return `${item.media_type}:${item.id}`;
}

export function imageUrl(path: string | null, size = 'w500'): string {
  return path && /^\/[a-zA-Z0-9_.-]+$/.test(path)
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : 'assets/poster-placeholder.svg';
}

export function safeProviderLink(link: string | undefined): string | null {
  if (!link) return null;
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && ['www.themoviedb.org', 'www.justwatch.com'].includes(url.hostname)
      ? url.href : null;
  } catch { return null; }
}

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Acción' }, { id: 12, name: 'Aventura' }, { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' }, { id: 80, name: 'Crimen' }, { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Familia' }, { id: 14, name: 'Fantasía' },
  { id: 27, name: 'Terror' }, { id: 9648, name: 'Misterio' }, { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia ficción' }, { id: 53, name: 'Suspense' },
];
export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Acción y aventura' }, { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' }, { id: 80, name: 'Crimen' }, { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Familia' }, { id: 9648, name: 'Misterio' },
  { id: 10765, name: 'Ciencia ficción y fantasía' },
];
export const REGIONS = [
  { code: 'ES', name: 'España' }, { code: 'MX', name: 'México' }, { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' }, { code: 'CO', name: 'Colombia' }, { code: 'PE', name: 'Perú' },
  { code: 'US', name: 'Estados Unidos' }, { code: 'GB', name: 'Reino Unido' },
  { code: 'FR', name: 'Francia' }, { code: 'DE', name: 'Alemania' },
  { code: 'IT', name: 'Italia' }, { code: 'PT', name: 'Portugal' }, { code: 'AU', name: 'Australia' },
];
