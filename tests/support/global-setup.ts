import { LOCAL_SITE, REMOTE_BASE_URL } from './local-site';
import { startPagesServer } from './pages-server';

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (REMOTE_BASE_URL !== undefined) return () => Promise.resolve();

  const server = await startPagesServer(LOCAL_SITE.root, LOCAL_SITE.port);
  return () =>
    new Promise((closed) => {
      server.close(() => {
        closed();
      });
    });
}
