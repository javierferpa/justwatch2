import { describe, expect, it } from 'vitest';
import { imageUrl, mediaKey, normalizeMedia, safeProviderLink } from './media';

describe('TMDB media boundary', () => {
  it('normalizes TV titles and dates without confusing them with movies', () => {
    const item = normalizeMedia({ id: 42, name: 'Una serie', original_name: 'A show', first_air_date: '2024-01-01' }, 'tv');
    expect(item.title).toBe('Una serie');
    expect(item.release_date).toBe('2024-01-01');
    expect(item.media_type).toBe('tv');
    expect(item.poster_path).toBeNull();
  });
  it('keeps movie and TV identities separate even when their numeric IDs collide', () => {
    expect(mediaKey({ id: 42, media_type: 'tv' })).not.toBe(mediaKey({ id: 42, media_type: 'movie' }));
  });
  it('uses a local placeholder and refuses paths that escape the image endpoint', () => {
    expect(imageUrl(null)).toBe('assets/poster-placeholder.svg');
    expect(imageUrl('/cartel.jpg')).toBe('https://image.tmdb.org/t/p/w500/cartel.jpg');
    expect(imageUrl('/../untrusted')).toBe('assets/poster-placeholder.svg');
  });
  it('accepts only HTTPS availability links from the data providers', () => {
    expect(safeProviderLink('https://www.themoviedb.org/movie/42/watch?locale=ES')).toContain('locale=ES');
    expect(safeProviderLink('javascript:alert(1)')).toBeNull();
    expect(safeProviderLink('https://www.themoviedb.org.evil.example/watch')).toBeNull();
  });
});
