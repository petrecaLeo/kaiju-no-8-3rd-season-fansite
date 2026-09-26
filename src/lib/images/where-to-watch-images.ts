import type { ImageMetadata } from 'astro';

import background from '@/assets/images/WhereToWatch/background.webp';
import crunchyroll from '@/assets/images/logo/crunchyroll.webp';
import type { Locale } from '@/i18n/config';

import { type ResponsiveImage, responsiveImage } from './responsive-image';

export interface WhereToWatchImages {
  background: ResponsiveImage;
  logo: ResponsiveImage | undefined;
}

// Crunchyroll does not stream in Japan, so the ja page links to the official site without a logo.
const PLATFORM_LOGOS = {
  'pt-BR': crunchyroll,
  en: crunchyroll,
  ja: undefined,
} as const satisfies Record<Locale, ImageMetadata | undefined>;

// With object-fit: cover the wide artwork always renders wider than the viewport, so the full-size
// file (about 50 KB) serves every screen. Keep LOGO_SIZES in sync with WhereToWatch.css.
const BACKGROUND_SIZES = '100vw';
const LOGO_SIZES = '(min-width: 30rem) 14rem, 45vw';

export function getWhereToWatchImages(locale: Locale): WhereToWatchImages {
  const logo = PLATFORM_LOGOS[locale];
  return {
    background: responsiveImage(background, [], BACKGROUND_SIZES),
    logo: logo && responsiveImage(logo, [224, 320, 448], LOGO_SIZES),
  };
}
