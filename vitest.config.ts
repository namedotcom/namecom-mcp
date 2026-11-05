import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // The entry point is exercised through the integration tests.
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      reporter: ['text', 'lcov', 'html', 'cobertura'],
      reportsDirectory: 'coverage',
    },
  },
});
