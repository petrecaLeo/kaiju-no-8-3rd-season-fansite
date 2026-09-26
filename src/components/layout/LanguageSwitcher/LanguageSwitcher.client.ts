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

function enhanceMenu(menu: HTMLDetailsElement): void {
  menu.addEventListener('keydown', (event) => {
    closeOnEscape(menu, event);
  });
  // Safari does not focus links on click, so a focusout without relatedTarget must not close the
  // menu: the link would be hidden before its click lands. Outside clicks are handled below.
  menu.addEventListener('focusout', (event) => {
    closeWhenOutside(menu, event.relatedTarget);
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
