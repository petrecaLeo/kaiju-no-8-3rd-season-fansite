import { settleImages } from '@/lib/dom/images';
import { createOdometer, gsap, type Odometer, withMotionPreference } from '@/lib/motion';
import { ScrollTrigger } from '@/lib/motion/scroll-trigger';

// The spine fills up to this line of the viewport; markers light up as it passes them.
const SPINE_LINE = 'top 62%';
const READOUT_START = 'top 88%';
const CLOSING_START = 'top 82%';
const DIM_ATTRIBUTE = 'data-dim';

function drawSpine(section: HTMLElement): () => void {
  const chronology = section.querySelector<HTMLElement>('[data-recap-chronology]');
  const fill = section.querySelector<HTMLElement>('[data-recap-spine]');
  if (!chronology || !fill) return () => undefined;

  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: chronology, start: SPINE_LINE, end: 'bottom 62%', scrub: 0.4 },
    },
  );

  const nodes = [...chronology.querySelectorAll<HTMLElement>('[data-recap-node]')];
  for (const node of nodes) {
    node.setAttribute(DIM_ATTRIBUTE, '');
    ScrollTrigger.create({
      trigger: node,
      start: SPINE_LINE,
      onEnter: () => {
        node.removeAttribute(DIM_ATTRIBUTE);
      },
      onLeaveBack: () => {
        node.setAttribute(DIM_ATTRIBUTE, '');
      },
    });
  }

  return () => {
    for (const node of nodes) node.removeAttribute(DIM_ATTRIBUTE);
  };
}

// Readouts roll up from zero the first time they come into view; gauges fill alongside.
function rollReadouts(section: HTMLElement): () => void {
  const odometers: Odometer[] = [];

  for (const readout of section.querySelectorAll<HTMLElement>('[data-readout]')) {
    const value = readout.querySelector<HTMLElement>('[data-readout-value]');
    const gauge = readout.querySelector<SVGElement>('[data-readout-gauge]');
    const odometer = value ? createOdometer(value) : null;
    if (!odometer && !gauge) continue;

    const timeline = odometer?.timeline ?? gsap.timeline({ paused: true });
    if (gauge) {
      timeline.fromTo(gauge, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power3.out' }, 0);
    }
    if (odometer) odometers.push(odometer);

    ScrollTrigger.create({
      trigger: readout,
      start: READOUT_START,
      once: true,
      onEnter: () => {
        timeline.play();
      },
    });
  }

  return () => {
    for (const odometer of odometers) odometer.restore();
  };
}

// The finale art ships as a still frame; with motion allowed, the loop takes its place. The swap
// waits for the (lazy) still to load: the browser then keeps it on screen while the loop
// downloads, instead of an empty frame. The closing line rises into view.
function playFinale(section: HTMLElement): () => void {
  const art = section.querySelector<HTMLImageElement>('[data-recap-finale-art]');
  const still = art?.getAttribute('src');
  const loop = art?.dataset.loopSrc;
  let active = true;
  if (art && still && loop) {
    void settleImages([art]).then(() => {
      if (active) art.src = loop;
    });
  }

  const closing = section.querySelector<HTMLElement>('[data-recap-closing]');
  if (closing?.parentElement) {
    gsap.from(closing, {
      yPercent: 110,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: closing.parentElement, start: CLOSING_START },
    });
  }

  return () => {
    active = false;
    if (art && still) art.src = still;
  };
}

// Only runs once the report is revealed: nothing animates behind the veil. With reduced motion
// the report is static (spine drawn, final values, still finale art).
export function animateRecap(section: HTMLElement): void {
  withMotionPreference(({ reduceMotion }) => {
    if (reduceMotion) return undefined;

    const restoreSpine = drawSpine(section);
    const restoreReadouts = rollReadouts(section);
    const restoreFinale = playFinale(section);

    return () => {
      restoreSpine();
      restoreReadouts();
      restoreFinale();
    };
  }, section);
}
