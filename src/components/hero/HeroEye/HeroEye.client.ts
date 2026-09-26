import {
  type CoreParts,
  createCorePulse,
  FINE_POINTER_QUERY,
  FULL_MOTION_QUERY,
  followPointer,
  gsap,
  withMotionPreference,
} from '@/lib/motion';
import { isPageCovered, whenPageRevealed } from '@/lib/page/reveal';

const EYE_SELECTOR = '[data-hero-eye]';
const GAZE_QUERY = `${FULL_MOTION_QUERY} and ${FINE_POINTER_QUERY}`;
const GAZE = { duration: 0.5, ease: 'power3.out' };
const EYE_RANGE = 0.5;
const SEAM_RANGE = 0.15;

interface EyeParts extends CoreParts {
  gaze: HTMLElement;
}

function queryParts(root: HTMLElement): EyeParts | null {
  const core = root.querySelector<HTMLElement>('[data-hero-eye-core]');
  const halo = root.querySelector<HTMLElement>('[data-hero-eye-halo]');
  const seam = root.querySelector<HTMLElement>('[data-hero-eye-seam]');
  const gaze = root.querySelector<HTMLElement>('[data-hero-eye-gaze]');
  if (!core || !halo || !seam || !gaze) return null;
  return { core, halo, seam, gaze };
}

function initEye(root: HTMLElement): void {
  const parts = queryParts(root);
  if (!parts) return;

  let pulse: ReturnType<typeof createCorePulse> | undefined;
  // The ignition starts dark, so it is only set up while the loader still hides the eye.
  let canIgnite = isPageCovered();
  let isRevealed = false;
  let isVisible = false;

  const syncPulse = (): void => {
    if (isRevealed && isVisible) pulse?.play();
    else pulse?.pause();
  };

  withMotionPreference(({ reduceMotion }) => {
    pulse = createCorePulse(parts, { reduceMotion, ignite: canIgnite && !reduceMotion });
    canIgnite = false;
    syncPulse();
    return () => {
      pulse = undefined;
    };
  }, root);

  gsap.matchMedia(root).add(GAZE_QUERY, () =>
    followPointer(
      root,
      [
        { target: parts.gaze, range: EYE_RANGE },
        { target: parts.seam, range: SEAM_RANGE },
      ],
      GAZE,
    ),
  );

  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? false;
    syncPulse();
  });
  observer.observe(root);

  // Waits for the loader's exit animation to finish, so the ignition never overlaps the fade.
  void whenPageRevealed().then(() => {
    isRevealed = true;
    syncPulse();
  });
}

for (const root of document.querySelectorAll<HTMLElement>(EYE_SELECTOR)) {
  initEye(root);
}
