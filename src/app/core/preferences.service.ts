import { Injectable, computed, signal } from '@angular/core';
import { Media, REGIONS, mediaKey } from './media';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly tokenState = signal(this.read('sessionStorage', 'jw2.token') || '');
  readonly token = this.tokenState.asReadonly();
  readonly demo = computed(() => !this.token());
  private readonly regionState = signal(this.loadRegion());
  readonly region = this.regionState.asReadonly();
  readonly regionName = computed(() => REGIONS.find(region => region.code === this.region())?.name || 'España');
  private readonly listState = signal<Media[]>(this.loadList());
  readonly watchlist = this.listState.asReadonly();
  readonly storageNotice = signal('');

  setToken(token: string): void {
    const clean = token.trim().replace(/^Bearer\s+/i, '');
    this.tokenState.set(clean);
    this.write('sessionStorage', 'jw2.token', clean);
  }

  setRegion(region: string): void {
    if (!REGIONS.some(item => item.code === region)) return;
    this.regionState.set(region);
    this.write('localStorage', 'jw2.region', region);
  }

  has(item: Media): boolean {
    return this.watchlist().some(saved => mediaKey(saved) === mediaKey(item));
  }

  toggle(item: Media): void {
    const items = this.has(item)
      ? this.watchlist().filter(saved => mediaKey(saved) !== mediaKey(item))
      : [item, ...this.watchlist()].slice(0, 500);
    this.listState.set(items);
    this.write('localStorage', 'jw2.watchlist', JSON.stringify(items));
  }

  private loadRegion(): string {
    const region = this.read('localStorage', 'jw2.region');
    return REGIONS.some(item => item.code === region) ? region! : 'ES';
  }

  private loadList(): Media[] {
    try {
      const items: unknown = JSON.parse(this.read('localStorage', 'jw2.watchlist') || '[]');
      if (!Array.isArray(items)) return [];
      const seen = new Set<string>();
      return items.filter((item): item is Media => {
        if (!item || typeof item !== 'object' || !Number.isSafeInteger(item.id) || item.id <= 0 ||
            !['movie', 'tv'].includes(item.media_type) || typeof item.title !== 'string' ||
            typeof item.original_title !== 'string' || typeof item.overview !== 'string' ||
            typeof item.release_date !== 'string' || typeof item.vote_average !== 'number' ||
            typeof item.vote_count !== 'number' || !Array.isArray(item.genre_ids) ||
            !item.genre_ids.every((id: unknown) => typeof id === 'number') ||
            (item.poster_path !== null && typeof item.poster_path !== 'string') ||
            (item.backdrop_path !== null && typeof item.backdrop_path !== 'string')) return false;
        const key = mediaKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 500);
    } catch { return []; }
  }

  private read(kind: 'localStorage' | 'sessionStorage', key: string): string | null {
    try { return globalThis[kind]?.getItem(key) || null; } catch { return null; }
  }

  private write(kind: 'localStorage' | 'sessionStorage', key: string, value: string): void {
    try {
      if (value) globalThis[kind]?.setItem(key, value);
      else globalThis[kind]?.removeItem(key);
      this.storageNotice.set('');
    } catch {
      this.storageNotice.set('El navegador no permite guardar datos. Tus cambios durarán hasta recargar la página.');
    }
  }
}
