export const LOCAL_SITE = {
  root: 'dist',
  port: 4329,
} as const;

export const LOCAL_BASE_URL = `http://127.0.0.1:${String(LOCAL_SITE.port)}`;

// With BASE_URL set (the deployed site, for instance) the suite runs against it and no local
// server starts.
export const REMOTE_BASE_URL = process.env.BASE_URL;
