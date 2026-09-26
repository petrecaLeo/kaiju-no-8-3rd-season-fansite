import { YOUTUBE_ORIGINS } from '../../../src/config/youtube';

export const CONTENT_SECURITY_POLICY = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'", 'data:', YOUTUBE_ORIGINS.thumbnail],
  'font-src': ["'self'"],
  'media-src': ["'self'"],
  'frame-src': [YOUTUBE_ORIGINS.embed],
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
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=(), browsing-topics=()',
} as const satisfies Record<string, string>;

export const CACHE_RULES = [
  { path: '/_astro/*', cacheControl: 'public, max-age=31536000, immutable' },
] as const;
