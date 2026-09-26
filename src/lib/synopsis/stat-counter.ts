import { createOdometer, type Odometer } from '@/lib/motion';
import { ScrollTrigger } from '@/lib/motion/scroll-trigger';

// The reels are built just before the figure scrolls into view (so a renderer that never scrolls
// only sees the final values) and roll from the same line as the readouts in the recap.
const BUILD_START = 'top bottom';
const ROLL_START = 'top 88%';

// Rolls each figure up from zeros the first time it scrolls into view. The reels only move with
// transforms and the final value stays in the HTML (the figures are aria-hidden; a visually hidden
// sentence carries the value). Returns a function that removes the reels, for reduced motion.
export function rollWhenVisible(values: Iterable<HTMLElement>): () => void {
  const odometers: Odometer[] = [];

  for (const value of values) {
    let odometer: Odometer | null = null;
    const build = (): Odometer | null => {
      if (odometer) return odometer;
      odometer = createOdometer(value);
      if (odometer) odometers.push(odometer);
      return odometer;
    };

    ScrollTrigger.create({ trigger: value, start: BUILD_START, once: true, onEnter: build });
    ScrollTrigger.create({
      trigger: value,
      start: ROLL_START,
      once: true,
      onEnter: () => {
        build()?.timeline.play();
      },
    });
  }

  return () => {
    for (const odometer of odometers) odometer.restore();
  };
}
