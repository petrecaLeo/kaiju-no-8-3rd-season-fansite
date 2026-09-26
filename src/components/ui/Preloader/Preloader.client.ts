import { hasPendingPageFonts, lockFallbackFonts } from '@/lib/dom/fonts';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { waitForFirstView } from '@/lib/page/first-view';
import { moveFocusToPageStart } from '@/lib/page/focus';
import { markPageRevealed, PRELOADER_SELECTOR } from '@/lib/page/reveal';

const SAFETY_TIMEOUT_MS = 8000;
const QUICK_EXIT_BEFORE_MS = 600;
const QUICK_EXIT_DURATION = 0.25;
const EXIT_DURATION = 0.5;
const FAILSAFE_ANIMATION = 'preloader-failsafe';
const PAGE_CONTENT_SELECTOR = '[data-page-content]';

function isShown(element: HTMLElement): boolean {
  const { display, visibility } = getComputedStyle(element);
  return display !== 'none' && visibility !== 'hidden';
}

function setBusy(content: HTMLElement, busy: boolean): void {
  content.inert = busy;
  content.ariaBusy = busy ? 'true' : null;
}

async function waitForAssets(content: ParentNode): Promise<void> {
  try {
    await waitForFirstView(content);
  } catch {
    // A failed asset must not keep the page covered.
  }
}

// Counted from navigation start, before the CSS failsafe (counted from first paint), and early
// enough for the exit fade to finish by then: the failsafe would otherwise cut the fade short.
function waitForTimeout(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      Math.max(0, SAFETY_TIMEOUT_MS - EXIT_DURATION * 1000 - performance.now()),
    );
  });
}

function waitForCssFailsafe(preloader: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    preloader.addEventListener('animationend', (event) => {
      if (event.animationName === FAILSAFE_ANIMATION) resolve();
    });
  });
}

// `held` is the content this script kept inert. Without it the page was never held (no overlay,
// or the CSS failsafe already let it go), and the visitor may be using it, so focus stays put.
function release(preloader: HTMLElement, held: HTMLElement | null): void {
  preloader.remove();
  if (held) {
    setBusy(held, false);
    moveFocusToPageStart();
  }
  markPageRevealed();
}

// markPageRevealed() runs only once the fade has finished and the overlay is gone, so the hero's
// intro (which waits for it) never overlaps the exit.
function reveal(preloader: HTMLElement, content: HTMLElement | null): void {
  const onComplete = (): void => {
    release(preloader, content);
  };

  if (!isShown(preloader) || prefersReducedMotion()) {
    onComplete();
    return;
  }

  const duration = performance.now() < QUICK_EXIT_BEFORE_MS ? QUICK_EXIT_DURATION : EXIT_DURATION;
  gsap.to(preloader, { autoAlpha: 0, duration, ease: 'power1.out', onComplete });
}

async function initPreloader(): Promise<void> {
  const preloader = document.querySelector<HTMLElement>(PRELOADER_SELECTOR);
  if (!preloader) return;

  if (!isShown(preloader)) {
    release(preloader, null);
    return;
  }

  const content = document.querySelector<HTMLElement>(PAGE_CONTENT_SELECTOR);
  if (content) setBusy(content, true);

  await Promise.race([
    waitForAssets(content ?? document),
    waitForTimeout(),
    waitForCssFailsafe(preloader),
  ]);

  if (hasPendingPageFonts()) lockFallbackFonts();
  reveal(preloader, content);
}

void initPreloader();
