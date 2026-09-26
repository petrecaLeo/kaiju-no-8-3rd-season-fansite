import type { APIRoute } from 'astro';

import { buildRobotsTxt } from '@/seo/robots';

export const GET: APIRoute = ({ site, url }) =>
  new Response(buildRobotsTxt(site ?? url), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
