import { loadPageFonts } from '@/lib/dom/fonts';
import { settleImages } from '@/lib/dom/images';

// Lazy images only load near the viewport, so waiting for them would hold the loader forever;
// the trailer is a facade whose iframe loads on click, so it has nothing to wait for either.
const EAGER_IMAGE_SELECTOR = "img:not([loading='lazy' i])";

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
}
