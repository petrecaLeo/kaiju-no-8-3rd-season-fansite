import { gsap } from '@/lib/motion';

// A point of the art (share of its width and height) and how much to zoom in on it.
export interface Shot {
  x: number;
  y: number;
  zoom: number;
}

interface CameraOptions {
  story: HTMLElement;
  stage: HTMLElement;
  canvas: HTMLElement;
  shots: readonly Shot[];
}

// One shot per beat after the title, which keeps the CSS framing (the one shown without JS).
export const STORY_SHOTS: readonly Shot[] = [
  { x: 0.47, y: 0.18, zoom: 1.24 },
  { x: 0.55, y: 0.6, zoom: 1.12 },
  { x: 0.8, y: 0.28, zoom: 1.24 },
  { x: 0.82, y: 0.42, zoom: 1 },
];

function readNumber(style: CSSStyleDeclaration, property: string, fallback: number): number {
  const value = Number.parseFloat(style.getPropertyValue(property));
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Puts the shot on the camera anchor that StoryStage.css sets for each layout, without ever
// uncovering the stage. The canvas scales from its top-left corner.
function frameShot(stage: HTMLElement, canvas: HTMLElement, shot: Shot): { x: number; y: number } {
  const style = getComputedStyle(stage);
  const anchorX = readNumber(style, '--camera-anchor-x', 0.5) * stage.clientWidth;
  const anchorY = readNumber(style, '--camera-anchor-y', 0.5) * stage.clientHeight;
  const width = canvas.offsetWidth * shot.zoom;
  const height = canvas.offsetHeight * shot.zoom;
  const left = canvas.offsetLeft;
  const top = canvas.offsetTop;

  return {
    x: clamp(anchorX - left - shot.x * width, stage.clientWidth - left - width, -left),
    y: clamp(anchorY - top - shot.y * height, stage.clientHeight - top - height, -top),
  };
}

// Moves the camera while the stage is stuck: each shot is reached when its beat fills the screen.
export function createCameraMove({ story, stage, canvas, shots }: CameraOptions): void {
  const timeline = gsap.timeline({
    defaults: { duration: 1, ease: 'sine.inOut' },
    scrollTrigger: {
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  for (const shot of shots) {
    timeline.to(canvas, {
      x: () => frameShot(stage, canvas, shot).x,
      y: () => frameShot(stage, canvas, shot).y,
      scale: shot.zoom,
    });
  }
}
