// DOM side of the character spotlight. The roster cards carry every character's text (visible
// name, visually hidden description), so the page works and indexes without JS; featuring a
// character copies that text into the spotlight and puts the previous one back in the roster.

export interface CharacterSnapshot {
  id: string;
  name: string;
  alias: string;
  description: string;
  suitCode: string;
  suitLabel: string;
  unknown: boolean;
}

export interface Spotlight {
  root: HTMLElement;
  name: HTMLElement;
  alias: HTMLElement;
  suit: HTMLElement;
  suitCode: HTMLElement;
  suitLabel: HTMLElement;
  scroller: HTMLElement;
  description: HTMLElement;
  parts: HTMLElement[];
  photos: HTMLImageElement[];
}

function required(scope: ParentNode, selector: string): HTMLElement {
  const element = scope.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Character spotlight is missing ${selector}`);
  return element;
}

function textOf(scope: ParentNode, selector: string): string {
  return scope.querySelector(selector)?.textContent.trim() ?? '';
}

export function querySpotlight(scope: ParentNode): Spotlight {
  const root = required(scope, '[data-spotlight]');
  return {
    root,
    name: required(root, '[data-spotlight-name]'),
    alias: required(root, '[data-spotlight-alias]'),
    suit: required(root, '[data-spotlight-suit]'),
    suitCode: required(root, '[data-spotlight-suit] [data-suit-code]'),
    suitLabel: required(root, '[data-spotlight-suit] [data-suit-label]'),
    scroller: required(root, '[data-spotlight-scroll]'),
    description: required(root, '[data-spotlight-description]'),
    parts: Array.from(root.querySelectorAll<HTMLElement>('[data-spotlight-part]')),
    photos: Array.from(root.querySelectorAll<HTMLImageElement>('[data-spotlight-photo]')),
  };
}

export function readCard(card: HTMLElement): CharacterSnapshot {
  return {
    id: card.dataset.character ?? '',
    name: textOf(card, '[data-character-name]'),
    alias: textOf(card, '[data-character-alias]'),
    description: textOf(card, '[data-character-description]'),
    suitCode: textOf(card, '[data-suit-code]'),
    suitLabel: textOf(card, '[data-suit-label]'),
    unknown: card.hasAttribute('data-unknown'),
  };
}

export function findPhoto(spotlight: Spotlight, id: string): HTMLImageElement | undefined {
  return spotlight.photos.find((photo) => photo.dataset.spotlightPhoto === id);
}

// A description taller than its box scrolls, and must then be reachable by keyboard.
// data-more fades its lower edge while there is still text below.
export function syncScrollable(scroller: HTMLElement): void {
  const { scrollTop, scrollHeight, clientHeight } = scroller;
  if (scrollHeight > clientHeight + 1) scroller.tabIndex = 0;
  else scroller.removeAttribute('tabindex');
  scroller.toggleAttribute('data-more', scrollTop + clientHeight < scrollHeight - 1);
}

// Drives the aura colour and the unknown treatment, so it runs as the transition starts.
export function setSpotlightCharacter(spotlight: Spotlight, character: CharacterSnapshot): void {
  spotlight.root.dataset.character = character.id;
  spotlight.root.toggleAttribute('data-unknown', character.unknown);
}

// Replacing the text inside the aria-live region is what makes screen readers announce it.
export function writeSpotlightText(spotlight: Spotlight, character: CharacterSnapshot): void {
  spotlight.name.textContent = character.name;
  spotlight.alias.textContent = character.alias;
  spotlight.alias.hidden = character.alias === '';
  spotlight.suitCode.textContent = character.suitCode;
  spotlight.suitLabel.textContent = character.suitLabel;
  spotlight.suit.hidden = character.suitCode === '';
  spotlight.description.textContent = character.description;
  spotlight.scroller.scrollTop = 0;
  syncScrollable(spotlight.scroller);
}

// The previous character takes the selected card's slot, so the carousel never reflows. When
// the selected button had focus, focus moves to the card now in its place.
export function swapRosterCards(selected: HTMLElement, returning: HTMLElement): void {
  const hadFocus = selected.contains(document.activeElement);
  selected.before(returning);
  returning.hidden = false;
  selected.hidden = true;
  if (hadFocus) returning.querySelector('button')?.focus({ preventScroll: true });
}
