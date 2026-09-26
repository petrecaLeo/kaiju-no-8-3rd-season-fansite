import { FONT_FILES, type FontFile } from '@/config/fonts';
import type { Locale } from '@/i18n/config';

export function getLocaleFonts(locales: readonly Locale[]): FontFile[] {
  return FONT_FILES.filter((font) => font.locales.some((locale) => locales.includes(locale)));
}
