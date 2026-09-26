import { gsap } from './gsap';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const FULL_MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

export interface MotionConditions {
  reduceMotion: boolean;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function withMotionPreference(
  setup: (conditions: MotionConditions) => unknown,
  scope?: Element,
): ReturnType<typeof gsap.matchMedia> {
  const matchMedia = gsap.matchMedia(scope);
  matchMedia.add({ reduceMotion: REDUCED_MOTION_QUERY, fullMotion: FULL_MOTION_QUERY }, (context) =>
    setup({ reduceMotion: context.conditions?.reduceMotion === true }),
  );
  return matchMedia;
}
