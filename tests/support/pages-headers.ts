type HeaderOperation =
  { kind: 'set'; name: string; value: string } | { kind: 'detach'; name: string };

export interface HeaderRule {
  pattern: RegExp;
  operations: HeaderOperation[];
}

function toPattern(path: string): RegExp {
  const escaped = path
    .split('*')
    .map((part) => part.replaceAll(/[.+?^${}()|[\]\\]/g, String.raw`\$&`));
  return new RegExp(`^${escaped.join('.*')}$`);
}

function toOperation(entry: string): HeaderOperation {
  if (entry.startsWith('!')) return { kind: 'detach', name: entry.slice(1).trim().toLowerCase() };

  const separator = entry.indexOf(':');
  return {
    kind: 'set',
    name: entry.slice(0, separator).trim().toLowerCase(),
    value: entry.slice(separator + 1).trim(),
  };
}

// Cloudflare Pages `_headers`: an unindented line opens a rule for a path (with `*` splats), the
// indented lines under it set headers or detach them with `! Name`.
export function parseHeadersFile(source: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  for (const line of source.split('\n')) {
    const entry = line.trim();
    if (entry === '' || entry.startsWith('#')) continue;

    if (line === line.trimStart()) {
      rules.push({ pattern: toPattern(entry), operations: [] });
    } else {
      rules.at(-1)?.operations.push(toOperation(entry));
    }
  }
  return rules;
}

// Every matching rule applies in file order; a header set twice is joined with a comma, as
// Cloudflare does, which is why the specific rules detach Cache-Control first.
export function resolveHeaders(
  rules: readonly HeaderRule[],
  pathname: string,
): Map<string, string> {
  const headers = new Map<string, string>();
  for (const rule of rules) {
    if (!rule.pattern.test(pathname)) continue;

    for (const operation of rule.operations) {
      if (operation.kind === 'detach') {
        headers.delete(operation.name);
        continue;
      }
      const current = headers.get(operation.name);
      headers.set(
        operation.name,
        current === undefined ? operation.value : `${current}, ${operation.value}`,
      );
    }
  }
  return headers;
}
