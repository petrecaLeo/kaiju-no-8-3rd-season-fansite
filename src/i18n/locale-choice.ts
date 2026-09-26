import { writeLocalStorage } from '@/lib/storage/local-storage';

import { isLocale, LOCALE_STORAGE_KEY } from './config';

const LOCALE_LINK_SELECTOR = 'a[data-locale]';

// Only a manual choice is stored: the automatic detection at "/" never writes it.
export function rememberLocaleChoice(container: Element): void {
  container.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest<HTMLAnchorElement>(LOCALE_LINK_SELECTOR);
    const locale = link?.dataset.locale;
    if (isLocale(locale)) writeLocalStorage(LOCALE_STORAGE_KEY, locale);
  });
}
