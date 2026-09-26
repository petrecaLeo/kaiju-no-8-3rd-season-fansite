import type { FontFile } from '@/config/fonts';
import { isLocale } from '@/i18n/config';
import { getLocaleFonts } from '@/lib/fonts/locale-fonts';

const PENDING_STATUSES: ReadonlySet<FontFaceLoadStatus> = new Set(['unloaded', 'loading']);

function getPageFonts(): FontFile[] {
  const { lang } = document.documentElement;
  return isLocale(lang) ? getLocaleFonts([lang]) : [];
}

function isFace(face: FontFace, font: FontFile): boolean {
  return face.family.replaceAll(/["']/g, '') === font.family && face.weight === String(font.weight);
}

// Faces are fetched only when laid-out text needs them; loading them by name also covers text
// that is not rendered yet, so nothing swaps after the page is revealed.
export async function loadPageFonts(): Promise<void> {
  await Promise.allSettled(
    getPageFonts().map(({ family, weight }) =>
      document.fonts.load(`${String(weight)} 1em "${family}"`),
    ),
  );
  await document.fonts.ready;
}

export function hasPendingPageFonts(): boolean {
  const fonts = getPageFonts();
  return Array.from(document.fonts).some(
    (face) => PENDING_STATUSES.has(face.status) && fonts.some((font) => isFace(face, font)),
  );
}

// A face that arrives after the reveal would swap and shift the layout, so the page keeps the
// metric-matched fallbacks instead (see `:root[data-fonts='fallback']` in tokens.css).
export function lockFallbackFonts(): void {
  document.documentElement.dataset.fonts = 'fallback';
}
