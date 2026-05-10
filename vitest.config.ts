import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    // Resolve @supernal/universal-command (and all its subpaths) to the CJS
    // builds so that toCLI()'s internal require('commander') works under
    // vitest's ESM environment.
    alias: [
      {
        // Subpaths like @supernal/universal-command/testing → dist/<sub>/index.cjs
        find: /^@supernal\/universal-command\/(.+)$/,
        replacement: path.resolve(
          __dirname,
          "node_modules/@supernal/universal-command/dist/$1/index.cjs",
        ),
      },
      {
        // Root import → dist/index.cjs
        find: "@supernal/universal-command",
        replacement: path.resolve(
          __dirname,
          "node_modules/@supernal/universal-command/dist/index.cjs",
        ),
      },
    ],
  },
  test: {
    forceExit: true,
    setupFiles: [path.resolve(__dirname, "../../vitest.setup.ts")],
    exclude: [
      "tests/generated/stories/**",
      "tests/generated/universal-cli.generated.test.ts", // TODO: Fix commander resolution
      "dist/**",
      "node_modules/**",
      "docs-site/**",
      "**/node_modules/**",
    ],
  },
});
