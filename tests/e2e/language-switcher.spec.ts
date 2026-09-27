import type { Page } from '@playwright/test';

import { LOCALE_METADATA, LOCALE_STORAGE_KEY } from '../../src/i18n/config';
import { waitForReveal } from '../support/site';
import { expect, test } from '../support/test';

function getSwitcher(page: Page) {
  const menu = page.locator('details[data-language-menu]');
  return { menu, trigger: menu.locator('summary'), links: menu.locator('a[hreflang]') };
}

function readStoredLocale(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), LOCALE_STORAGE_KEY);
}

async function openPage(page: Page, pathname = '/pt-BR/'): Promise<void> {
  await page.goto(pathname);
  await waitForReveal(page);
}

test.describe('language switcher', () => {
  test('names the current language and lists the other two', async ({ page }) => {
    await openPage(page);
    const { menu, trigger, links } = getSwitcher(page);
    const { shortName, nativeName } = LOCALE_METADATA['pt-BR'];

    await expect(trigger).toContainText(shortName);
    await expect(trigger).toHaveAccessibleName(new RegExp(`${shortName}.*${nativeName}`));
    await expect(links.first()).toBeHidden();

    await trigger.click();
    await expect(menu).toHaveAttribute('open', '');
    await expect(links).toHaveCount(2);
    for (const locale of ['en', 'ja'] as const) {
      const link = links.and(page.locator(`[hreflang="${locale}"]`));
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', `/${locale}/`);
      await expect(link).toHaveAttribute('lang', locale);
      await expect(link).toHaveAccessibleName(new RegExp(LOCALE_METADATA[locale].nativeName));
    }
  });

  test('Escape closes the menu and returns focus to it', async ({ page }) => {
    await openPage(page);
    const { menu, trigger, links } = getSwitcher(page);

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('open', '');
    await page.keyboard.press('Tab');
    await expect(links.first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open');
    await expect(trigger).toBeFocused();
  });

  test('closes on a click outside and when focus leaves it', async ({ page }) => {
    await openPage(page);
    const { menu, trigger, links } = getSwitcher(page);

    await trigger.click();
    await expect(menu).toHaveAttribute('open', '');
    await page.mouse.click(10, 400);
    await expect(menu).not.toHaveAttribute('open');

    await trigger.click();
    await expect(menu).toHaveAttribute('open', '');
    await links.last().focus();
    await page.keyboard.press('Tab');
    await expect(menu).not.toHaveAttribute('open');
  });

  test('a manual choice opens the language and is remembered at the root', async ({ page }) => {
    await openPage(page);
    const { trigger, links } = getSwitcher(page);

    await trigger.click();
    await links.and(page.locator('[hreflang="ja"]')).click();
    await page.waitForURL((url) => url.pathname === '/ja/');
    expect(await readStoredLocale(page)).toBe('ja');

    await page.goto('/');
    await page.waitForURL((url) => url.pathname === '/ja/');
  });

  test('a link still works when Safari hands the focus to the header', async ({ page }) => {
    await openPage(page);
    const { trigger, links } = getSwitcher(page);
    // Safari (macOS and iOS) does not focus a clicked link: mousedown focuses the nearest focusable
    // ancestor instead, here the header (tabindex="-1", target of "back to top").
    await page.evaluate(() => {
      document.addEventListener(
        'mousedown',
        (event) => {
          if (!(event.target instanceof Element) || !event.target.closest('a')) return;
          event.preventDefault();
          event.target.closest<HTMLElement>('[tabindex="-1"]')?.focus();
        },
        true,
      );
    });

    await trigger.click();
    await links.and(page.locator('[hreflang="en"]')).click();
    await page.waitForURL((url) => url.pathname === '/en/');
  });

  test('the footer links remember the choice too', async ({ page }) => {
    await openPage(page);
    const footerLink = page.locator('[data-footer-languages] a[hreflang="en"]');
    await expect(page.locator('[data-footer-languages] [aria-current="page"]')).toHaveAttribute(
      'hreflang',
      'pt-BR',
    );

    await footerLink.scrollIntoViewIfNeeded();
    await footerLink.click();
    await page.waitForURL((url) => url.pathname === '/en/');
    expect(await readStoredLocale(page)).toBe('en');
  });

  test('the automatic redirect at the root stores nothing', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL((url) => url.pathname !== '/');
    expect(await readStoredLocale(page)).toBeNull();
  });
});

test.describe('language switcher without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the native disclosure still opens and navigates', async ({ page }) => {
    await page.goto('/en/');
    const { menu, trigger, links } = getSwitcher(page);

    await trigger.click();
    await expect(menu).toHaveAttribute('open', '');
    await links.and(page.locator('[hreflang="pt-BR"]')).click();
    await page.waitForURL((url) => url.pathname === '/pt-BR/');
  });
});
