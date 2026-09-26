import {
  findPhoto,
  querySpotlight,
  readCard,
  setSpotlightCharacter,
  type Spotlight,
  swapRosterCards,
  syncScrollable,
  writeSpotlightText,
} from '@/lib/characters/spotlight-dom';
import { playSpotlightSwap } from '@/lib/characters/spotlight-transition';
import { settleImages } from '@/lib/dom/images';

const SECTION_SELECTOR = '[data-characters]';
const CARD_SELECTOR = '[data-character-card]';

// How long a click waits for the new photo before swapping anyway (slow networks).
const PHOTO_WAIT_MS = 1500;

function cardFrom(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(CARD_SELECTOR) : null;
}

function warmUp(photo: HTMLImageElement): void {
  if (photo.loading === 'lazy') photo.loading = 'eager';
}

// The hidden spotlight photos are lazy, so they would only start downloading on click. Once the
// roster is on screen, a click is likely: fetch them all so the crossfade starts right away.
function warmUpWhenVisible(roster: HTMLElement, spotlight: Spotlight): void {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    for (const photo of spotlight.photos) warmUp(photo);
  });
  observer.observe(roster);
}

async function waitForPhoto(photo: HTMLImageElement): Promise<void> {
  warmUp(photo);
  await Promise.race([
    settleImages([photo]),
    new Promise((resolve) => setTimeout(resolve, PHOTO_WAIT_MS)),
  ]);
}

function initCharacters(section: HTMLElement): void {
  const spotlight = querySpotlight(section);
  const roster = section.querySelector<HTMLElement>('[data-roster-list]');
  let featuredCard = roster?.querySelector<HTMLElement>(`${CARD_SELECTOR}[hidden]`);
  if (!roster || !featuredCard) return;

  let request = 0;
  let running: gsap.core.Timeline | null = null;

  async function feature(card: HTMLElement): Promise<void> {
    const ticket = ++request;
    const character = readCard(card);
    const incomingPhoto = findPhoto(spotlight, character.id);
    if (!incomingPhoto) return;

    await waitForPhoto(incomingPhoto);
    // A newer click wins; the card may also have been featured in the meantime.
    if (ticket !== request || card.hidden || !featuredCard) return;

    running?.progress(1);
    const returningCard = featuredCard;
    const outgoingPhoto = findPhoto(spotlight, returningCard.dataset.character ?? '');
    if (!outgoingPhoto) return;
    featuredCard = card;

    running = playSpotlightSwap({
      incomingPhoto,
      outgoingPhoto,
      textParts: spotlight.parts,
      returningCard,
      glitchTarget: character.unknown ? spotlight.name : null,
      start: () => {
        setSpotlightCharacter(spotlight, character);
        swapRosterCards(card, returningCard);
      },
      writeText: () => {
        writeSpotlightText(spotlight, character);
      },
    });
  }

  roster.addEventListener('click', (event) => {
    const card = cardFrom(event.target);
    if (card && !card.hidden) void feature(card);
  });

  warmUpWhenVisible(roster, spotlight);

  const syncDescription = (): void => {
    syncScrollable(spotlight.scroller);
  };
  spotlight.scroller.addEventListener('scroll', syncDescription, { passive: true });
  new ResizeObserver(syncDescription).observe(spotlight.scroller);
}

for (const section of document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)) {
  initCharacters(section);
}
