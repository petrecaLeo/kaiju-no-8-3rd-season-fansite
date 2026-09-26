import { access } from 'node:fs/promises';

import type { AstroIntegration } from 'astro';

import { FONT_ASSETS_DIR, type FontFile } from '../../src/config/fonts';

async function fileExists(file: URL): Promise<boolean> {
  return access(file).then(
    () => true,
    () => false,
  );
}

export function fontFiles(fonts: readonly FontFile[]): AstroIntegration {
  return {
    name: 'font-files',
    hooks: {
      'astro:config:done': async ({ config, logger }) => {
        for (const font of fonts) {
          const path = `${FONT_ASSETS_DIR}/${font.file}`;
          if (await fileExists(new URL(path, config.root))) continue;
          logger.warn(
            `"${font.family}" ${String(font.weight)} is missing: add ${path} (the browser falls back to system fonts until then).`,
          );
        }
      },
    },
  };
}
