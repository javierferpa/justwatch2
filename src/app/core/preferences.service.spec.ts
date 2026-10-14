import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferencesService } from './preferences.service';
import { DEMO_CATALOG } from './demo-catalog';

describe('Browser preferences', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  const service = () => TestBed.inject(PreferencesService);
  it('starts in demo mode with Spain as the country', () => {
    expect(service().demo()).toBe(true);
    expect(service().region()).toBe('ES');
  });
  it('stores the token only in this session and removes it on disconnect', () => {
    service().setToken('Bearer fake-read-token');
    expect(sessionStorage.getItem('jw2.token')).toBe('fake-read-token');
    expect(localStorage.getItem('jw2.token')).toBeNull();
    service().setToken('');
    expect(sessionStorage.getItem('jw2.token')).toBeNull();
    expect(service().demo()).toBe(true);
  });
  it('persists independent movie/TV watchlist entries and toggles removal', () => {
    const movie = DEMO_CATALOG[0];
    const show = { ...DEMO_CATALOG[12], id: movie.id };
    service().toggle(movie);
    service().toggle(show);
    expect(service().watchlist()).toHaveLength(2);
    const restored = new PreferencesService();
    expect(restored.has(show)).toBe(true);
    restored.toggle(movie);
    expect(restored.watchlist()).toEqual([show]);
  });
  it('recovers from corrupt storage and ignores malformed entries', () => {
    localStorage.setItem('jw2.watchlist', '{broken');
    expect(service().watchlist()).toEqual([]);
    localStorage.setItem('jw2.watchlist', JSON.stringify([{ id: 1, title: 'incomplete' }, DEMO_CATALOG[0], DEMO_CATALOG[0]]));
    expect(new PreferencesService().watchlist()).toHaveLength(1);
  });
  it('keeps working when the browser rejects storage writes', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('disabled'); });
    service().toggle(DEMO_CATALOG[0]);
    expect(service().has(DEMO_CATALOG[0])).toBe(true);
    expect(service().storageNotice()).toContain('no permite guardar');
    spy.mockRestore();
  });
  it('does not accept an unsupported region from stored or supplied values', () => {
    localStorage.setItem('jw2.region', 'ZZ');
    expect(service().region()).toBe('ES');
    service().setRegion('MX');
    service().setRegion('ZZ');
    expect(service().region()).toBe('MX');
  });
});
