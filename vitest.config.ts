import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'tests/generated/stories/**',
      'dist/**',
      'node_modules/**',
    ],
  },
});
