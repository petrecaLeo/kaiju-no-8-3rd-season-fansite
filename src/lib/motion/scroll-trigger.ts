import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { onPageRevealed } from '@/lib/page/reveal';

import { gsap } from './gsap';

gsap.registerPlugin(ScrollTrigger);

let scrollBeforeRefresh = 0;

// A matchMedia change (e.g. toggling reduced motion) that kills or creates triggers makes
// ScrollTrigger drop its recorded scroll position and leave the page at the top; restore it.
ScrollTrigger.addEventListener('refreshInit', () => {
  scrollBeforeRefresh = window.scrollY;
});

ScrollTrigger.addEventListener('matchMedia', () => {
  if (window.scrollY === scrollBeforeRefresh) return;
  window.scrollTo({ top: scrollBeforeRefresh, behavior: 'instant' });
  ScrollTrigger.update();
});

onPageRevealed(() => {
  ScrollTrigger.refresh();
});

export { ScrollTrigger };
