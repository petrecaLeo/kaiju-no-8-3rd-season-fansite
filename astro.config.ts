import sitemap, { type SitemapItem } from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { FontaineTransform } from 'fontaine';

import { FONT_FILES } from './src/config/fonts';
import { SITE } from './src/config/site';
import { DEFAULT_LOCALE, LOCALES } from './src/i18n/config';
import { fontFiles } from './tooling/integrations/font-files';
import { notFoundPages } from './tooling/integrations/not-found-pages';
import { securityHeaders } from './tooling/integrations/security-headers';
import { siteUrlCheck } from './tooling/integrations/site-url';

const EXCLUDED_FROM_SITEMAP = new Set(['/']);

const isListedInSitemap = (page: string): boolean =>
  !EXCLUDED_FROM_SITEMAP.has(new URL(page).pathname);

// Same x-default as the <link rel="alternate"> tags: the root picks the visitor's language.
const addDefaultAlternate = (item: SitemapItem): SitemapItem =>
  item.links?.length
    ? { ...item, links: [...item.links, { lang: 'x-default', url: new URL('/', item.url).href }] }
    : item;

const keepScriptsAndFontsExternal = (filePath: string): false | undefined =>
  /\.(?:js|woff2)$/.test(filePath) ? false : undefined;

export default defineConfig({
  site: SITE.url,
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: isListedInSitemap,
      serialize: addDefaultAlternate,
      namespaces: { news: false, image: false, video: false },
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: Object.fromEntries(LOCALES.map((locale) => [locale, locale])),
      },
    }),
    fontFiles(FONT_FILES),
    notFoundPages(),
    securityHeaders(),
    siteUrlCheck(),
  ],
  vite: {
    build: {
      assetsInlineLimit: keepScriptsAndFontsExternal,
    },
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger'],
    },
    plugins: [
      FontaineTransform.vite({
        fallbacks: {},
      }),
    ],
  },
});
