import '@/lib/motion/scroll-trigger';

import { gsap, REDUCED_MOTION_QUERY } from '@/lib/motion';

const SECTION_SELECTOR = '[data-trailer]';
const FRAME_SELECTOR = '[data-trailer-frame]';
const THEATER_LAYOUT = 'theater';
const PROGRESS_PROPERTY = '--trailer-progress';

// Wide screens pin the section and grow the video with the scroll; narrow ones only fade it in.
const CONDITIONS = {
  wide: '(width >= 64em)',
  narrow: '(width < 64em)',
  reduceMotion: REDUCED_MOTION_QUERY,
};

// Pinned scroll distances, in viewport heights: the video grows over the first and rests at full
// size over the second, before the section scrolls away.
const GROW_DISTANCE = 1;
const HOLD_DISTANCE = 0.2;

const ENTRANCE = { opacity: 0, scale: 0.94, duration: 0.8, start: 'top 85%' } as const;

function growWhilePinned(section: HTMLElement, frame: HTMLElement): void {
  const pinDistance = (GROW_DISTANCE + HOLD_DISTANCE) * 100;

  gsap
    .timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${String(pinDistance)}%`,
        pin: true,
        scrub: true,
      },
    })
    .fromTo(
      frame,
      { [PROGRESS_PROPERTY]: 0 },
      { [PROGRESS_PROPERTY]: 1, duration: GROW_DISTANCE, ease: 'power1.inOut' },
    )
    .to({}, { duration: HOLD_DISTANCE });
}

function fadeInOnEnter(frame: HTMLElement): void {
  const { start, ...from } = ENTRANCE;
  gsap.from(frame, { ...from, scrollTrigger: { trigger: frame, start } });
}

function initTrailer(section: HTMLElement): void {
  const frame = section.querySelector<HTMLElement>(FRAME_SELECTOR);
  if (!frame) return;

  gsap.matchMedia(section).add(CONDITIONS, (context) => {
    const { wide = false, reduceMotion = false } = context.conditions ?? {};
    if (wide) section.dataset.layout = THEATER_LAYOUT;

    if (!reduceMotion) {
      if (wide) growWhilePinned(section, frame);
      else fadeInOnEnter(frame);
    }

    return () => {
      delete section.dataset.layout;
    };
  });
}

for (const section of document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)) {
  initTrailer(section);
}
