import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, LOCALES } from './config';

export const REDIRECT_PENDING_ATTRIBUTE = 'data-redirecting';

interface LocaleRedirectOptions {
  locales: readonly string[];
  defaultLocale: string;
  storageKey: string;
  basePath: string;
  pendingAttribute: string;
}

function redirectToPreferredLocale(options: LocaleRedirectOptions): void {
  const { locales, defaultLocale, storageKey, basePath, pendingAttribute } = options;

  const matchLocale = (candidate: string): string | undefined => {
    const tag = candidate.toLowerCase();
    const language = tag.split('-')[0];
    return (
      locales.find((locale) => locale.toLowerCase() === tag) ??
      locales.find((locale) => locale.toLowerCase().split('-')[0] === language)
    );
  };

  const readStoredLocale = (): string | undefined => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored !== null && locales.includes(stored) ? stored : undefined;
    } catch {
      return undefined;
    }
  };

  const detectBrowserLocale = (): string | undefined => {
    try {
      return [...navigator.languages, navigator.language]
        .map(matchLocale)
        .find((locale) => locale !== undefined);
    } catch {
      return undefined;
    }
  };

  const target = readStoredLocale() ?? detectBrowserLocale() ?? defaultLocale;
  const root = document.documentElement;
  root.setAttribute(pendingAttribute, '');
  try {
    window.location.replace(
      `${basePath}${target}/${window.location.search}${window.location.hash}`,
    );
  } catch {
    root.removeAttribute(pendingAttribute);
  }
}

export function createLocaleRedirectScript(): string {
  const options: LocaleRedirectOptions = {
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    storageKey: LOCALE_STORAGE_KEY,
    basePath: import.meta.env.BASE_URL,
    pendingAttribute: REDIRECT_PENDING_ATTRIBUTE,
  };
  return `(${redirectToPreferredLocale.toString()})(${JSON.stringify(options)});`;
}
