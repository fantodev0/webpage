export type Locale = 'en' | 'de';

export type Theme = 'light' | 'dark';

export function getLocale(value: string | null | undefined): Locale {
  return value === 'de' ? 'de' : 'en';
}
