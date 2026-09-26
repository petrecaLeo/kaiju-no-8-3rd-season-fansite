const CUE_SELECTOR = '[data-scroll-cue]';

// Any scroll past elastic overscroll counts as "started scrolling".
const AWAY_AFTER_PX = 16;

function followScroll(cue: HTMLElement): void {
  let frame = 0;

  const update = (): void => {
    frame = 0;
    cue.toggleAttribute('data-away', window.scrollY > AWAY_AFTER_PX);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

for (const cue of document.querySelectorAll<HTMLElement>(CUE_SELECTOR)) {
  followScroll(cue);
}
