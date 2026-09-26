import type { APIRoute } from 'astro';

import { buildWebManifest } from '@/seo/web-manifest';

export const GET: APIRoute = () =>
  new Response(buildWebManifest(), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
