import type { FontFamily, FontFile } from '@/config/fonts';
import type { Locale } from '@/i18n/config';
import { getLocaleFonts } from '@/lib/fonts/locale-fonts';

const FONT_URLS = import.meta.glob<string>('/src/assets/fonts/**/*.woff2', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getFontUrl(font: FontFile): string | undefined {
  return FONT_URLS[`/src/assets/fonts/${font.file}`];
}

export function getFontPreloads(
  locales: readonly Locale[],
  families?: readonly FontFamily[],
): string[] {
  return getLocaleFonts(locales)
    .filter((font) => families?.some((family) => family === font.family) ?? true)
    .map(getFontUrl)
    .filter((url) => url !== undefined);
}
