import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PreferencesService } from '../core/preferences.service';
import { CatalogService, apiErrorMessage } from '../core/catalog.service';
import { REGIONS } from '../core/media';

@Component({
  selector: 'app-settings', imports: [FormsModule, RouterLink],
  templateUrl: './settings.component.html', styleUrl: './settings.component.css',
})
export class SettingsComponent {
  readonly preferences = inject(PreferencesService);
  private readonly api = inject(CatalogService);
  private readonly destroy = inject(DestroyRef);
  readonly regions = REGIONS;
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  token = '';

  connect(): void {
    if (this.busy()) return;
    const token = this.token.trim().replace(/^Bearer\s+/i, '');
    this.error.set('');
    this.success.set('');
    if (token.length < 20 || /\s/.test(token) || token.length > 2048) {
      this.error.set('Introduce el API Read Access Token de TMDB, sin comillas.');
      return;
    }
    this.busy.set(true);
    this.api.validateToken(token).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        this.preferences.setToken(token);
        this.token = '';
        this.busy.set(false);
        this.success.set('TMDB conectado. Ya puedes buscar títulos y consultar disponibilidad real.');
      },
      error: error => { this.error.set(apiErrorMessage(error)); this.busy.set(false); },
    });
  }

  disconnect(): void {
    this.preferences.setToken('');
    this.token = '';
    this.error.set('');
    this.success.set('Conexión eliminada de esta sesión. Puedes seguir explorando la selección de ejemplo.');
  }
}
