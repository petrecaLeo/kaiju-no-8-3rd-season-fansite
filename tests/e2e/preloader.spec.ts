import type { Page } from '@playwright/test';

import { FONT_FILES } from '../../src/config/fonts';
import { ANCHORS } from '../../src/config/anchors';
import { LOCALES, type Locale } from '../../src/i18n/config';
import { readScrollTop, waitForReveal } from '../support/site';
import { expect, test } from '../support/test';

interface PageState {
  overlay: boolean;
  inert: boolean;
  busy: string | null;
}

interface RevealRecord {
  covered?: PageState & { markAnimation: string };
  revealed?: PageState & { loadedFonts: string[]; unreadyImages: string[] };
}

// Snapshots taken inside the page: once the modules have run (the preloader holds the page) and
// the moment the preloader announces the reveal.
async function recordReveal(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const record: RevealRecord = {};
    Object.assign(window, { revealRecord: record });

    const readState = (): PageState => {
      const content = document.querySelector<HTMLElement>('[data-page-content]');
      return {
        overlay: document.querySelector('[data-preloader]') !== null,
        inert: content?.inert ?? false,
        busy: content?.getAttribute('aria-busy') ?? null,
      };
    };

    document.addEventListener('DOMContentLoaded', () => {
      const mark = document.querySelector('.preloader__mark');
      const markAnimation = mark ? getComputedStyle(mark).animationName : 'none';
      record.covered = { ...readState(), markAnimation };
    });
    document.addEventListener('page:revealed', () => {
      const images = document.querySelectorAll<HTMLImageElement>('[data-page-content] img');
      record.revealed = {
        ...readState(),
        loadedFonts: Array.from(document.fonts)
          .filter((face) => face.status === 'loaded')
          .map((face) => `${face.family.replaceAll('"', '')} ${face.weight}`),
        unreadyImages: Array.from(images)
          .filter((image) => image.loading !== 'lazy')
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc),
      };
    });
  });
}

function readRecord(page: Page): Promise<RevealRecord> {
  return page.evaluate(() => (window as unknown as { revealRecord: RevealRecord }).revealRecord);
}

function routeFonts(locale: Locale): string[] {
  return FONT_FILES.filter((font) => font.locales.some((item) => item === locale)).map(
    (font) => `${font.family} ${String(font.weight)}`,
  );
}

for (const locale of LOCALES) {
  test(`/${locale}/ stays covered until its fonts and first-view images are ready`, async ({
    page,
  }) => {
    await recordReveal(page);
    await page.goto(`/${locale}/`);
    await waitForReveal(page);

    const { covered, revealed } = await readRecord(page);
    expect(covered).toMatchObject({ overlay: true, inert: true, busy: 'true' });
    expect(revealed).toMatchObject({ overlay: false, inert: false, busy: null, unreadyImages: [] });
    expect(revealed?.loadedFonts).toEqual(expect.arrayContaining(routeFonts(locale)));
    await expect(page.locator('html')).not.toHaveAttribute('data-fonts', 'fallback');
  });
}

test('the page scrolls and the first Tab reaches the skip link after the reveal', async ({
  page,
}) => {
  await page.goto('/pt-BR/');
  await waitForReveal(page);

  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();

  await page.mouse.wheel(0, 600);
  await expect.poll(() => readScrollTop(page)).toBeGreaterThan(0);
});

test('a URL fragment keeps its target after the reveal', async ({ page }) => {
  await page.goto(`/pt-BR/#${ANCHORS.whereToWatch}`);
  await waitForReveal(page);

  await expect.poll(() => readScrollTop(page)).toBeGreaterThan(0);
  await expect(page.locator(`#${ANCHORS.whereToWatch}`)).toBeInViewport();
});

test('a font that never arrives releases the page on the timeout with the fallbacks locked', async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname.includes('paladins'),
    () => undefined,
  );
  const started = Date.now();
  await page.goto('/pt-BR/', { waitUntil: 'commit' });
  await waitForReveal(page);

  expect(Date.now() - started).toBeGreaterThan(6000);
  await expect(page.locator('html')).toHaveAttribute('data-fonts', 'fallback');
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the mark does not breathe and the page still opens', async ({ page }) => {
    await recordReveal(page);
    await page.goto('/pt-BR/');
    await waitForReveal(page);

    const { covered } = await readRecord(page);
    expect(covered).toMatchObject({ overlay: true, markAnimation: 'none' });
  });
});

test.describe('when the scripts never load', () => {
  test('the CSS failsafe uncovers the page and unlocks scrolling', async ({ page }) => {
    await page.route(
      (url) => url.pathname.startsWith('/_astro/') && url.pathname.endsWith('.js'),
      (route) => route.abort(),
    );
    await page.goto('/pt-BR/');

    const preloader = page.locator('[data-preloader]');
    await expect(preloader).toBeVisible();
    await expect(preloader).toBeHidden({ timeout: 10_000 });
    await page.mouse.wheel(0, 600);
    await expect.poll(() => readScrollTop(page)).toBeGreaterThan(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('there is no overlay and the page scrolls right away', async ({ page }) => {
    await page.goto('/pt-BR/');

    await expect(page.locator('[data-preloader]')).toBeHidden();
    await expect(page.locator(`#${ANCHORS.synopsis} h2`).first()).toBeVisible();
    await page.mouse.wheel(0, 600);
    await expect.poll(() => readScrollTop(page)).toBeGreaterThan(0);
  });
});
