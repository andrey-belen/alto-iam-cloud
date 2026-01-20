// AICODE-NOTE: Vitest configuration for MFA Email OTP integration tests
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 60000, // 60 seconds for setup/teardown
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.ts',
        'fixtures/**',
      ],
    },
    reporters: ['verbose'],
    sequence: {
      shuffle: false, // Run tests in order for MFA flow
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@fixtures': resolve(__dirname, './fixtures'),
    },
  },
});
