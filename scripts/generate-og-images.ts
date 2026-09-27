import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import sharp, { type OverlayOptions } from 'sharp';
import subsetFont from 'subset-font';

import { getOpenGraphImagePath, SITE } from '../src/config/site.ts';
import { LOCALES, type Locale } from '../src/i18n/config.ts';
import en from '../src/i18n/dictionaries/en.json' with { type: 'json' };
import ja from '../src/i18n/dictionaries/ja.json' with { type: 'json' };
import ptBR from '../src/i18n/dictionaries/pt-BR.json' with { type: 'json' };

const ROOT = path.resolve(import.meta.dirname, '..');
const { width: WIDTH, height: HEIGHT } = SITE.openGraphImage;
const DICTIONARIES = { 'pt-BR': ptBR, en, ja } satisfies Record<Locale, unknown>;
const LOGOS = { 'pt-BR': 'ENLogo.webp', en: 'ENLogo.webp', ja: 'JPLogo.webp' } as const;
const TITLE_FONT = { family: 'Paladins Straight', file: 'paladins/paladinsstraight.woff2' };

// Same measurements as HeroArtwork.css (--socket-x/y) and HeroEye.css (eye at 10.5% of the art).
const ARMOR = { socketX: 0.4992, socketY: 0.6122 };
const STAGE_WIDTH = 1500;
const EYE_SIZE = Math.round(STAGE_WIDTH * 0.105);
const SOCKET = { x: WIDTH / 2, y: 215 };
const LOGO_WIDTH = 500;
const SEASON_SIZE = Math.round(LOGO_WIDTH * 0.07);
const LOCKUP_GAP = Math.round(LOGO_WIDTH * 0.06);
const BOTTOM_MARGIN = 56;

type Colors = Record<'hot' | 'ember' | 'shadow' | 'cyan', string>;

async function readColors(): Promise<Colors> {
  const tokens = await readFile(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
  const read = (name: string): string => {
    const value = new RegExp(`--${name}:\\s*([^;]+);`).exec(tokens)?.[1];
    if (value === undefined) throw new Error(`Token --${name} not found in tokens.css`);
    return value.trim();
  };
  return {
    hot: read('color-core-hot'),
    ember: read('color-core-ember'),
    shadow: read('color-core-shadow'),
    cyan: read('color-kaiju-cyan'),
  };
}

function svg(defs: string, body: string): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(WIDTH)}" height="${String(HEIGHT)}"><defs>${defs}</defs>${body}</svg>`,
  );
}

function glow(colors: Colors): Buffer {
  const seam = { width: EYE_SIZE * 5.8, height: EYE_SIZE * 2.8 };
  const halo = EYE_SIZE * 2.1;
  return svg(
    `<radialGradient id="seam"><stop offset="0" stop-color="${colors.hot}"/><stop offset="0.38" stop-color="${colors.ember}"/><stop offset="0.7" stop-color="${colors.shadow}"/><stop offset="1" stop-color="${colors.shadow}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="halo"><stop offset="0.42" stop-color="${colors.hot}"/><stop offset="0.62" stop-color="${colors.ember}"/><stop offset="1" stop-color="${colors.ember}" stop-opacity="0"/></radialGradient>`,
    `<rect x="${String(SOCKET.x - seam.width / 2)}" y="${String(SOCKET.y - seam.height / 2)}" width="${String(seam.width)}" height="${String(seam.height)}" fill="url(#seam)" opacity="0.6"/>` +
      `<circle cx="${String(SOCKET.x)}" cy="${String(SOCKET.y)}" r="${String(halo / 2)}" fill="url(#halo)" opacity="0.55"/>`,
  );
}

function shade(): Buffer {
  return svg(
    '<linearGradient id="shade" x2="0" y2="1"><stop offset="0.4" stop-opacity="0"/><stop offset="0.82" stop-opacity="0.92"/><stop offset="1"/></linearGradient>',
    `<rect width="${String(WIDTH)}" height="${String(HEIGHT)}" fill="url(#shade)"/>`,
  );
}

async function armor(): Promise<OverlayOptions> {
  const file = path.join(ROOT, 'src/assets/images/hero/background.png');
  const { width, height } = await sharp(file).metadata();
  const stageHeight = Math.round((STAGE_WIDTH * height) / width);
  const left = Math.round(SOCKET.x - ARMOR.socketX * STAGE_WIDTH);
  const top = Math.round(SOCKET.y - ARMOR.socketY * stageHeight);
  const input = await sharp(file)
    .resize(STAGE_WIDTH, stageHeight)
    .extract({ left: -left, top: -top, width: WIDTH, height: Math.min(HEIGHT, stageHeight + top) })
    .toBuffer();
  return { input, left: 0, top: 0 };
}

async function eye(): Promise<OverlayOptions> {
  const file = path.join(ROOT, 'src/assets/images/hero/eye.webp');
  const input = await sharp(file).resize(EYE_SIZE, EYE_SIZE).toBuffer();
  return {
    input,
    left: Math.round(SOCKET.x - EYE_SIZE / 2),
    top: Math.round(SOCKET.y - EYE_SIZE / 2),
  };
}

async function prepareTitleFont(directory: string, text: string): Promise<string> {
  const source = await readFile(path.join(ROOT, 'src/assets/fonts', TITLE_FONT.file));
  const file = path.join(directory, 'title.ttf');
  await writeFile(file, await subsetFont(source, text, { targetFormat: 'sfnt' }));
  return file;
}

function escapeMarkup(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function lockup(locale: Locale, fontfile: string, color: string): Promise<OverlayOptions[]> {
  const logoFile = path.join(ROOT, 'src/assets/images/logo', LOGOS[locale]);
  const logo = await sharp(logoFile).resize(LOGO_WIDTH).toBuffer({ resolveWithObject: true });
  const season = await sharp({
    text: {
      text: `<span foreground="${color}">${escapeMarkup(DICTIONARIES[locale].sections.hero.season)}</span>`,
      font: `${TITLE_FONT.family} ${String(SEASON_SIZE)}`,
      fontfile,
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });

  const seasonTop = HEIGHT - BOTTOM_MARGIN - season.info.height;
  const logoTop = seasonTop - LOCKUP_GAP - logo.info.height;
  return [
    { input: logo.data, left: Math.round((WIDTH - logo.info.width) / 2), top: logoTop },
    { input: season.data, left: Math.round((WIDTH - season.info.width) / 2), top: seasonTop },
  ];
}

const colors = await readColors();
const layers = [
  { input: glow(colors), left: 0, top: 0 },
  await eye(),
  await armor(),
  { input: shade(), left: 0, top: 0 },
];
const seasonText = LOCALES.map((locale) => DICTIONARIES[locale].sections.hero.season).join('');
const fontDirectory = await mkdtemp(path.join(os.tmpdir(), 'og-images-'));
const fontfile = await prepareTitleFont(fontDirectory, seasonText);

try {
  for (const locale of LOCALES) {
    const output = path.join(ROOT, 'public', getOpenGraphImagePath(locale));
    const image = await sharp({
      create: { width: WIDTH, height: HEIGHT, channels: 3, background: '#000' },
    })
      .composite([...layers, ...(await lockup(locale, fontfile, colors.cyan))])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, image);
    console.log(`${path.relative(ROOT, output)} (${(image.length / 1024).toFixed(1)} KB)`);
  }
} finally {
  await rm(fontDirectory, { recursive: true, force: true });
}
