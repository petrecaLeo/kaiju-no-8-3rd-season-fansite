import { gsap } from '@/lib/motion';
import { ScrollTrigger } from '@/lib/motion/scroll-trigger';

const TRAVEL = 40;
// How far the "left behind" line trails the rest of its beat, in its own line heights.
const LAG = 0.6;
// Share of the reticle size each corner starts away from the figure.
const SPREAD = 0.5;

// Each beat fades in as it rises into view and out as it leaves, so one reads at a time. The title
// arrives with the art, and the last beat scrolls away together with it.
export function revealBeats(beats: readonly HTMLElement[]): void {
  beats.forEach((beat, index) => {
    const text = beat.querySelector<HTMLElement>('[data-beat-text]');
    if (!text) return;

    if (index > 0) {
      gsap.fromTo(
        text,
        { opacity: 0, y: TRAVEL },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: text, start: 'top bottom', end: 'top 72%', scrub: true },
        },
      );
    }

    if (index === beats.length - 1) return;
    gsap.to(beat, {
      opacity: 0,
      y: -TRAVEL,
      ease: 'none',
      scrollTrigger: { trigger: text, start: 'bottom 45%', end: 'bottom 15%', scrub: true },
    });
  });
}

// "Kafka was left behind": the line drifts down while the rest of the beat moves on.
export function lagBehind(line: HTMLElement): void {
  gsap.fromTo(
    line,
    { y: 0 },
    {
      y: () => line.offsetHeight * LAG,
      ease: 'none',
      scrollTrigger: {
        trigger: line,
        start: 'top 85%',
        end: 'top 35%',
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
}

function cornerOffset(corner: HTMLElement, reticle: HTMLElement, axis: 0 | 1): number {
  const sign = Number(corner.dataset.corner?.split(' ')[axis] ?? 0);
  const size = axis === 0 ? reticle.offsetWidth : reticle.offsetHeight;
  return sign * size * SPREAD;
}

// The brackets close in on Kaiju No. 8, blink twice and show the designation plate when the
// codename scrolls in; scrolling back up releases the lock.
export function lockOnWhenVisible(reticle: HTMLElement, trigger: HTMLElement): void {
  const corners = [...reticle.querySelectorAll<HTMLElement>('[data-corner]')];
  const tag = reticle.querySelector('[data-reticle-tag]');

  const timeline = gsap
    .timeline({ paused: true })
    .fromTo(reticle, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' })
    .fromTo(
      corners,
      {
        x: (_index: number, corner: HTMLElement) => cornerOffset(corner, reticle, 0),
        y: (_index: number, corner: HTMLElement) => cornerOffset(corner, reticle, 1),
      },
      { x: 0, y: 0, duration: 0.7, ease: 'expo.out' },
      0,
    )
    .to(corners, { keyframes: { opacity: [1, 0.2, 1, 0.2, 1] }, duration: 0.3, ease: 'none' }, 0.6)
    .fromTo(tag, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.4 }, 0.75);

  ScrollTrigger.create({
    trigger,
    start: 'top 95%',
    onEnter: () => timeline.play(),
    onLeaveBack: () => timeline.reverse(),
  });
}
