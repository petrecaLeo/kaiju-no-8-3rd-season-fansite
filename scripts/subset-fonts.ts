import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Blob, Face } from 'harfbuzzjs';
import subsetFont from 'subset-font';

import { LOCALE_METADATA } from '../src/i18n/config.ts';
import ja from '../src/i18n/dictionaries/ja.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'scripts/fonts-source/noto-sans-jp');
const OUTPUT_DIR = path.join(ROOT, 'src/assets/fonts/noto-sans-jp');
const DOWNLOAD_BASE_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.3.0/files';
const MANUAL_DOWNLOAD_URL = 'https://fonts.google.com/noto/specimen/Noto+Sans+JP';
const SOURCE_EXTENSIONS = ['.woff2', '.ttf'];
const FONTS = [
  { name: 'NotoSansJP-Regular', weight: 400 },
  { name: 'NotoSansJP-Medium', weight: 500 },
] as const;
const PRINTABLE_ASCII = Array.from({ length: 0x7f - 0x20 }, (_, index) =>
  String.fromCodePoint(0x20 + index),
);

type Font = (typeof FONTS)[number];

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  return error.cause instanceof Error ? `${error.message} (${error.cause.message})` : error.message;
}

function findMissing(font: Buffer, characters: string[]): string[] {
  const covered = new Set(new Face(new Blob(font)).collectUnicodes());
  return characters.filter((character) => !covered.has(character.codePointAt(0) ?? 0));
}

async function findLocalSource(font: Font): Promise<string | undefined> {
  for (const extension of SOURCE_EXTENSIONS) {
    const file = path.join(SOURCE_DIR, `${font.name}${extension}`);
    const found = await access(file).then(
      () => true,
      () => false,
    );
    if (found) {
      return file;
    }
  }
  return undefined;
}

async function download(font: Font): Promise<string> {
  const url = `${DOWNLOAD_BASE_URL}/noto-sans-jp-japanese-${String(font.weight)}-normal.woff2`;
  const file = path.join(SOURCE_DIR, `${font.name}.woff2`);
  console.log(`Downloading ${font.name} from ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${String(response.status)} ${response.statusText}`);
    }
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
    return file;
  } catch (error) {
    console.error(`Could not download ${font.name}: ${describeError(error)}`);
    console.error(
      `Download Noto Sans JP manually from ${MANUAL_DOWNLOAD_URL}, then copy ${font.name}.ttf (from the "static" folder of the zip) to ${path.relative(ROOT, SOURCE_DIR)}/ and run again.`,
    );
    process.exit(1);
  }
}

async function resolveSources(): Promise<Map<Font, string>> {
  const sources = new Map<Font, string>();
  await mkdir(SOURCE_DIR, { recursive: true });

  for (const font of FONTS) {
    const local = await findLocalSource(font);
    if (local) {
      console.log(`Found ${path.relative(ROOT, local)}, skipping download`);
    }
    sources.set(font, local ?? (await download(font)));
  }
  return sources;
}

const nativeNames = Object.values(LOCALE_METADATA).map(({ nativeName }) => nativeName);
const text = [...collectStrings(ja), ...nativeNames, ...PRINTABLE_ASCII].join('');
const characters = [...new Set(text.replace(/\p{Cc}/gu, ''))].sort();
const charset = characters.join('');

const sources = await resolveSources();

await mkdir(OUTPUT_DIR, { recursive: true });
console.log(`${String(characters.length)} characters`);

for (const [font, sourceFile] of sources) {
  const file = `${font.name}.woff2`;
  const source = await readFile(sourceFile);
  const sfnt = await subsetFont(source, charset, { targetFormat: 'sfnt' });
  const woff2 = await subsetFont(sfnt, charset, { targetFormat: 'woff2' });
  await writeFile(path.join(OUTPUT_DIR, file), woff2);

  const reduction = ((1 - woff2.length / source.length) * 100).toFixed(1);
  console.log(
    `${file}: ${formatSize(source.length)} -> ${formatSize(woff2.length)} (-${reduction}%)`,
  );

  const missing = findMissing(sfnt, characters);
  if (missing.length > 0) {
    console.warn(
      `  ${String(missing.length)} characters missing from ${file}: ${missing.join('')}`,
    );
    process.exitCode = 1;
  }
}
