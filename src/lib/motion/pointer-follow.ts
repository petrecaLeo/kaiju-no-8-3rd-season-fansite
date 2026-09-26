import { gsap } from './gsap';

export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

// The pointer only has to travel this share of the viewport's short side to pull a follower most of
// the way to its limit.
const REACH_RATIO = 0.4;

export interface PointerFollower {
  target: HTMLElement;
  range: number;
}

interface FollowOptions {
  duration: number;
  ease: string;
}

// Moves each follower towards the pointer, up to `range` × the anchor width away from the anchor
// centre. The pull eases off with distance (tanh), so the offset never reaches the limit abruptly.
export function followPointer(
  anchor: HTMLElement,
  followers: readonly PointerFollower[],
  { duration, ease }: FollowOptions,
): () => void {
  const movers = followers.map(({ target, range }) => ({
    range,
    x: gsap.quickTo(target, 'x', { duration, ease }),
    y: gsap.quickTo(target, 'y', { duration, ease }),
  }));

  const moveBy = (offsetX: number, offsetY: number): void => {
    for (const mover of movers) {
      mover.x(offsetX * mover.range);
      mover.y(offsetY * mover.range);
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return;

    const rect = anchor.getBoundingClientRect();
    const deltaX = event.clientX - (rect.left + rect.width / 2);
    const deltaY = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(deltaX, deltaY);
    if (distance === 0) return;

    const reach = Math.min(window.innerWidth, window.innerHeight) * REACH_RATIO;
    const pull = (Math.tanh(distance / reach) * rect.width) / distance;
    moveBy(deltaX * pull, deltaY * pull);
  };

  const onPointerLeave = (): void => {
    moveBy(0, 0);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
  };
}
