import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subscription, combineLatest } from 'rxjs';
import { CatalogService, apiErrorMessage } from '../core/catalog.service';
import { MediaDetail, MediaType, ProviderRegion, ProviderResponse, imageUrl, safeProviderLink } from '../core/media';
import { PreferencesService } from '../core/preferences.service';
import { ImageFallbackDirective } from '../shared/image-fallback.directive';

@Component({
  selector: 'app-card-detail', imports: [RouterLink, DecimalPipe, ImageFallbackDirective],
  templateUrl: './card-detail.component.html', styleUrl: './card-detail.component.css',
})
export class CardDetailComponent {
  readonly preferences = inject(PreferencesService);
  private readonly api = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly destroy = inject(DestroyRef);
  readonly detail = signal<MediaDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly canRetry = signal(false);
  readonly providerLoading = signal(false);
  readonly providerError = signal('');
  readonly providerData = signal<ProviderResponse>({ results: {} });
  readonly availability = computed(() => this.providerData().results[this.preferences.region()] || {});
  readonly providerLink = computed(() => safeProviderLink(this.availability().link));
  readonly groups = computed(() => {
    const data = this.availability();
    const definitions: { key: keyof ProviderRegion; label: string }[] = [
      { key: 'flatrate', label: 'Incluido en suscripción' }, { key: 'free', label: 'Gratis' },
      { key: 'ads', label: 'Gratis con anuncios' }, { key: 'rent', label: 'Alquilar' }, { key: 'buy', label: 'Comprar' },
    ];
    return definitions.map(group => ({ label: group.label, providers: Array.isArray(data[group.key]) ? data[group.key] as Exclude<ProviderRegion['flatrate'], undefined> : [] }))
      .filter(group => group.providers.length);
  });
  readonly trailer = computed(() => {
    const video = this.detail()?.videos.find(item => item.site === 'YouTube' && item.type === 'Trailer' && item.official && /^[a-zA-Z0-9_-]{11}$/.test(item.key));
    return video ? 'https://www.youtube.com/watch?v=' + video.key : null;
  });
  readonly backdrop = computed(() => this.detail()?.backdrop_path ? 'url("' + imageUrl(this.detail()!.backdrop_path, 'w1280') + '")' : null);
  readonly image = imageUrl;
  private detailRequest?: Subscription;
  private providerRequest?: Subscription;
  private mediaType: MediaType = 'movie';
  private mediaId = 0;

  constructor() {
    combineLatest([this.route.paramMap, toObservable(this.preferences.demo)]).pipe(takeUntilDestroyed(this.destroy))
      .subscribe(([params]) => {
        this.detailRequest?.unsubscribe();
        this.detail.set(null);
        this.error.set('');
        const type = params.get('type');
        const rawId = params.get('id') || '';
        const id = Number(rawId);
        if ((type !== 'movie' && type !== 'tv') || !/^\d+$/.test(rawId) || !Number.isSafeInteger(id) || id <= 0) {
          this.canRetry.set(false);
          this.mediaId = 0;
          this.error.set('La dirección de este título no es válida.');
          this.loading.set(false);
          this.title.setTitle('Título no encontrado · JustWatch2');
          return;
        }
        this.mediaType = type;
        this.canRetry.set(true);
        this.mediaId = id;
        this.loadDetail();
      });
    combineLatest([this.route.paramMap, toObservable(this.preferences.demo), toObservable(this.preferences.region)])
      .pipe(takeUntilDestroyed(this.destroy)).subscribe(([params]) => {
        const type = params.get('type');
        const rawId = params.get('id') || '';
        const id = Number(rawId);
        if ((type === 'movie' || type === 'tv') && /^\d+$/.test(rawId) && Number.isSafeInteger(id) && id > 0) {
          this.loadProviders(type, id);
        } else {
          this.providerRequest?.unsubscribe();
          this.providerLoading.set(false);
          this.providerData.set({ results: {} });
        }
      });
    this.destroy.onDestroy(() => { this.detailRequest?.unsubscribe(); this.providerRequest?.unsubscribe(); });
  }

  loadDetail(): void {
    if (!this.mediaId) return;
    this.detailRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.detailRequest = this.api.detail(this.mediaType, this.mediaId).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: detail => { this.detail.set(detail); this.loading.set(false); this.title.setTitle(detail.title + ' · JustWatch2'); },
      error: error => { this.error.set(apiErrorMessage(error)); this.loading.set(false); this.title.setTitle('Título no encontrado · JustWatch2'); },
    });
  }

  loadProviders(type: MediaType = this.mediaType, id = this.mediaId): void {
    if (!id) return;
    this.providerRequest?.unsubscribe();
    this.providerData.set({ results: {} });
    this.providerError.set('');
    this.providerLoading.set(true);
    this.providerRequest = this.api.providers(type, id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: data => { this.providerData.set(data); this.providerLoading.set(false); },
      error: () => { this.providerError.set('No pudimos comprobar la disponibilidad. La ficha sigue disponible.'); this.providerLoading.set(false); },
    });
  }
}
