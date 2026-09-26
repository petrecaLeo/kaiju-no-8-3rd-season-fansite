import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

export interface InlineHashes {
  scripts: string[];
  styles: string[];
}

export interface InlineCodeAudit {
  hashes: InlineHashes;
  violations: string[];
}

// JSON-LD blocks are data, not scripts: the browser never runs them, so they need no hash.
const INLINE_SCRIPT =
  /<script\b(?![^>]*\b(?:src\s*=|type\s*=\s*["']?application\/ld\+json))[^>]*>([\s\S]*?)<\/script>/gi;
const INLINE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const RAW_TEXT_ELEMENT = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const START_TAG =
  /<[a-z][\w-]*((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/gi;
const ATTRIBUTE = /\s+([^\s"'<>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
const UNSAFE_ATTRIBUTE_NAME = /^(?:style|on[a-z]+)$/i;

function toCspHash(content: string): string {
  return `'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`;
}

function collectHashes(html: string, pattern: RegExp, target: Set<string>): void {
  for (const [, content = ''] of html.matchAll(pattern)) {
    if (content.trim() !== '') target.add(toCspHash(content));
  }
}

function findUnsafeAttributes(html: string): string[] {
  const markup = html.replace(RAW_TEXT_ELEMENT, '');
  const unsafe: string[] = [];
  for (const [, attributes = ''] of markup.matchAll(START_TAG)) {
    for (const [, name = ''] of attributes.matchAll(ATTRIBUTE)) {
      if (UNSAFE_ATTRIBUTE_NAME.test(name)) unsafe.push(name);
    }
  }
  return unsafe;
}

async function listHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath, entry.name));
}

export async function auditInlineCode(directory: string): Promise<InlineCodeAudit> {
  const scripts = new Set<string>();
  const styles = new Set<string>();
  const violations: string[] = [];

  for (const file of await listHtmlFiles(directory)) {
    const html = await readFile(file, 'utf8');
    collectHashes(html, INLINE_SCRIPT, scripts);
    collectHashes(html, INLINE_STYLE, styles);
    for (const attribute of findUnsafeAttributes(html)) {
      violations.push(`${relative(directory, file)}: inline "${attribute}" attribute`);
    }
  }

  return { hashes: { scripts: [...scripts].sort(), styles: [...styles].sort() }, violations };
}
