import type { SvgComponent } from 'astro/types';

import brazil from '@/assets/images/flags/brazil.svg';
import japan from '@/assets/images/flags/japan.svg';
import unitedStates from '@/assets/images/flags/united-states.svg';
import type { Locale } from '@/i18n/config';

export const LOCALE_FLAGS = {
  'pt-BR': brazil,
  en: unitedStates,
  ja: japan,
} as const satisfies Record<Locale, SvgComponent>;
