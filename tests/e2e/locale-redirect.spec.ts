import type { Page } from '@playwright/test';

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, LOCALES } from '../../src/i18n/config';
import { expect, test } from '../support/test';

async function preferLanguages(page: Page, languages: string[]): Promise<void> {
  await page.addInitScript((list) => {
    Object.defineProperty(Navigator.prototype, 'languages', { get: () => list });
    Object.defineProperty(Navigator.prototype, 'language', { get: () => list[0] });
  }, languages);
}

async function storeLocale(page: Page, value: string): Promise<void> {
  await page.addInitScript(
    ([key, locale]) => {
      localStorage.setItem(key, locale);
    },
    [LOCALE_STORAGE_KEY, value] as const,
  );
}

async function expectPath(page: Page, pathname: string): Promise<void> {
  await page.waitForURL((url) => url.pathname === pathname);
  expect(new URL(page.url()).pathname).toBe(pathname);
}

const BROWSER_CASES = [
  { languages: ['pt-BR'], locale: 'pt-BR' },
  { languages: ['en-US'], locale: 'en' },
  { languages: ['ja-JP'], locale: 'ja' },
  { languages: ['pt-PT'], locale: 'pt-BR' },
  { languages: ['en-GB', 'pt-BR'], locale: 'en' },
  { languages: ['de-DE', 'ja'], locale: 'ja' },
  { languages: ['fr-FR', 'es'], locale: DEFAULT_LOCALE },
];

test.describe('root redirect', () => {
  for (const { languages, locale } of BROWSER_CASES) {
    test(`browser languages [${languages.join(', ')}] open /${locale}/`, async ({ page }) => {
      await preferLanguages(page, languages);
      await page.goto('/');
      await expectPath(page, `/${locale}/`);
    });
  }

  test('a saved choice wins over the browser languages', async ({ page }) => {
    await preferLanguages(page, ['en-US']);
    await storeLocale(page, 'ja');
    await page.goto('/');
    await expectPath(page, '/ja/');
  });

  test('an unknown saved value is ignored', async ({ page }) => {
    await preferLanguages(page, ['en-US']);
    await storeLocale(page, 'xx');
    await page.goto('/');
    await expectPath(page, '/en/');
  });

  test('keeps the query string and the fragment', async ({ page }) => {
    await preferLanguages(page, ['en-US']);
    await page.goto('/?utm_source=test#trailer');
    await expectPath(page, '/en/');
    const url = new URL(page.url());
    expect(url.search).toBe('?utm_source=test');
    expect(url.hash).toBe('#trailer');
  });

  test('shows the language links when the redirect script does not run', async ({ page }) => {
    await page.route(
      (url) => url.pathname === '/',
      async (route) => {
        const response = await route.fetch();
        const body = (await response.text()).replace(/<script>[\s\S]*?<\/script>/, '');
        await route.fulfill({ response, body });
      },
    );
    await page.goto('/');

    const links = page.locator('.language-fallback a[hreflang]');
    await expect(links).toHaveCount(LOCALES.length);
    for (const locale of LOCALES) {
      await expect(links.and(page.locator(`[hreflang="${locale}"]`))).toBeVisible();
      await expect(links.and(page.locator(`[hreflang="${locale}"]`))).toHaveAttribute(
        'href',
        `/${locale}/`,
      );
    }
    expect(new URL(page.url()).pathname).toBe('/');
  });
});

test.describe('root redirect without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the meta refresh opens the default locale', async ({ page }) => {
    await page.goto('/');
    await expectPath(page, `/${DEFAULT_LOCALE}/`);
  });
});
