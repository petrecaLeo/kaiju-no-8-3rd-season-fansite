import { getImage } from 'astro:assets';

import type { ResponsiveImage } from './responsive-image';

export interface ImagePreload {
  href: string;
  srcset: string;
  sizes: string;
}

export function getImagePreloads(images: readonly ResponsiveImage[]): Promise<ImagePreload[]> {
  return Promise.all(
    images.map(async (options) => {
      const image = await getImage(options);
      return { href: image.src, srcset: image.srcSet.attribute, sizes: options.sizes };
    }),
  );
}
