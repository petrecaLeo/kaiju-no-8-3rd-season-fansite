import { getOpenGraphImagePath, SITE } from '@/config/site';
import { LOCALE_METADATA, LOCALES, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionary';
import { getLocaleUrl } from '@/i18n/routing';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  type: string;
  alt: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  siteName: string;
  canonicalUrl: string;
  alternates: AlternateLink[];
  openGraph: {
    locale: string;
    alternateLocales: string[];
    image: OpenGraphImage;
  };
}

interface SeoMetadataInput {
  locale: Locale;
  meta: Dictionary['meta'];
  pathname: string;
  site: URL;
}

export function getAlternateLinks(site: URL): AlternateLink[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale, href: getLocaleUrl(locale) })),
    { hreflang: 'x-default', href: new URL('/', site).href },
  ];
}

function getOpenGraphImage(locale: Locale, site: URL, alt: string): OpenGraphImage {
  const { width, height, type } = SITE.openGraphImage;
  return { url: new URL(getOpenGraphImagePath(locale), site).href, width, height, type, alt };
}

export function buildSeoMetadata({ locale, meta, pathname, site }: SeoMetadataInput): SeoMetadata {
  return {
    title: meta.title,
    description: meta.description,
    siteName: meta.fanSiteName,
    canonicalUrl: new URL(pathname, site).href,
    alternates: getAlternateLinks(site),
    openGraph: {
      locale: LOCALE_METADATA[locale].openGraphLocale,
      alternateLocales: LOCALES.filter((other) => other !== locale).map(
        (other) => LOCALE_METADATA[other].openGraphLocale,
      ),
      image: getOpenGraphImage(locale, site, meta.openGraphImageAlt),
    },
  };
}
