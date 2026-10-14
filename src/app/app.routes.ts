import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./card-display/card-display.component').then(m => m.CardDisplayComponent), data: { type: 'all' }, title: 'Descubrir · JustWatch2' },
  { path: 'movies', loadComponent: () => import('./card-display/card-display.component').then(m => m.CardDisplayComponent), data: { type: 'movie' }, title: 'Películas · JustWatch2' },
  { path: 'tv', loadComponent: () => import('./card-display/card-display.component').then(m => m.CardDisplayComponent), data: { type: 'tv' }, title: 'Series · JustWatch2' },
  { path: 'watchlist', loadComponent: () => import('./card-display/card-display.component').then(m => m.CardDisplayComponent), data: { type: 'watchlist' }, title: 'Mi lista · JustWatch2' },
  { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent), title: 'Ajustes · JustWatch2' },
  { path: 'title/:type/:id', loadComponent: () => import('./card-detail/card-detail.component').then(m => m.CardDetailComponent) },
  { path: 'card-detail/:id', redirectTo: 'title/movie/:id', pathMatch: 'full' },
  { path: '**', loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent), title: 'Página no encontrada · JustWatch2' },
];
