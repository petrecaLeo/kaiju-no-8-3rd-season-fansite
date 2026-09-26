import { initRecapGate } from '@/lib/recap/recap-gate';
import { animateRecap } from '@/lib/recap/recap-motion';

for (const section of document.querySelectorAll<HTMLElement>('[data-recap]')) {
  initRecapGate(section, () => {
    animateRecap(section);
  });
}
