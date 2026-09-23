import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Setup and teardown in-memory MongoDB in worker environment
    setupFiles: ['./vitest.setup.js'],
    // Each test file gets an isolated module scope
    isolate: true,
    // Longer timeout for DB operations in slower CI environments
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
