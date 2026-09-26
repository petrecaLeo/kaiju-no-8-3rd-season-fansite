import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import {
  FAVICON_ICO,
  FAVICON_SOURCE,
  GENERATED_ICONS,
  type SiteIcon,
} from '../src/config/site-icons.ts';
import { SITE } from '../src/config/site.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'public');
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const ICO_HEADER_SIZE = 6;
const ICO_ENTRY_SIZE = 16;

async function renderIcon({ size, inset, opaque }: SiteIcon): Promise<Buffer> {
  const artwork = Math.round(size * (1 - 2 * inset));
  const before = Math.floor((size - artwork) / 2);
  const after = size - artwork - before;
  const background = opaque ? SITE.themeColor : TRANSPARENT;
  const source = sharp(path.join(ROOT, FAVICON_SOURCE));

  return (opaque ? source.flatten({ background }) : source)
    .resize(artwork, artwork, { fit: 'contain', background })
    .extend({ top: before, bottom: after, left: before, right: after, background })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// An .ico is a directory of images; since Windows Vista each entry may simply hold a PNG.
function toIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(ICO_HEADER_SIZE + ICO_ENTRY_SIZE);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size % 256, 6);
  header.writeUInt8(size % 256, 7);
  header.writeUInt8(0, 8);
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18);
  return Buffer.concat([header, png]);
}

async function write(file: string, data: Buffer): Promise<void> {
  await writeFile(path.join(OUTPUT_DIR, file), data);
  console.log(`public/${file} (${(data.length / 1024).toFixed(1)} KB)`);
}

await mkdir(OUTPUT_DIR, { recursive: true });

for (const icon of GENERATED_ICONS) {
  await write(icon.file, await renderIcon(icon));
}

await write(FAVICON_ICO.file, toIco(await renderIcon(FAVICON_ICO), FAVICON_ICO.size));
