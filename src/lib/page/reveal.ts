export const PRELOADER_SELECTOR = '[data-preloader]';

const REVEALED_EVENT = 'page:revealed';
const REVEALED_STATE = 'revealed';

function isRevealed(): boolean {
  return (
    document.documentElement.dataset.pageState === REVEALED_STATE ||
    document.querySelector(PRELOADER_SELECTOR) === null
  );
}

// True while the loader overlay hides the page, so an intro prepared now stays unseen until the
// reveal. False once the CSS failsafe has hidden the overlay (the script arrived late): the page
// is already on screen and an intro would flash.
export function isPageCovered(): boolean {
  const preloader = document.querySelector<HTMLElement>(PRELOADER_SELECTOR);
  if (!preloader || isRevealed()) return false;

  const { display, visibility } = getComputedStyle(preloader);
  return display !== 'none' && visibility !== 'hidden';
}

// Called by the preloader after its exit animation has finished and the overlay is gone. CSS can
// wait for it with :root[data-page-state='revealed'].
export function markPageRevealed(): void {
  document.documentElement.dataset.pageState = REVEALED_STATE;
  document.dispatchEvent(new Event(REVEALED_EVENT));
}

// Resolves once the loader has left the screen, or right away on a page without one.
export function whenPageRevealed(): Promise<void> {
  if (isRevealed()) return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener(
      REVEALED_EVENT,
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

export function onPageRevealed(callback: () => void): void {
  void whenPageRevealed().then(callback);
}
