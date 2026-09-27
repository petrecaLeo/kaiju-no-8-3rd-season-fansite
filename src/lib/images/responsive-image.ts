import type { ImageMetadata } from 'astro';

export interface ResponsiveImage {
  src: ImageMetadata;
  widths: number[];
  sizes: string;
  quality?: number;
}

export function responsiveImage(
  src: ImageMetadata,
  targetWidths: readonly number[],
  sizes: string,
  quality?: number,
): ResponsiveImage {
  const widths = [...targetWidths.filter((width) => width < src.width), src.width];
  return quality === undefined ? { src, widths, sizes } : { src, widths, sizes, quality };
}
