#!/usr/bin/env node --max-old-space-size=512

import('../dist/cli/main.js').then(async ({ runCLI }) => {
  const code = await runCLI(process.argv);
  process.exitCode = code;
}).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
