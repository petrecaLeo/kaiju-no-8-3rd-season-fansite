import type { GetStaticPaths } from 'astro';

import meme from '@/assets/images/404/meme.webp';
import type { FontFamily } from '@/config/fonts';
import { LOCALES, type Locale } from '@/i18n/config';
import { formatMessage, getDictionary } from '@/i18n/dictionary';
import { getLocalePath } from '@/i18n/routing';

export interface NotFoundContent {
  documentTitle: string;
  status: string;
  headingDetail: string;
  message: string;
  homeLabel: string;
  homeHref: string;
  imageAlt: string;
}

const NOT_FOUND_STATUS = '404';

// Hosts serve /404.html for any missing URL, so English is the version everyone can fall back to.
export const ROOT_NOT_FOUND_LOCALE = 'en' satisfies Locale;

export const NOT_FOUND_FONT_FAMILIES = ['Paladins'] as const satisfies readonly FontFamily[];

// The source is only 435 px wide, so one file serves every screen. The crop drops the blank rows
// above and below the drawing (it spans y 86–343 of 459) and keeps it centred.
export const NOT_FOUND_IMAGE = {
  src: meme,
  width: meme.width,
  height: 300,
  fit: 'cover',
} as const;

export const getLocalizedNotFoundPaths = (() =>
  LOCALES.filter((locale) => locale !== ROOT_NOT_FOUND_LOCALE).map((locale) => ({
    params: { locale },
    props: { locale },
  }))) satisfies GetStaticPaths;

// The 404 a host like Cloudflare Pages would serve for a missing path: the one in its locale folder.
export function getLocalizedNotFoundPath(pathname: string): string | undefined {
  const locale = LOCALES.find(
    (candidate) => candidate !== ROOT_NOT_FOUND_LOCALE && pathname.startsWith(`/${candidate}/`),
  );
  return locale && `/${locale}/404/`;
}

export function getNotFoundContent(locale: Locale): NotFoundContent {
  const { meta, notFound } = getDictionary(locale);

  return {
    documentTitle: formatMessage(notFound.documentTitle, {
      status: NOT_FOUND_STATUS,
      title: notFound.title,
      siteName: meta.siteName,
    }),
    status: NOT_FOUND_STATUS,
    headingDetail: `: ${notFound.title}`,
    message: notFound.message,
    homeLabel: notFound.homeLink,
    homeHref: getLocalePath(locale),
    imageAlt: notFound.imageAlt,
  };
}
