import { defineConfig, devices } from '@playwright/test';

import { LOCAL_BASE_URL, REMOTE_BASE_URL } from './tests/support/local-site';

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/support/global-setup.ts',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI === undefined ? 0 : 1,
  reporter: 'list',
  use: {
    baseURL: REMOTE_BASE_URL ?? LOCAL_BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
