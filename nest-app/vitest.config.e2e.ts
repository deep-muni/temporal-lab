import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e.spec.ts'],
    globalSetup: ['./test/vitest-e2e-global-setup.ts'],
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
