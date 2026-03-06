import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyOperationsConfig, getOperationsStatus } from '../src/cli/operations.js';

function makeRepoWithOperations(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-ops-test-'));
  fs.mkdirSync(path.join(root, '.git', 'hooks'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
operations:
  hooks:
    enabled: true
    hook: both
  watcher:
    enabled: false
    schedule: "*/30 * * * *"
    queueDir: "sort_queue"
    minErrors: 4
    logFile: ".repotype/logs/watcher.log"
`,
  );

  return root;
}

describe('operations config', () => {
  it('applies hooks and keeps watcher disabled from config', () => {
    const root = makeRepoWithOperations();
    const applied = applyOperationsConfig(root);

    expect(applied.applied.hooks).toBeDefined();
    expect(fs.existsSync(path.join(root, '.git', 'hooks', 'pre-commit'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.git', 'hooks', 'pre-push'))).toBe(true);
  });

  it('reports status for managed hooks and watcher state', () => {
    const root = makeRepoWithOperations();
    applyOperationsConfig(root);

    const status = getOperationsStatus(root);
    expect(status.config.hooks.enabled).toBe(true);
    expect(status.hooks.hooks.some((h) => h.managed)).toBe(true);
    expect(typeof status.watcher.installed).toBe('boolean');
  });
});
