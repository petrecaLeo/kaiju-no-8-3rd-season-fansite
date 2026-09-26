import { SITE } from '../../../src/config/site';
import {
  FAVICON_ICO,
  GENERATED_ICONS,
  getIconPath,
  WEB_MANIFEST_PATH,
} from '../../../src/config/site-icons';
import { YOUTUBE_ORIGINS } from '../../../src/config/youtube';

export const CONTENT_SECURITY_POLICY = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'", 'data:', YOUTUBE_ORIGINS.thumbnail],
  'font-src': ["'self'"],
  'frame-src': [YOUTUBE_ORIGINS.embed],
  // The site never fetches anything, but Lighthouse and PageSpeed Insights download robots.txt
  // from inside the page and report it as invalid when this is blocked.
  'connect-src': ["'self'"],
  'manifest-src': ["'self'"],
  'base-uri': ["'none'"],
  'form-action': ["'none'"],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
} as const satisfies Record<string, readonly string[]>;

export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // The trailer iframe asks for autoplay, clipboard-write, encrypted-media, picture-in-picture and
  // web-share, so those stay allowed. bluetooth, serial and hid are left out: Chrome logs an
  // "Unrecognized feature" warning on platforms without those APIs (bluetooth on Linux).
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'midi=()',
    'accelerometer=()',
    'gyroscope=()',
    'magnetometer=()',
    'display-capture=()',
    'idle-detection=()',
    'screen-wake-lock=()',
    'xr-spatial-tracking=()',
    'browsing-topics=()',
  ].join(', '),
} as const satisfies Record<string, string>;

// Every response, HTML included, revalidates, so a new deploy shows up on the next load.
export const DEFAULT_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

const ONE_DAY = 'public, max-age=86400';

export const CACHE_RULES = [
  { paths: ['/_astro/*'], cacheControl: 'public, max-age=31536000, immutable' },
  {
    paths: [
      ...[FAVICON_ICO, ...GENERATED_ICONS].map(getIconPath),
      WEB_MANIFEST_PATH,
      `/${SITE.openGraphImage.directory}/*`,
    ],
    cacheControl: ONE_DAY,
  },
] as const satisfies readonly { paths: readonly string[]; cacheControl: string }[];
