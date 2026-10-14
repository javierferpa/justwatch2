import { InjectionToken } from '@angular/core';

// Public service URL only. TMDB credentials exist exclusively in server runtime secrets.
export const CATALOG_API_BASE = new InjectionToken<string>('CATALOG_API_BASE', {
  providedIn: 'root',
  factory: () => 'https://justwatch2-catalog-api.javierferpa.workers.dev/api/tmdb',
});
