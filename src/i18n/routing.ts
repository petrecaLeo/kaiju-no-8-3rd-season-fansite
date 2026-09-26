import type { GetStaticPaths } from 'astro';
import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from 'astro:i18n';

import { LOCALE_METADATA, LOCALES, type Locale } from './config';

export interface LanguageLink {
  locale: Locale;
  href: string;
  label: string;
  shortLabel: string;
  isCurrent: boolean;
}

export interface LanguageMenu {
  current: LanguageLink;
  alternatives: LanguageLink[];
}

const PRESERVE_LOCALE_CASE = { normalizeLocale: false };

export const getLocaleStaticPaths = (() =>
  LOCALES.map((locale) => ({ params: { locale }, props: { locale } }))) satisfies GetStaticPaths;

export function getLocalePath(locale: Locale): string {
  return getRelativeLocaleUrl(locale, '', PRESERVE_LOCALE_CASE);
}

export function getLocaleUrl(locale: Locale): string {
  return getAbsoluteLocaleUrl(locale, '', PRESERVE_LOCALE_CASE);
}

function getLanguageLink(locale: Locale, currentLocale?: Locale): LanguageLink {
  return {
    locale,
    href: getLocalePath(locale),
    label: LOCALE_METADATA[locale].nativeName,
    shortLabel: LOCALE_METADATA[locale].shortName,
    isCurrent: locale === currentLocale,
  };
}

export function getLanguageLinks(currentLocale?: Locale): LanguageLink[] {
  return LOCALES.map((locale) => getLanguageLink(locale, currentLocale));
}

export function getLanguageMenu(currentLocale: Locale): LanguageMenu {
  return {
    current: getLanguageLink(currentLocale, currentLocale),
    alternatives: LOCALES.filter((locale) => locale !== currentLocale).map((locale) =>
      getLanguageLink(locale, currentLocale),
    ),
  };
}
