import '@/lib/motion/scroll-trigger';

import { gsap, withMotionPreference } from '@/lib/motion';

const SECTION_SELECTOR = '[data-where-to-watch]';
const CONTENT_SELECTOR = '[data-where-to-watch-content]';

// opacity rather than autoAlpha, so the link stays reachable by keyboard before it fades in.
const ENTRANCE = { opacity: 0, duration: 0.8, ease: 'power1.out', start: 'top 70%' } as const;

function fadeInOnEnter(section: HTMLElement): void {
  const content = section.querySelector<HTMLElement>(CONTENT_SELECTOR);
  if (!content) return;

  const { start, ...from } = ENTRANCE;
  withMotionPreference(({ reduceMotion }) => {
    if (reduceMotion) return;
    gsap.from(content, { ...from, scrollTrigger: { trigger: section, start } });
  }, section);
}

for (const section of document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)) {
  fadeInOnEnter(section);
}
