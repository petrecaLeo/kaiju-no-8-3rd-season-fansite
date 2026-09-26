import { gsap, prefersReducedMotion } from '@/lib/motion';

export interface SpotlightSwap {
  incomingPhoto: HTMLImageElement;
  outgoingPhoto: HTMLImageElement;
  textParts: HTMLElement[];
  returningCard: HTMLElement;
  glitchTarget: HTMLElement | null;
  // Runs first: aura, unknown treatment and roster swap.
  start: () => void;
  // Runs once the old text has faded out; triggers the aria-live announcement.
  writeText: () => void;
}

const TEXT_OUT = 0.18;
const PHOTO_IN = 0.8;
const STAGGER = 0.06;

function finish({ incomingPhoto, outgoingPhoto, textParts, returningCard }: SpotlightSwap): void {
  outgoingPhoto.hidden = true;
  gsap.set([incomingPhoto, returningCard, ...textParts], { clearProps: 'all' });
}

function swapInstantly(swap: SpotlightSwap): null {
  swap.start();
  swap.writeText();
  swap.incomingPhoto.hidden = false;
  swap.outgoingPhoto.hidden = true;
  return null;
}

// Crossfades the photo over the previous one while the text fades out, is replaced and fades
// back in. With reduced motion everything changes at once. Call progress(1) on the returned
// timeline to jump to the end state before starting another swap.
export function playSpotlightSwap(swap: SpotlightSwap): gsap.core.Timeline | null {
  if (prefersReducedMotion()) return swapInstantly(swap);

  const { incomingPhoto, textParts, returningCard, glitchTarget } = swap;
  swap.start();
  incomingPhoto.hidden = false;

  const timeline = gsap.timeline({
    onComplete: () => {
      finish(swap);
    },
  });

  timeline
    .fromTo(
      incomingPhoto,
      { opacity: 0, scale: 1.06, zIndex: 1 },
      { opacity: 1, scale: 1, duration: PHOTO_IN, ease: 'power2.out' },
      0,
    )
    .to(textParts, { opacity: 0, y: -8, duration: TEXT_OUT, ease: 'power1.in' }, 0)
    .call(swap.writeText, undefined, TEXT_OUT)
    .fromTo(
      textParts,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, stagger: STAGGER, immediateRender: false },
      TEXT_OUT,
    )
    .fromTo(returningCard, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.1);

  // Only the name glitches: flickering the photo would reveal the previous one underneath.
  if (glitchTarget) {
    timeline.to(
      glitchTarget,
      { keyframes: { x: [6, -5, 3, -2, 0] }, duration: 0.3, ease: 'none' },
      TEXT_OUT + 0.15,
    );
  }

  return timeline;
}
