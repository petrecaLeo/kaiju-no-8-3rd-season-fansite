export const FAVICON_SOURCE = 'src/assets/images/logo/favicon.png';

export const WEB_MANIFEST_PATH = '/site.webmanifest';

export interface SiteIcon {
  file: string;
  size: number;
  inset: number;
  opaque: boolean;
}

export const FAVICON_ICO = {
  file: 'favicon.ico',
  size: 32,
  inset: 0,
  opaque: false,
} as const satisfies SiteIcon;

export const FAVICON_PNGS = [
  { file: 'favicon-16x16.png', size: 16, inset: 0, opaque: false },
  { file: 'favicon-32x32.png', size: 32, inset: 0, opaque: false },
] as const satisfies readonly SiteIcon[];

// iOS fills transparent pixels with black anyway and rounds the corners, so the icon gets the page
// background and some room around the logo.
export const APPLE_TOUCH_ICON = {
  file: 'apple-touch-icon.png',
  size: 180,
  inset: 0.15,
  opaque: true,
} as const satisfies SiteIcon;

// Opaque and inset by 20% so the logo stays inside the 80% circle Android keeps from a maskable
// icon; the same files work as regular icons.
export const MANIFEST_ICONS = [
  { file: 'icon-192.png', size: 192, inset: 0.2, opaque: true },
  { file: 'icon-512.png', size: 512, inset: 0.2, opaque: true },
] as const satisfies readonly SiteIcon[];

export const GENERATED_ICONS = [
  ...FAVICON_PNGS,
  APPLE_TOUCH_ICON,
  ...MANIFEST_ICONS,
] as const satisfies readonly SiteIcon[];

export function getIconPath({ file }: SiteIcon): string {
  return `/${file}`;
}

export function getIconSizes({ size }: SiteIcon): string {
  return `${String(size)}x${String(size)}`;
}
