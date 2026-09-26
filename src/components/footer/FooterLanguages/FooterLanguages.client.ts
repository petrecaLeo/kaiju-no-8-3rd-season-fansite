import { rememberLocaleChoice } from '@/i18n/locale-choice';

for (const nav of document.querySelectorAll('[data-footer-languages]')) {
  rememberLocaleChoice(nav);
}
