import { defineConfig } from 'vitest/config';

// Define projects for monorepo (Vitest 4.x approach)
export default defineConfig({
  test: {
    projects: [
      {
        extends: './packages/ui/vitest.config.mts',
        test: {
          name: 'ui',
          root: './packages/ui',
        },
      },
      {
        extends: './packages/kaoto-web/vitest.config.mts',
        test: {
          name: 'kaoto-web',
          root: './packages/kaoto-web',
        },
      },
    ],
  },
});
