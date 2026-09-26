import { rename, rmdir } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AstroIntegration } from 'astro';

const NESTED_NOT_FOUND = /^\/?(.+)\/404\/?$/;
const INTERNAL_OR_FILE_PATH = /^\/[_@./]|\/[^/]+\.\w+$/;

// Static hosts answer /pt-BR/missing (no trailing slash) with the closest 404.html, but with
// trailingSlash: 'always' the dev server rejects it with Astro's own page before any route runs.
function appendTrailingSlash(
  request: IncomingMessage,
  _response: ServerResponse,
  next: () => void,
) {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (!url.pathname.endsWith('/') && !INTERNAL_OR_FILE_PATH.test(url.pathname)) {
    request.url = `${url.pathname}/${url.search}`;
  }
  next();
}

// Astro writes only the root 404 as 404.html; a nested one becomes <dir>/404/index.html. Hosts
// that look for the 404.html closest to the missing URL (Cloudflare Pages) need <dir>/404.html.
export function notFoundPages(): AstroIntegration {
  return {
    name: 'not-found-pages',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        if (command !== 'dev') return;
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'not-found-pages:dev-trailing-slash',
                // Runs after Astro's own post hook, so this lands ahead of its trailing slash check.
                configureServer: (server) => () => {
                  server.middlewares.stack.unshift({ route: '', handle: appendTrailingSlash });
                },
              },
            ],
          },
        });
      },
      'astro:build:done': async ({ dir, pages, logger }) => {
        for (const { pathname } of pages) {
          const directory = NESTED_NOT_FOUND.exec(pathname)?.[1];
          if (directory === undefined) continue;
          await rename(
            new URL(`${directory}/404/index.html`, dir),
            new URL(`${directory}/404.html`, dir),
          );
          await rmdir(new URL(`${directory}/404/`, dir));
          logger.info(`${directory}/404.html`);
        }
      },
    },
  };
}
