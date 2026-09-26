import type { FontFamily } from '@/config/fonts';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionary';

export interface BaseHeadProps {
  locale: Locale;
  meta: Dictionary['meta'];
  title?: string;
  indexable?: boolean;
  preloadFonts?: boolean;
  fontFamilies?: readonly FontFamily[];
}
