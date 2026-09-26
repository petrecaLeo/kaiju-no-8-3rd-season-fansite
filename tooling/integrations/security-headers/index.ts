import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import { renderHeadersFile } from './headers-file';
import { auditInlineCode } from './inline-code';

const HEADERS_FILE = '_headers';

export function securityHeaders(): AstroIntegration {
  return {
    name: 'security-headers',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (existsSync(new URL(HEADERS_FILE, config.publicDir))) {
          throw new Error(
            `public/${HEADERS_FILE} would be overwritten at build time. Declare headers in tooling/integrations/security-headers/policy.ts instead.`,
          );
        }
      },
      'astro:build:done': async ({ dir, logger }) => {
        const { hashes, violations } = await auditInlineCode(fileURLToPath(dir));

        if (violations.length > 0) {
          throw new Error(
            `Inline attributes are blocked by the Content-Security-Policy:\n${violations.join('\n')}`,
          );
        }

        await writeFile(new URL(HEADERS_FILE, dir), renderHeadersFile(hashes));
        logger.info(
          `${HEADERS_FILE} written with ${String(hashes.scripts.length)} script and ${String(hashes.styles.length)} style hash(es).`,
        );
      },
    },
  };
}
