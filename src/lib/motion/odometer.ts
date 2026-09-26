import { gsap } from './gsap';

const DIGITS = '0123456789';
// Each reel runs through the digits once before stopping on its own, like an instrument dial.
const TURNS = 2;
const ROLL_SECONDS = 1.3;
const STAGGER_SECONDS = 0.18;

export interface Odometer {
  timeline: gsap.core.Timeline;
  restore: () => void;
}

function createReel(digit: number): { reel: HTMLSpanElement; strip: HTMLSpanElement } {
  const reel = document.createElement('span');
  reel.className = 'odometer__reel';

  // An invisible copy of the final digit gives the reel that digit's exact width and height.
  const sizer = document.createElement('span');
  sizer.className = 'odometer__sizer';
  sizer.textContent = String(digit);

  const strip = document.createElement('span');
  strip.className = 'odometer__strip';
  strip.textContent = DIGITS.repeat(TURNS).split('').join('\n');

  reel.append(sizer, strip);
  return { reel, strip };
}

// Lays rolling digit reels over the element's own text, which stays in the DOM (transparent while
// the reels are on top), so screen readers and crawlers only ever see the final value. The reels
// move with transforms only. Returns null when the text has no digits.
export function createOdometer(value: HTMLElement): Odometer | null {
  const text = value.textContent.trim();
  if (!/\d/.test(text)) return null;

  const overlay = document.createElement('span');
  overlay.className = 'odometer';
  overlay.setAttribute('aria-hidden', 'true');

  const restore = (): void => {
    overlay.remove();
    delete value.dataset.odometer;
  };
  const timeline = gsap.timeline({ paused: true, onComplete: restore });
  const lines = DIGITS.length * TURNS;
  let reelIndex = 0;

  for (const char of text) {
    if (!DIGITS.includes(char)) {
      overlay.append(char);
      continue;
    }
    const digit = Number(char);
    const { reel, strip } = createReel(digit);
    overlay.append(reel);
    const stop = DIGITS.length * (TURNS - 1) + digit;
    timeline.fromTo(
      strip,
      { yPercent: 0 },
      {
        yPercent: (-100 * stop) / lines,
        duration: ROLL_SECONDS + reelIndex * STAGGER_SECONDS,
        ease: 'power3.out',
      },
      0,
    );
    reelIndex += 1;
  }

  value.dataset.odometer = '';
  value.append(overlay);
  return { timeline, restore };
}
