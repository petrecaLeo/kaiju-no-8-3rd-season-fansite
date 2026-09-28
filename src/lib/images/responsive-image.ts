import type { ImageMetadata, ImageOutputFormat } from 'astro';

export interface ImageEncoding {
  format?: ImageOutputFormat;
  quality?: number;
}

export interface ResponsiveImage extends ImageEncoding {
  src: ImageMetadata;
  widths: number[];
  sizes: string;
}

export function responsiveImage(
  src: ImageMetadata,
  targetWidths: readonly number[],
  sizes: string,
  encoding: ImageEncoding = {},
): ResponsiveImage {
  const widths = [...targetWidths.filter((width) => width < src.width), src.width];
  return { src, widths, sizes, ...encoding };
}
