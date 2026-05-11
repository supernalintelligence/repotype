#!/usr/bin/env node

import('../dist/mcp.js').then(async ({ startMCPServer }) => {
  await startMCPServer();
}).catch((error) => {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n');
  process.exit(1);
});
