import { test as base } from '@playwright/test';

import { isolateFromNetwork } from './site';

export { expect } from '@playwright/test';

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await isolateFromNetwork(context, baseURL ?? '');
    await use(context);
  },
});
