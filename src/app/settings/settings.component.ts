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

  checkConnection(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.success.set('');
    this.api.health().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: response => {
        this.busy.set(false);
        if (response.status === 'ok') this.success.set('El servicio está disponible. Ya puedes explorar el catálogo.');
        else this.error.set('El servicio de catálogo no está disponible ahora. Vuelve a intentarlo más tarde.');
      },
      error: error => { this.error.set(apiErrorMessage(error)); this.busy.set(false); },
    });
  }

  setDemo(enabled: boolean): void {
    this.preferences.setDemo(enabled);
    this.error.set('');
    this.success.set('');
  }
}
