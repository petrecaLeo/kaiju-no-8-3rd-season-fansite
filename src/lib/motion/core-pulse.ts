import { gsap } from './gsap';

export interface CoreParts {
  core: HTMLElement;
  halo: HTMLElement;
  seam: HTMLElement;
}

interface CorePulseOptions {
  reduceMotion: boolean;
  ignite: boolean;
}

interface RestOpacity {
  halo: number;
  seam: number;
}

type Timeline = ReturnType<typeof gsap.timeline>;

const BEAT_SECONDS = 1.3;
const BREATH_SECONDS = 2.6;

function createIgnition({ core, halo, seam }: CoreParts, rest: RestOpacity): Timeline {
  gsap.set(core, { opacity: 0, scale: 0.8 });
  gsap.set([halo, seam], { opacity: 0 });

  return gsap
    .timeline()
    .to(seam, {
      keyframes: [
        { opacity: 0.5, duration: 0.06 },
        { opacity: 0.08, duration: 0.08 },
        { opacity: 0.8, duration: 0.08 },
        { opacity: 0.25, duration: 0.1 },
        { opacity: 1, duration: 0.14 },
        { opacity: rest.seam, duration: 0.7, ease: 'power2.inOut' },
      ],
    })
    .to(core, { opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out' }, 0.3)
    .to(halo, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.3)
    .to(halo, { opacity: rest.halo, duration: 0.8, ease: 'power2.inOut' }, '>');
}

// Only the light behind the eye beats: two pulses ("lub-dub") and a long rest, like a heavy heart.
function createHeartbeat({ halo, seam }: CoreParts, rest: RestOpacity): Timeline {
  const beat = { duration: BEAT_SECONDS, ease: 'none' };

  return gsap
    .timeline({ repeat: -1 })
    .to(
      halo,
      {
        ...beat,
        keyframes: {
          '0%': { opacity: rest.halo, scale: 1 },
          '8%': { opacity: 1, scale: 1.2 },
          '20%': { opacity: rest.halo + 0.1, scale: 1.02 },
          '30%': { opacity: 0.9, scale: 1.12 },
          '65%': { opacity: rest.halo, scale: 1 },
          '100%': { opacity: rest.halo, scale: 1 },
          easeEach: 'sine.inOut',
        },
      },
      0,
    )
    .to(
      seam,
      {
        ...beat,
        keyframes: {
          '0%': { opacity: rest.seam, scale: 1 },
          '9%': { opacity: 1, scale: 1.08 },
          '21%': { opacity: rest.seam + 0.12, scale: 1.01 },
          '31%': { opacity: 0.9, scale: 1.05 },
          '70%': { opacity: rest.seam, scale: 1 },
          '100%': { opacity: rest.seam, scale: 1 },
          easeEach: 'sine.inOut',
        },
      },
      0,
    );
}

function createBreathing({ halo, seam }: CoreParts, rest: RestOpacity): Timeline {
  return gsap
    .timeline({
      repeat: -1,
      yoyo: true,
      defaults: { duration: BREATH_SECONDS, ease: 'sine.inOut' },
    })
    .to(halo, { opacity: rest.halo + 0.2 }, 0)
    .to(seam, { opacity: rest.seam + 0.15 }, 0);
}

function readOpacity(element: HTMLElement): number {
  return Number(getComputedStyle(element).opacity);
}

// The rest opacities come from the CSS, which is also what shows without JS.
export function createCorePulse(parts: CoreParts, { reduceMotion, ignite }: CorePulseOptions) {
  const rest = { halo: readOpacity(parts.halo), seam: readOpacity(parts.seam) };
  const timeline = gsap.timeline({ paused: true });

  if (ignite) timeline.add(createIgnition(parts, rest));
  timeline.add(reduceMotion ? createBreathing(parts, rest) : createHeartbeat(parts, rest));
  return timeline;
}
