import { LOCALES } from '../../src/i18n/config';
import { collectPageErrors, scrollThroughPage, waitForReveal } from '../support/site';
import { expect, test } from '../support/test';

// Sources each directive must list; script-src also carries the hashes of the inline code.
const CSP_SOURCES = {
  'default-src': ["'none'"],
  'script-src': ["'self'", 'https://static.cloudflareinsights.com'],
  'style-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'https://i.ytimg.com'],
  'frame-src': ['https://www.youtube-nocookie.com'],
  'connect-src': ["'self'", 'https://cloudflareinsights.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'none'"],
  'form-action': ["'none'"],
  'object-src': ["'none'"],
};

function parseCsp(header: string): Map<string, string[]> {
  return new Map(
    header
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .map(([name = '', ...sources]) => [name, sources]),
  );
}

const SECURITY_HEADERS = {
  'strict-transport-security': /max-age=\d{7,}/,
  'x-content-type-options': /^nosniff$/,
  'x-frame-options': /^DENY$/,
  'referrer-policy': /^strict-origin-when-cross-origin$/,
  'cross-origin-opener-policy': /^same-origin$/,
  'permissions-policy': /camera=\(\).*microphone=\(\).*geolocation=\(\)/,
};

const HTML_CACHE = 'public, max-age=0, must-revalidate';
// Cloudflare Pages answers its 404 pages with no-store; the local server applies _headers as is.
const NOT_FOUND_CACHE = /^(no-store|public, max-age=0, must-revalidate)$/;
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';
const DAILY_CACHE = 'public, max-age=86400';

const DOCUMENTS = [
  { pathname: '/', cache: HTML_CACHE },
  ...LOCALES.map((locale) => ({ pathname: `/${locale}/`, cache: HTML_CACHE })),
  { pathname: '/pt-BR/nao-existe', cache: NOT_FOUND_CACHE },
];

test.describe('response headers', () => {
  for (const { pathname, cache } of DOCUMENTS) {
    test(`${pathname} carries the CSP and the security headers`, async ({ request }) => {
      const response = await request.get(pathname);
      const headers = response.headers();
      const csp = headers['content-security-policy'] ?? '';
      const directives = parseCsp(csp);

      for (const [name, sources] of Object.entries(CSP_SOURCES)) {
        expect(directives.get(name), name).toEqual(expect.arrayContaining(sources));
      }
      expect(csp).not.toContain('unsafe-inline');
      expect(csp).not.toContain('unsafe-eval');
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        expect(headers[name], name).toMatch(value);
      }
      expect(headers['cache-control']).toMatch(cache);
    });
  }

  test('hashed assets are immutable and the fixed-name files last a day', async ({ request }) => {
    const html = await (await request.get('/pt-BR/')).text();
    const asset = /\/_astro\/[^"'\s)]+\.js/.exec(html)?.[0];
    expect(asset, 'a bundled script in the page').toBeDefined();

    const assetResponse = await request.get(asset ?? '');
    expect(assetResponse.headers()['cache-control']).toBe(IMMUTABLE_CACHE);
    for (const pathname of ['/favicon.ico', '/site.webmanifest', '/og/pt-BR.jpg']) {
      const response = await request.get(pathname);
      expect(response.status(), pathname).toBe(200);
      expect(response.headers()['cache-control'], pathname).toBe(DAILY_CACHE);
    }
  });
});

test.describe('Content-Security-Policy in the browser', () => {
  for (const locale of LOCALES) {
    test(`/${locale}/ runs end to end without a violation or error`, async ({ page }) => {
      test.slow();
      const errors = collectPageErrors(page);
      await page.goto(`/${locale}/`);
      await waitForReveal(page);

      const reveal = page.locator('[data-recap-reveal]');
      await reveal.scrollIntoViewIfNeeded();
      await reveal.click();
      await expect(page.locator('[data-recap-state="revealed"]')).toBeAttached();

      await scrollThroughPage(page);

      const play = page.locator('[data-youtube-facade-play]');
      await play.scrollIntoViewIfNeeded();
      await play.click();
      await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/"]')).toBeAttached();
      await page.waitForTimeout(500);

      expect(errors).toEqual([]);
    });
  }

  test('the root redirect and the 404 page run without a violation', async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto('/');
    await page.waitForURL((url) => url.pathname !== '/');
    await page.goto('/ja/nao-existe');
    await expect(page.locator('h1')).toContainText('404');

    expect(errors.filter((error) => !error.includes('status of 404'))).toEqual([]);
  });
});
