export const LOCALES = ['pt-BR', 'en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = 'pt-BR' satisfies Locale;

export const LOCALE_STORAGE_KEY = 'kaiju8-teaser:locale';

interface LocaleMetadata {
  nativeName: string;
  shortName: string;
  openGraphLocale: string;
  direction: 'ltr' | 'rtl';
}

export const LOCALE_METADATA = {
  'pt-BR': { nativeName: 'Português', shortName: 'PT', openGraphLocale: 'pt_BR', direction: 'ltr' },
  en: { nativeName: 'English', shortName: 'EN', openGraphLocale: 'en_US', direction: 'ltr' },
  ja: { nativeName: '日本語', shortName: 'JP', openGraphLocale: 'ja_JP', direction: 'ltr' },
} as const satisfies Record<Locale, LocaleMetadata>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.some((locale) => locale === value);
}
