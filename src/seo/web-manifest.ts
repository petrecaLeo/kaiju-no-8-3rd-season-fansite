/* eslint-disable @typescript-eslint/naming-convention -- Web App Manifest members are snake_case */
import { getIconPath, getIconSizes, MANIFEST_ICONS } from '@/config/site-icons';
import { SITE } from '@/config/site';
import { DEFAULT_LOCALE, LOCALE_METADATA } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionary';

const ICON_PURPOSES = ['any', 'maskable'] as const;

export function buildWebManifest(): string {
  const { meta } = getDictionary(DEFAULT_LOCALE);
  const manifest = {
    name: meta.title,
    short_name: meta.siteName,
    description: meta.description,
    lang: DEFAULT_LOCALE,
    dir: LOCALE_METADATA[DEFAULT_LOCALE].direction,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: MANIFEST_ICONS.flatMap((icon) =>
      ICON_PURPOSES.map((purpose) => ({
        src: getIconPath(icon),
        sizes: getIconSizes(icon),
        type: 'image/png',
        purpose,
      })),
    ),
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
