import { readFile, stat } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import path from 'node:path';

import { type HeaderRule, parseHeadersFile, resolveHeaders } from './pages-headers';

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

interface Resolution {
  status: number;
  file?: string;
  location?: string;
}

async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

// The closest 404.html going up from the requested folder, as Cloudflare Pages looks it up.
async function findNotFoundPage(root: string, pathname: string): Promise<string | undefined> {
  let folder = pathname.endsWith('/')
    ? path.join(root, pathname)
    : path.dirname(path.join(root, pathname));
  while (folder.startsWith(root)) {
    const page = path.join(folder, '404.html');
    if (await isFile(page)) return page;
    if (folder === root) return undefined;
    folder = path.dirname(folder);
  }
  return undefined;
}

async function resolve(root: string, pathname: string): Promise<Resolution> {
  const target = path.join(root, pathname);
  if (target.startsWith(root)) {
    if (pathname.endsWith('/')) {
      const index = path.join(target, 'index.html');
      if (await isFile(index)) return { status: 200, file: index };
    } else if (await isFile(target)) {
      return { status: 200, file: target };
    } else if (await isFile(path.join(target, 'index.html'))) {
      return { status: 308, location: `${pathname}/` };
    }
  }
  const notFound = await findNotFoundPage(root, pathname);
  return notFound === undefined ? { status: 404 } : { status: 404, file: notFound };
}

async function readRules(root: string): Promise<HeaderRule[]> {
  try {
    return parseHeadersFile(await readFile(path.join(root, '_headers'), 'utf8'));
  } catch {
    throw new Error(`No _headers in ${root}. Run "npm run build" before the E2E tests.`);
  }
}

// A local stand-in for Cloudflare Pages: static files, trailing-slash redirects, the nearest
// 404.html with status 404 and the `_headers` rules on every response.
export async function startPagesServer(root: string, port: number): Promise<Server> {
  const siteRoot = path.resolve(root);
  const rules = await readRules(siteRoot);

  const server = createServer((request, response) => {
    const { pathname, search } = new URL(request.url ?? '/', 'http://localhost');
    void resolve(siteRoot, decodeURI(pathname)).then(async (resolution) => {
      for (const [name, value] of resolveHeaders(rules, pathname)) response.setHeader(name, value);
      if (resolution.location !== undefined) {
        response.writeHead(resolution.status, { location: `${resolution.location}${search}` });
        response.end();
        return;
      }
      if (resolution.file === undefined) {
        response.writeHead(resolution.status).end();
        return;
      }
      const type = CONTENT_TYPES[path.extname(resolution.file)] ?? 'application/octet-stream';
      response.writeHead(resolution.status, { 'content-type': type });
      response.end(request.method === 'HEAD' ? undefined : await readFile(resolution.file));
    });
  });

  await new Promise<void>((ready) => server.listen(port, '127.0.0.1', ready));
  return server;
}
