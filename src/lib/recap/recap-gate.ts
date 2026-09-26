import { gsap, prefersReducedMotion } from '@/lib/motion';
import { readSessionStorage, writeSessionStorage } from '@/lib/storage/session-storage';

const STORAGE_KEY = 'kaiju8-teaser:recap-revealed';
const REVEALED = 'true';

// The scan line crosses the screen at this speed, within these bounds (seconds).
const SWEEP_PX_PER_SECOND = 1100;
const SWEEP_MIN_SECONDS = 0.55;
const SWEEP_MAX_SECONDS = 1.1;

type GateState = 'veiled' | 'revealing' | 'revealed';

interface GateParts {
  vault: HTMLElement;
  gate: HTMLElement;
  report: HTMLElement;
  veil: HTMLElement;
  button: HTMLButtonElement;
  start: HTMLElement;
}

function queryParts(section: HTMLElement): GateParts | null {
  const vault = section.querySelector<HTMLElement>('[data-recap-vault]');
  const gate = section.querySelector<HTMLElement>('[data-recap-gate]');
  const report = section.querySelector<HTMLElement>('[data-recap-report]');
  const veil = section.querySelector<HTMLElement>('[data-recap-veil]');
  const button = section.querySelector<HTMLButtonElement>('[data-recap-reveal]');
  const start = section.querySelector<HTMLElement>('[data-recap-start]');
  if (!vault || !gate || !report || !veil || !button || !start) return null;
  return { vault, gate, report, veil, button, start };
}

function setState(section: HTMLElement, state: GateState): void {
  section.dataset.recapState = state;
}

// While veiled, the gate sticks to the top of the screen over the blurred report. Revealing from
// further down scrolls back to where the gate sits in the flow (the same spot on screen), so the
// report opens at its start.
function alignToStart({ vault, gate }: GateParts): void {
  const stuckAt = Number.parseFloat(getComputedStyle(gate).top) || 0;
  const offset = vault.getBoundingClientRect().top - stuckAt;
  if (offset < 0) window.scrollBy({ top: offset, behavior: 'instant' });
}

// A scan line (the veil's top edge) sweeps down the part of the veil that is on screen.
function sweepVeil(veil: HTMLElement, onComplete: () => void): void {
  const distance = Math.max(0, window.innerHeight - veil.getBoundingClientRect().top);
  const duration = gsap.utils.clamp(
    SWEEP_MIN_SECONDS,
    SWEEP_MAX_SECONDS,
    distance / SWEEP_PX_PER_SECOND,
  );

  gsap.fromTo(
    veil,
    { y: 0 },
    {
      y: distance,
      duration,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(veil, { clearProps: 'transform' });
        onComplete();
      },
    },
  );
}

function reveal(section: HTMLElement, parts: GateParts): void {
  writeSessionStorage(STORAGE_KEY, REVEALED);
  alignToStart(parts);
  parts.report.inert = false;
  parts.button.setAttribute('aria-expanded', 'true');
  // The button disappears, so focus moves to the first line of the report, where reading starts.
  parts.start.focus({ preventScroll: true });

  const finish = (): void => {
    setState(section, 'revealed');
  };

  if (prefersReducedMotion()) {
    finish();
    return;
  }
  setState(section, 'revealing');
  sweepVeil(parts.veil, finish);
}

// The report ships in the HTML (for search engines and no-JS visitors) and is only veiled here:
// blurred on screen and inert, so it is skipped by keyboard, screen readers and find-in-page until
// the visitor asks for it. The choice lasts for the browser session.
export function initRecapGate(section: HTMLElement, onRevealed: () => void): void {
  const parts = queryParts(section);
  if (!parts) return;

  if (readSessionStorage(STORAGE_KEY) === REVEALED) {
    parts.button.setAttribute('aria-expanded', 'true');
    setState(section, 'revealed');
    onRevealed();
    return;
  }

  parts.report.inert = true;
  setState(section, 'veiled');

  parts.button.addEventListener('click', () => {
    if (section.dataset.recapState !== 'veiled') return;
    reveal(section, parts);
    onRevealed();
  });
}
