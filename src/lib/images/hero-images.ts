import type { ImageMetadata } from 'astro';

import armor from '@/assets/images/hero/background.png';
import eye from '@/assets/images/hero/eye.webp';
import logoLatin from '@/assets/images/logo/ENLogo.webp';
import logoJapanese from '@/assets/images/logo/JPLogo.webp';
import type { Locale } from '@/i18n/config';

import { type ImageEncoding, type ResponsiveImage, responsiveImage } from './responsive-image';

export interface HeroImages {
  armor: ResponsiveImage;
  eye: ResponsiveImage;
  logo: ResponsiveImage;
}

const LOGOS = {
  'pt-BR': logoLatin,
  en: logoLatin,
  ja: logoJapanese,
} as const satisfies Record<Locale, ImageMetadata>;

// Keep in sync with HeroArtwork.css, HeroEye.css and HeroLockup.css. The stage is the wider of
// 100vw (room to centre the socket axis) and 107vh (60% of the height); the eye is 10.5% of it.
const STAGE_SIZES = '(min-aspect-ratio: 16/15) 100vw, 107vh';
const EYE_SIZES = '(min-aspect-ratio: 16/15) 10.5vw, 11.2vh';
const LOGO_SIZES = '(min-width: 35rem) 27rem, 78vw';
// The armour fills the hero and its red texture is the point of the art. AVIF keeps the colour
// at full resolution (lossy webp halves it): at q90 it weighs what webp q95 did, and its red
// channel errs a third as much.
const ARMOR_ENCODING = { format: 'avif', quality: 90 } as const satisfies ImageEncoding;

export function getHeroImages(locale: Locale): HeroImages {
  return {
    armor: responsiveImage(armor, [720, 1080, 1440, 1920], STAGE_SIZES, ARMOR_ENCODING),
    eye: responsiveImage(eye, [160, 240, 320, 480, 640], EYE_SIZES),
    logo: responsiveImage(LOGOS[locale], [320, 480, 640, 864, 1080], LOGO_SIZES),
  };
}

export function getHeroPreloads({ armor, eye, logo }: HeroImages): ResponsiveImage[] {
  return [armor, eye, logo];
}
