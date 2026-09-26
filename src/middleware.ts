import { defineMiddleware } from 'astro:middleware';

import { getLocalizedNotFoundPath } from '@/lib/not-found/not-found-page';

// Dev only: the dev server renders the root 404 for every missing URL, while the host serves the
// 404.html of the locale folder. The static build never reaches this branch.
export const onRequest = defineMiddleware(async (context, next) => {
  const localizedPath =
    import.meta.env.DEV && context.routePattern === '/404'
      ? getLocalizedNotFoundPath(context.url.pathname)
      : undefined;
  if (localizedPath === undefined) return next();

  const response = await next(localizedPath);
  return new Response(response.body, { status: 404, headers: response.headers });
});
