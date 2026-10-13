import { getLocale } from './locale';

describe('getLocale', () => {
  it('returns the supported locale from a route parameter', () => {
    expect(getLocale('de')).toBe('de');
    expect(getLocale('en')).toBe('en');
  });

  it('defaults unknown and missing route parameters to English', () => {
    expect(getLocale('fr')).toBe('en');
    expect(getLocale(null)).toBe('en');
    expect(getLocale(undefined)).toBe('en');
  });
});
