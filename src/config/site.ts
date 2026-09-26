import type { Locale } from '../i18n/config';

export const SITE = {
  themeColor: '#0b0d10',
  openGraphImage: {
    directory: 'og',
    extension: 'jpg',
    width: 1200,
    height: 630,
    type: 'image/jpeg',
  },
} as const;

export function getOpenGraphImagePath(locale: Locale): string {
  const { directory, extension } = SITE.openGraphImage;
  return `/${directory}/${locale}.${extension}`;
}
