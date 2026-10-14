import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subscription, combineLatest } from 'rxjs';
import { CatalogService, apiErrorMessage } from '../core/catalog.service';
import { PreferencesService } from '../core/preferences.service';
import { CatalogSort, CatalogType, Media, MOVIE_GENRES, TV_GENRES, Provider, imageUrl, mediaKey } from '../core/media';
import { DEMO_CATALOG } from '../core/demo-catalog';
import { MediaCardComponent } from '../media-card/media-card.component';
import { ImageFallbackDirective } from '../shared/image-fallback.directive';

@Component({
  selector: 'app-card-display', imports: [RouterLink, MediaCardComponent, DecimalPipe, ImageFallbackDirective],
  templateUrl: './card-display.component.html', styleUrl: './card-display.component.css',
})
export class CardDisplayComponent {
  readonly preferences = inject(PreferencesService);
  private readonly api = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly type = signal<CatalogType>('all');
  readonly search = signal('');
  readonly genre = signal('');
  readonly provider = signal('');
  readonly sort = signal<CatalogSort>('popular');
  readonly items = signal<Media[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly providerError = signal('');
  readonly providers = signal<Provider[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly totalPages = signal(1);
  readonly genres = computed(() => this.type() === 'tv' ? TV_GENRES : MOVIE_GENRES);
  readonly heading = computed(() => this.search() ? 'Resultados de búsqueda' : this.type() === 'movie'
    ? 'Películas para cada momento' : this.type() === 'tv' ? 'Series que te atrapan'
    : this.type() === 'watchlist' ? 'Tu próxima sesión empieza aquí' : 'Historias que merecen tu tiempo');
  readonly displayed = computed(() => {
    if (this.type() !== 'watchlist') return this.items();
    const query = this.search().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return this.preferences.watchlist().filter(item => (item.title + ' ' + item.original_title)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query));
  });
  readonly count = computed(() => this.type() === 'watchlist' ? this.displayed().length : this.total());
  readonly heroItems = [DEMO_CATALOG[0], DEMO_CATALOG[12], DEMO_CATALOG[18]];
  readonly image = imageUrl;
  readonly key = mediaKey;
  private request?: Subscription;
  private optionsRequest?: Subscription;
  private providerCacheKey = '';

  constructor() {
    combineLatest([this.route.data, this.route.queryParamMap, toObservable(this.preferences.token),
      toObservable(this.preferences.region)]).pipe(takeUntilDestroyed(this.destroy))
      .subscribe(([data, params]) => {
        this.type.set(data['type'] || 'all');
        this.search.set((params.get('query') || '').trim().slice(0, 200));
        this.genre.set(this.genres().some(g => String(g.id) === params.get('genre')) ? params.get('genre')! : '');
        this.provider.set(/^\d{1,8}$/.test(params.get('provider') || '') ? params.get('provider')! : '');
        const sort = params.get('sort');
        this.sort.set(sort === 'rating' || sort === 'newest' ? sort : 'popular');
        this.loadProviderOptions();
        this.load(true);
      });
    this.destroy.onDestroy(() => { this.request?.unsubscribe(); this.optionsRequest?.unsubscribe(); });
  }

  load(reset = false): void {
    if (reset) {
      this.request?.unsubscribe();
      this.items.set([]);
      this.page.set(0);
      this.total.set(0);
      this.totalPages.set(1);
      this.loading.set(false);
    }
    if (this.type() === 'watchlist') { this.error.set(''); return; }
    if (this.loading() || (!reset && this.page() >= this.totalPages())) return;
    this.loading.set(true);
    this.error.set('');
    const nextPage = this.page() + 1;
    this.request = this.api.catalog({ type: this.type(), search: this.search(), genre: this.genre(),
      provider: this.provider(), sort: this.sort(), region: this.preferences.region(), page: nextPage })
      .pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: response => {
          const unique = new Map([...this.items(), ...response.results].map(item => [mediaKey(item), item]));
          this.items.set([...unique.values()]);
          this.page.set(response.page);
          this.total.set(response.total_results);
          this.totalPages.set(response.total_pages);
          this.loading.set(false);
        },
        error: error => { this.error.set(apiErrorMessage(error)); this.loading.set(false); },
      });
  }

  setFilter(name: string, value: string): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { [name]: value || null },
      queryParamsHandling: 'merge' });
  }

  clearFilters(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  loadProviderOptions(force = false): void {
    const type = this.type();
    const cacheKey = type + this.preferences.region() + this.preferences.token();
    if (!force && cacheKey === this.providerCacheKey) return;
    this.providerCacheKey = cacheKey;
    this.optionsRequest?.unsubscribe();
    this.providers.set([]);
    this.providerError.set('');
    if (type !== 'movie' && type !== 'tv') return;
    this.optionsRequest = this.api.providerOptions(type, this.preferences.region())
      .pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: providers => this.providers.set(providers),
        error: () => this.providerError.set('No pudimos cargar las plataformas de este país. Puedes seguir explorando.'),
      });
  }

  scrollToCatalog(): void {
    document.getElementById('catalog')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}
