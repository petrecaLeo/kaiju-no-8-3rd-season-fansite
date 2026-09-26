import type { ImageMetadata } from 'astro';

export interface ResponsiveImage {
  src: ImageMetadata;
  widths: number[];
  sizes: string;
}

export function responsiveImage(
  src: ImageMetadata,
  targetWidths: readonly number[],
  sizes: string,
): ResponsiveImage {
  const widths = [...targetWidths.filter((width) => width < src.width), src.width];
  return { src, widths, sizes };
}
