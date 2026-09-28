import { loadPageFonts } from '@/lib/dom/fonts';
import { settleImages } from '@/lib/dom/images';

// Lazy images only load near the viewport, so waiting for all of them would hold the loader
// forever; the trailer is a facade whose iframe loads on click, so it has nothing to wait for.
const EAGER_IMAGE_SELECTOR = "img:not([loading='lazy' i])";
const LAZY_IMAGE_SELECTOR = "img[loading='lazy' i]";

// A reload can restore the scroll far down the page, where the first view is made of lazy
// images (the character photo, for one). They are read once the rest has settled, when the
// restored position is known; being on screen, they are already downloading. The observer
// counts clipping too: a card scrolled out of the roster never loads, so it must not be waited
// for. Its first callback reports every target.
function lazyImagesOnScreen(content: ParentNode): Promise<HTMLImageElement[]> {
  const images = content.querySelectorAll<HTMLImageElement>(LAZY_IMAGE_SELECTOR);
  if (images.length === 0) return Promise.resolve([]);

  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      observer.disconnect();
      resolve(
        entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
          .filter((target) => target instanceof HTMLImageElement),
      );
    });
    for (const image of images) observer.observe(image);
  });
}

function hasFiredDomContentLoaded(): boolean {
  const [navigation] = performance.getEntriesByType('navigation');
  return (
    navigation instanceof PerformanceNavigationTiming && navigation.domContentLoadedEventStart > 0
  );
}

// DOMContentLoaded fires only after every module script of the page has run, so the sections
// have registered their intro animations before the reveal. readyState is already
// "interactive" while module scripts run, so it cannot tell whether the event has fired.
function whenDomContentLoaded(): Promise<void> {
  if (hasFiredDomContentLoaded()) return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

export async function waitForFirstView(content: ParentNode): Promise<void> {
  const images = content.querySelectorAll<HTMLImageElement>(EAGER_IMAGE_SELECTOR);
  await Promise.all([whenDomContentLoaded(), settleImages(images), loadPageFonts()]);
  await settleImages(await lazyImagesOnScreen(content));
}
