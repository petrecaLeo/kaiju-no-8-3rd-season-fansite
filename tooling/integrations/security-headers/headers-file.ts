import type { InlineHashes } from './inline-code';
import {
  CACHE_RULES,
  CONTENT_SECURITY_POLICY,
  DEFAULT_CACHE_CONTROL,
  SECURITY_HEADERS,
} from './policy';

function serializePolicy(hashes: InlineHashes): string {
  const directives: Record<string, readonly string[]> = {
    ...CONTENT_SECURITY_POLICY,
    'script-src': [...CONTENT_SECURITY_POLICY['script-src'], ...hashes.scripts],
    'style-src': [...CONTENT_SECURITY_POLICY['style-src'], ...hashes.styles],
  };
  return Object.entries(directives)
    .map(([directive, sources]) => [directive, ...sources].join(' '))
    .join('; ');
}

function renderRule(path: string, lines: readonly string[]): string {
  return [path, ...lines.map((line) => `  ${line}`)].join('\n');
}

function toHeaderLines(headers: Record<string, string>): string[] {
  return Object.entries(headers).map(([name, value]) => `${name}: ${value}`);
}

// Cloudflare Pages applies every rule that matches, in file order, and joins a header set twice
// with a comma. The specific rules detach the default Cache-Control ("! Cache-Control") first.
export function renderHeadersFile(hashes: InlineHashes): string {
  const rules = [
    renderRule(
      '/*',
      toHeaderLines({
        'Content-Security-Policy': serializePolicy(hashes),
        ...SECURITY_HEADERS,
        'Cache-Control': DEFAULT_CACHE_CONTROL,
      }),
    ),
    ...CACHE_RULES.flatMap(({ paths, cacheControl }) =>
      paths.map((path) => renderRule(path, ['! Cache-Control', `Cache-Control: ${cacheControl}`])),
    ),
  ];
  return `${rules.join('\n\n')}\n`;
}
