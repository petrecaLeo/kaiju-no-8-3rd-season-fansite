import { expect, test } from '../support/test';

// Cloudflare Pages serves the closest 404.html going up from the requested folder. URLs are
// case-sensitive, so /PT-BR/ is not the Portuguese folder.
const CASES = [
  { pathname: '/pt-BR/teste', locale: 'pt-BR' },
  { pathname: '/pt-BR/a/b/', locale: 'pt-BR' },
  { pathname: '/ja/teste', locale: 'ja' },
  { pathname: '/en/teste', locale: 'en' },
  { pathname: '/nada', locale: 'en' },
  { pathname: '/PT-BR/teste', locale: 'en' },
];

for (const { pathname, locale } of CASES) {
  test(`${pathname} answers 404 with the ${locale} page`, async ({ page }) => {
    const response = await page.goto(pathname);

    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('.not-found__link')).toHaveAttribute('href', `/${locale}/`);
    await expect(page.locator('.not-found__image')).toHaveJSProperty('complete', true);
  });
}

test('a locale URL without the trailing slash redirects to it', async ({ page }) => {
  const response = await page.goto('/ja');

  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/ja/');
});
