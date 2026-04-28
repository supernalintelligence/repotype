import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    forceExit: true,
    setupFiles: [path.resolve(__dirname, '../../vitest.setup.ts')],
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
