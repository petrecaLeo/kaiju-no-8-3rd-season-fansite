import { getImage } from 'astro:assets';

import type { ResponsiveImage } from './responsive-image';

export interface ImagePreload {
  href: string;
  srcset: string;
  sizes: string;
}

export function getImagePreloads(images: readonly ResponsiveImage[]): Promise<ImagePreload[]> {
  return Promise.all(
    images.map(async ({ src, widths, sizes }) => {
      const image = await getImage({ src, widths, sizes });
      return { href: image.src, srcset: image.srcSet.attribute, sizes };
    }),
  );
}
