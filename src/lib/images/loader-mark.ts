import type { APIContext } from 'astro';
import { getConfiguredImageService, imageConfig } from 'astro:assets';
import { isLocalService } from 'astro/assets';

import mark from '@/assets/images/logo/number.webp';
import markSource from '@/assets/images/logo/number.webp?inline';

export interface InlineImage {
  src: string;
  width: number;
  height: number;
}

const MARK_FORMAT = 'webp';
const MARK_QUALITY = 80;

let encoded: Promise<InlineImage> | undefined;

// The source is a 31 KB JPEG; re-encoded at full size it is about 4 KB, small enough to ship
// inside the HTML so the loader shows its mark on the first paint without a request.
async function encodeMark(logger: APIContext['logger']): Promise<InlineImage> {
  const service = await getConfiguredImageService();
  if (!isLocalService(service)) return { src: mark.src, width: mark.width, height: mark.height };

  const input = Buffer.from(markSource.slice(markSource.indexOf(',') + 1), 'base64');
  const { data, format } = await service.transform(
    new Uint8Array(input),
    { src: mark.src, format: MARK_FORMAT, quality: MARK_QUALITY },
    imageConfig,
    logger,
  );
  const base64 = Buffer.from(data).toString('base64');
  return { src: `data:image/${format};base64,${base64}`, width: mark.width, height: mark.height };
}

export function getLoaderMark(logger: APIContext['logger']): Promise<InlineImage> {
  encoded ??= encodeMark(logger);
  return encoded;
}
