import { getImage } from 'astro:assets';

import renoLoop from '@/assets/images/2ndSeason/reno.webp';
import renoStill from '@/assets/images/2ndSeason/reno-still.webp';

// The finale art is an animated WebP (7.5 MB as supplied, about 2 MB re-encoded). The page ships
// a still frame, and recap-motion.ts swaps the loop in only once the report is revealed and motion
// is allowed: visitors who never reveal it, prefer reduced motion or have no JS never download it.
// reno-still.webp is frame 21 of the loop; if the loop changes, export a new still from it.
const LOOP_QUALITY = 70;

export interface FinaleArt {
  still: string;
  loop: string;
  width: number;
  height: number;
}

export async function getFinaleArt(): Promise<FinaleArt> {
  const [still, loop] = await Promise.all([
    getImage({ src: renoStill, format: 'webp' }),
    getImage({ src: renoLoop, format: 'webp', quality: LOOP_QUALITY }),
  ]);

  return { still: still.src, loop: loop.src, width: renoStill.width, height: renoStill.height };
}
