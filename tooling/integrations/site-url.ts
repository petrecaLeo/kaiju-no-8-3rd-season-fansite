import type { AstroIntegration } from 'astro';

const PLACEHOLDER_TLD = '.example';

export function siteUrlCheck(): AstroIntegration {
  let site: string | undefined;

  return {
    name: 'site-url',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site;
      },
      'astro:build:done': ({ logger }) => {
        if (site === undefined || new URL(site).hostname.endsWith(PLACEHOLDER_TLD)) {
          logger.warn(
            `site is still the placeholder (${site ?? 'unset'}). Canonical, hreflang, og:url, og:image, the sitemap and robots.txt point to it: set SITE.url in src/config/site.ts before deploying.`,
          );
        }
      },
    },
  };
}
