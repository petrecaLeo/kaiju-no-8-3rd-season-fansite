import '@/lib/motion/scroll-trigger';

import { gsap, withMotionPreference } from '@/lib/motion';

const SIGNOFF_SELECTOR = '[data-footer-signoff]';

interface SignoffParts {
  core: HTMLElement;
  halo: HTMLElement;
  line: HTMLElement;
  tag: HTMLElement;
}

const START = 'top 85%';
const BEATS = 2;

// The hero's ignition flicker, then two "lub-dub" beats: under 5 s in total, and it never loops.
const IGNITION = [
  { opacity: 0.6, duration: 0.06 },
  { opacity: 0.1, duration: 0.08 },
  { opacity: 0.9, duration: 0.08 },
  { opacity: 0.3, duration: 0.1 },
  { opacity: 1, duration: 0.14 },
];

const LOCK_BLINK = [
  { opacity: 1, duration: 0.06 },
  { opacity: 0.2, duration: 0.08 },
  { opacity: 1, duration: 0.1 },
];

function heartbeat(rest: number) {
  return {
    duration: 1.3,
    ease: 'none',
    repeat: BEATS - 1,
    keyframes: {
      '0%': { opacity: rest, scale: 1 },
      '8%': { opacity: 1, scale: 1.25 },
      '20%': { opacity: rest + 0.1, scale: 1.03 },
      '30%': { opacity: 0.85, scale: 1.15 },
      '65%': { opacity: rest, scale: 1 },
      '100%': { opacity: rest, scale: 1 },
      easeEach: 'sine.inOut',
    },
  };
}

function findParts(root: HTMLElement): SignoffParts | undefined {
  const core = root.querySelector<HTMLElement>('[data-signoff-core]');
  const halo = root.querySelector<HTMLElement>('[data-signoff-halo]');
  const line = root.querySelector<HTMLElement>('[data-signoff-line]');
  const tag = root.querySelector<HTMLElement>('[data-signoff-tag]');
  if (!core || !halo || !line || !tag) return undefined;
  return { core, halo, line, tag };
}

function playOnEnter(root: HTMLElement, { core, halo, line, tag }: SignoffParts): void {
  const restHalo = Number(getComputedStyle(halo).opacity);

  gsap.set([core, halo, tag], { opacity: 0 });
  gsap.set(line, { scaleX: 0 });

  gsap
    .timeline({ scrollTrigger: { trigger: root, start: START, once: true } })
    .to(core, { keyframes: IGNITION })
    .to(halo, { opacity: restHalo, duration: 0.3, ease: 'power2.out' }, '<0.2')
    .to(line, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '<')
    .to(tag, { keyframes: LOCK_BLINK }, '>-0.05')
    .to(halo, heartbeat(restHalo), '>0.1');
}

for (const root of document.querySelectorAll<HTMLElement>(SIGNOFF_SELECTOR)) {
  const parts = findParts(root);
  if (!parts) continue;

  withMotionPreference(({ reduceMotion }) => {
    if (!reduceMotion) playOnEnter(root, parts);
  }, root);
}
