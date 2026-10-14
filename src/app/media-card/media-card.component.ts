import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Media, imageUrl } from '../core/media';
import { PreferencesService } from '../core/preferences.service';

@Component({
  selector: 'app-media-card', imports: [RouterLink, DecimalPipe],
  template: `
    <article class="media-card">
      <a class="poster-link" [routerLink]="['/title', item().media_type, item().id]" [attr.aria-label]="'Ver ficha de ' + item().title">
        <img [src]="failed() ? 'assets/poster-placeholder.svg' : image(item().poster_path)"
          [alt]="'Cartel de ' + item().title" width="400" height="600" [attr.loading]="priority() ? 'eager' : 'lazy'" decoding="async" (error)="failed.set(true)">
        <span class="score" [class.unrated]="!item().vote_count">★ {{ item().vote_count ? (item().vote_average | number:'1.1-1') : '—' }}</span>
        <span class="poster-overlay">Ver ficha <span aria-hidden="true">↗</span></span>
      </a>
      <button class="save-button" [class.saved]="preferences.has(item())" (click)="preferences.toggle(item())"
        [attr.aria-pressed]="preferences.has(item())" [attr.aria-label]="(preferences.has(item()) ? 'Quitar de mi lista: ' : 'Guardar en mi lista: ') + item().title">
        <span aria-hidden="true">{{ preferences.has(item()) ? '✓' : '+' }}</span>
      </button>
      <a class="card-title" [routerLink]="['/title', item().media_type, item().id]">{{ item().title }}</a>
      <p class="card-meta">{{ item().release_date.slice(0, 4) || 'Sin fecha' }} <span>·</span> {{ item().media_type === 'tv' ? 'Serie' : 'Película' }}</p>
    </article>
  `,
  styleUrl: './media-card.component.css',
})
export class MediaCardComponent {
  readonly item = input.required<Media>();
  readonly priority = input(false);
  readonly preferences = inject(PreferencesService);
  readonly failed = signal(false);
  readonly image = imageUrl;
}
