import type { Locale } from '../i18n/config';

// Placeholder on the reserved .example TLD (RFC 2606): canonical, hreflang, og:url, the sitemap
// and robots.txt all derive from it, and the build warns until it is replaced.
export const SITE = {
  url: 'https://seu-dominio.example',
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
