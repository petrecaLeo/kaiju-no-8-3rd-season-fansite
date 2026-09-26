import { withMotionPreference } from '@/lib/motion';
import { rollWhenVisible } from '@/lib/synopsis/stat-counter';
import { lagBehind, lockOnWhenVisible, revealBeats } from '@/lib/synopsis/story-beats';
import { createCameraMove, STORY_SHOTS } from '@/lib/synopsis/story-camera';

const SECTION_SELECTOR = '[data-synopsis]';

// Everything here decorates text that is already in the HTML. With reduced motion (or without JS)
// the art stays put, the reticle is locked and the numbers show their final values.
function initSynopsis(section: HTMLElement): void {
  const story = section.querySelector<HTMLElement>('[data-story]');
  const stage = section.querySelector<HTMLElement>('[data-story-stage]');
  const canvas = section.querySelector<HTMLElement>('[data-story-canvas]');
  const reticle = section.querySelector<HTMLElement>('[data-story-reticle]');
  const lock = section.querySelector<HTMLElement>('[data-story-lock]');
  if (!story || !stage || !canvas || !reticle || !lock) return;

  const beats = [...section.querySelectorAll<HTMLElement>('[data-story-beat]')];
  const lagLines = section.querySelectorAll<HTMLElement>('[data-beat-lag]');
  const figures = section.querySelectorAll<HTMLElement>('[data-stat-roll]');

  withMotionPreference(({ reduceMotion }) => {
    if (reduceMotion) return undefined;

    createCameraMove({ story, stage, canvas, shots: STORY_SHOTS });
    revealBeats(beats);
    for (const line of lagLines) lagBehind(line);
    lockOnWhenVisible(reticle, lock);
    return rollWhenVisible(figures);
  }, section);
}

for (const section of document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)) {
  initSynopsis(section);
}
