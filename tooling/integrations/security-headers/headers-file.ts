import type { InlineHashes } from './inline-code';
import { CACHE_RULES, CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from './policy';

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

function renderRule(path: string, headers: Record<string, string>): string {
  const lines = Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`);
  return [path, ...lines].join('\n');
}

export function renderHeadersFile(hashes: InlineHashes): string {
  const rules = [
    renderRule('/*', { 'Content-Security-Policy': serializePolicy(hashes), ...SECURITY_HEADERS }),
    ...CACHE_RULES.map(({ path, cacheControl }) =>
      renderRule(path, { 'Cache-Control': cacheControl }),
    ),
  ];
  return `${rules.join('\n\n')}\n`;
}
