import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global setup/teardown: start in-memory MongoDB before all test files, stop after
    globalSetup: './vitest.setup.js',
    // Each test file gets an isolated module scope
    isolate: true,
    // Longer timeout for DB operations in slower CI environments
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
