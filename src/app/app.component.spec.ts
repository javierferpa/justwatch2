import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { CardDisplayComponent } from './card-display/card-display.component';
import { CardDetailComponent } from './card-detail/card-detail.component';
import { PreferencesService } from './core/preferences.service';
import { DEMO_CATALOG } from './core/demo-catalog';

describe('Application routes and visible behavior', () => {
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient()] });
    TestBed.inject(PreferencesService).setDemo(true);
  });
  it('renders accessible navigation and a main landmark', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav[aria-label="Navegación principal"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('main')).toBeTruthy();
  });
  it('opens movie and TV routes with the correct catalog types', async () => {
    const harness = await RouterTestingHarness.create();
    let component = await harness.navigateByUrl('/movies', CardDisplayComponent);
    await harness.fixture.whenStable();
    expect(component.displayed().every(item => item.media_type === 'movie')).toBe(true);
    component = await harness.navigateByUrl('/tv', CardDisplayComponent);
    await harness.fixture.whenStable();
    expect(component.displayed().length).toBeGreaterThan(0);
    expect(component.displayed().every(item => item.media_type === 'tv')).toBe(true);
  });
  it('supports shareable search and genre filters and finite pagination', async () => {
    const harness = await RouterTestingHarness.create();
    let component = await harness.navigateByUrl('/?query=dune', CardDisplayComponent);
    await harness.fixture.whenStable();
    expect(component.displayed()).toHaveLength(2);
    component = await harness.navigateByUrl('/movies?genre=878', CardDisplayComponent);
    await harness.fixture.whenStable();
    expect(component.displayed().every(item => item.genre_ids.includes(878))).toBe(true);
    component = await harness.navigateByUrl('/', CardDisplayComponent);
    await harness.fixture.whenStable();
    component.load();
    expect(component.displayed()).toHaveLength(20);
    component.load();
    expect(component.displayed()).toHaveLength(20);
  });
  it('updates the watchlist route immediately after saving and removing a title', async () => {
    const preferences = TestBed.inject(PreferencesService);
    preferences.toggle(DEMO_CATALOG[0]);
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/watchlist', CardDisplayComponent);
    await harness.fixture.whenStable();
    expect(component.displayed()).toHaveLength(1);
    preferences.toggle(DEMO_CATALOG[0]);
    expect(component.displayed()).toHaveLength(0);
  });
  it('loads TV details when route IDs change and does not reuse a previous title', async () => {
    const harness = await RouterTestingHarness.create();
    let component = await harness.navigateByUrl('/title/tv/95396', CardDetailComponent);
    await harness.fixture.whenStable();
    expect(component.detail()?.id).toBe(95396);
    component = await harness.navigateByUrl('/title/tv/94605', CardDetailComponent);
    await harness.fixture.whenStable();
    expect(component.detail()?.id).toBe(94605);
    expect(component.error()).toBe('');
    expect(component.groups()).toEqual([]);
  });
  it('rejects malformed title routes rather than requesting an unintended endpoint', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/title/person/42', CardDetailComponent);
    await harness.fixture.whenStable();
    expect(component.detail()).toBeNull();
    expect(component.error()).toContain('no es válida');
  });
});
