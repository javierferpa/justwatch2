import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PreferencesService } from '../core/preferences.service';
import { REGIONS } from '../core/media';

@Component({
  selector: 'app-navbar', imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html', styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  readonly preferences = inject(PreferencesService);
  private readonly router = inject(Router);
  readonly regions = REGIONS;
  readonly currentPath = signal('');
  search = '';

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => {
        const tree = this.router.parseUrl(this.router.url);
        this.currentPath.set(tree.root.children['primary']?.segments[0]?.path || '');
        this.search = tree.queryParams['query'] || '';
      });
  }

  submitSearch(): void {
    const path = ['movies', 'tv', 'watchlist'].includes(this.currentPath()) ? '/' + this.currentPath() : '/';
    void this.router.navigate([path], { queryParams: { query: this.search.trim().slice(0, 200) || null } });
  }
}
