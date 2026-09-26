import { type BrowserContext, expect, type Page } from '@playwright/test';

const REVEAL_TIMEOUT_MS = 12_000;
const SCROLL_PAUSE_MS = 120;

// 1×1 transparent PNG, so the stubbed trailer thumbnail still decodes.
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

// Stand-ins for the third parties the pages load: the trailer thumbnail and player, and the
// Cloudflare Web Analytics beacon that the edge injects into the deployed pages.
const STUBS: Record<string, { status?: number; contentType?: string; body?: string | Buffer }> = {
  'https://i.ytimg.com': { contentType: 'image/png', body: PIXEL },
  'https://www.youtube-nocookie.com': { contentType: 'text/html', body: '<!doctype html>' },
  'https://static.cloudflareinsights.com': { contentType: 'text/javascript', body: '' },
  'https://cloudflareinsights.com': { status: 204 },
};

// Nothing leaves the site under test: known third parties answer with stubs, anything else is
// aborted. The CSP is enforced before a request is routed, so a blocked source still shows up as
// a violation.
export async function isolateFromNetwork(context: BrowserContext, baseURL: string): Promise<void> {
  const { origin } = new URL(baseURL);
  await context.route(
    (url) => url.origin !== origin,
    async (route) => {
      const stub = STUBS[new URL(route.request().url()).origin];
      await (stub === undefined ? route.abort('blockedbyclient') : route.fulfill(stub));
    },
  );
}

// Console errors (CSP violations included) and uncaught exceptions, across navigations.
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  return errors;
}

export async function waitForReveal(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-page-state', 'revealed', {
    timeout: REVEAL_TIMEOUT_MS,
  });
}

// Walks the page one viewport at a time, so lazy images, scroll-triggered animations and the
// odometers all run. Smooth scrolling is on in base.css, hence the instant jumps.
export async function scrollThroughPage(page: Page): Promise<void> {
  const step = page.viewportSize()?.height ?? 720;
  for (let top = 0; ; top += step) {
    const bottom = await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
      return document.documentElement.scrollHeight - window.innerHeight;
    }, top);
    await page.waitForTimeout(SCROLL_PAUSE_MS);
    if (top >= bottom) return;
  }
}

export function readScrollTop(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}
