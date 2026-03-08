import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      'tests/generated/stories/**',
      'tests/generated/universal-cli.generated.test.ts', // TODO: Fix commander resolution
      'dist/**',
      'node_modules/**',
      'docs-site/**',
      '**/node_modules/**',
    ],
  },
});
