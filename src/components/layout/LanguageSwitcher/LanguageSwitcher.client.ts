import { rememberLocaleChoice } from '@/i18n/locale-choice';

const SWITCHER_SELECTOR = '[data-language-switcher]';
const MENU_SELECTOR = 'details[data-language-menu]';

function closeOnEscape(menu: HTMLDetailsElement, event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !menu.open) return;

  event.preventDefault();
  menu.open = false;
  menu.querySelector('summary')?.focus();
}

function closeWhenOutside(menu: HTMLDetailsElement, target: EventTarget | null): void {
  if (target instanceof Node && !menu.contains(target)) menu.open = false;
}

// Safari (macOS and iOS) does not focus a clicked link: mousedown hands the focus to the nearest
// focusable ancestor (the header, target of "back to top") or to nothing. Closing then would hide
// the link before its click lands, so only a move to an unrelated element closes the menu.
// Outside clicks are handled separately.
function closeWhenFocusLeaves(menu: HTMLDetailsElement, next: EventTarget | null): void {
  if (next instanceof Node && !next.contains(menu)) closeWhenOutside(menu, next);
}

function enhanceMenu(menu: HTMLDetailsElement): void {
  menu.addEventListener('keydown', (event) => {
    closeOnEscape(menu, event);
  });
  menu.addEventListener('focusout', (event) => {
    closeWhenFocusLeaves(menu, event.relatedTarget);
  });
  document.addEventListener('click', (event) => {
    closeWhenOutside(menu, event.target);
  });
}

for (const switcher of document.querySelectorAll<HTMLElement>(SWITCHER_SELECTOR)) {
  rememberLocaleChoice(switcher);

  const menu = switcher.querySelector<HTMLDetailsElement>(MENU_SELECTOR);
  if (menu) enhanceMenu(menu);
}
