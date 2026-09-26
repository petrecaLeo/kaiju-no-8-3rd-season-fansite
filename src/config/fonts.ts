import { LOCALES, type Locale } from '../i18n/config';

export const FONT_ASSETS_DIR = 'src/assets/fonts';

export interface FontFile {
  family: string;
  weight: number;
  file: `${string}.woff2`;
  locales: readonly Locale[];
}

const LATIN_LOCALES = ['pt-BR', 'en'] as const satisfies readonly Locale[];

export const FONT_FILES = [
  { family: 'Paladins', weight: 400, file: 'paladins/paladinsstraight.woff2', locales: LOCALES },
  { family: 'Exo 2', weight: 400, file: 'exo2/Exo2-Regular.woff2', locales: LATIN_LOCALES },
  { family: 'Exo 2', weight: 600, file: 'exo2/Exo2-SemiBold.woff2', locales: LATIN_LOCALES },
  {
    family: 'Noto Sans JP',
    weight: 400,
    file: 'noto-sans-jp/NotoSansJP-Regular.woff2',
    locales: ['ja'],
  },
  {
    family: 'Noto Sans JP',
    weight: 500,
    file: 'noto-sans-jp/NotoSansJP-Medium.woff2',
    locales: ['ja'],
  },
] as const satisfies readonly FontFile[];

export type FontFamily = (typeof FONT_FILES)[number]['family'];
