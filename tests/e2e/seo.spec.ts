import { LOCALE_METADATA, LOCALES } from '../../src/i18n/config';
import { expect, test } from '../support/test';

// The footer credits, which the JSON-LD names as the site's authors: fans, never rights holders.
const AUTHORS = [
  { '@type': 'Person', name: 'byduuds.design', url: 'https://www.instagram.com/byduuds.design' },
  { '@type': 'Person', name: 'petrecaLeo', url: 'https://github.com/petrecaLeo' },
];

for (const locale of LOCALES) {
  test(`/${locale}/ describes itself as a fan site in every language`, async ({
    page,
    request,
  }) => {
    await page.goto(`/${locale}/`);
    const head = page.locator('head');

    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`^https://[^/]+/${locale}/$`),
    );
    const alternates = head.locator('link[rel="alternate"][hreflang]');
    await expect(alternates).toHaveCount(LOCALES.length + 1);
    await expect(head.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      /^https:\/\/[^/]+\/$/,
    );
    await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute(
      'content',
      LOCALE_METADATA[locale].openGraphLocale,
    );

    const image = await head.locator('meta[property="og:image"]').getAttribute('content');
    const imageResponse = await request.get(new URL(image ?? '').pathname);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()['content-type']).toBe('image/jpeg');

    const jsonLd = await head.locator('script[type="application/ld+json"]').textContent();
    const website: unknown = JSON.parse(jsonLd ?? '');
    expect(website).toMatchObject({
      '@type': 'WebSite',
      inLanguage: locale,
      author: AUTHORS,
      about: { '@type': 'TVSeries' },
    });
    expect(website).not.toHaveProperty('publisher');
    expect(website).not.toHaveProperty('sameAs');
  });
}

test('the footer credits link to the same profiles', async ({ page }) => {
  await page.goto('/en/');

  for (const { name, url } of AUTHORS) {
    const link = page.locator('.footer-credits__link', { hasText: name });
    await expect(link).toHaveAttribute('href', url);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

test('robots.txt points to the sitemap, which lists the three languages', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  const sitemapUrl = /^Sitemap: (\S+)$/m.exec(robots)?.[1];
  expect(sitemapUrl).toMatch(/\/sitemap-index\.xml$/);

  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  for (const locale of LOCALES) expect(sitemap).toContain(`/${locale}/</loc>`);
  expect(sitemap).not.toContain('404');
});
