import { prefersReducedMotion } from '@/lib/motion';

const ROSTER_SELECTOR = '[data-roster]';
const LIST_SELECTOR = '[data-roster-list]';
const STEP_SELECTOR = '[data-roster-step]';
const VISIBLE_CARD_SELECTOR = '[data-character-card]:not([hidden])';

// Sub-pixel scroll positions never reach the exact ends on some zoom levels.
const EDGE_TOLERANCE = 2;

function isDisabled(button: HTMLElement): boolean {
  return button.getAttribute('aria-disabled') === 'true';
}

function stepSize(list: HTMLElement): number {
  const card = list.querySelector<HTMLElement>(VISIBLE_CARD_SELECTOR);
  const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
  return (card?.offsetWidth ?? list.clientWidth) + gap;
}

function initRoster(roster: HTMLElement): void {
  const list = roster.querySelector<HTMLElement>(LIST_SELECTOR);
  if (!list) return;
  const steps = roster.querySelectorAll<HTMLButtonElement>(STEP_SELECTOR);
  let frame = 0;

  const updateEdges = (): void => {
    frame = 0;
    const atStart = list.scrollLeft <= EDGE_TOLERANCE;
    const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - EDGE_TOLERANCE;
    roster.toggleAttribute('data-at-start', atStart);
    roster.toggleAttribute('data-at-end', atEnd);

    for (const button of steps) {
      const blocked = Number(button.dataset.rosterStep) < 0 ? atStart : atEnd;
      button.setAttribute('aria-disabled', String(blocked));
    }

    // A blocked button is hidden; hand its focus to the one that still has somewhere to go.
    const focused = Array.from(steps).find((button) => button === document.activeElement);
    if (focused && isDisabled(focused)) {
      Array.from(steps)
        .find((button) => !isDisabled(button))
        ?.focus({ preventScroll: true });
    }
  };

  const scheduleUpdate = (): void => {
    if (frame === 0) frame = requestAnimationFrame(updateEdges);
  };

  for (const button of steps) {
    button.addEventListener('click', () => {
      if (isDisabled(button)) return;
      list.scrollBy({
        left: Number(button.dataset.rosterStep) * stepSize(list),
        behavior: prefersReducedMotion() ? 'instant' : 'smooth',
      });
    });
  }

  list.addEventListener('scroll', scheduleUpdate, { passive: true });
  new ResizeObserver(scheduleUpdate).observe(list);
  updateEdges();
}

for (const roster of document.querySelectorAll<HTMLElement>(ROSTER_SELECTOR)) {
  initRoster(roster);
}
