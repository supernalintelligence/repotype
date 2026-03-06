import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { testCLI } from '@supernal/universal-command/testing';
import {
  repotypePluginsStatusCommand,
  repotypeReportCommand,
  repotypeStatusCommand,
  repotypeValidateCommand,
} from '../src/universal-commands.js';

function makeRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-uc-test-'));
  fs.mkdirSync(path.join(root, 'examples', 'templates'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
templates:
  - id: requirement
    path: examples/templates/requirement.md
files:
  - glob: "docs/requirements/**/*.md"
    requiredSections:
      - Description
`,
  );

  fs.writeFileSync(path.join(root, 'examples', 'templates', 'requirement.md'), '## Description\n');
  fs.writeFileSync(path.join(root, 'docs', 'requirements', 'req-bad.md'), '# Missing\n');
  return root;
}

describe('universal-command testing integration', () => {
  it('runs repotype validate command via universal test harness', async () => {
    const root = makeRepo();
    const result = await testCLI(repotypeValidateCommand as any, {
      args: ['--target', root],
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('"ok"');
    expect(result.stdout).toContain('false');
  });

  it('runs repotype status command via universal test harness', async () => {
    const root = makeRepo();
    fs.mkdirSync(path.join(root, '.git', 'hooks'), { recursive: true });
    const result = await testCLI(repotypeStatusCommand as any, {
      args: ['--target', root],
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('"repoRoot"');
  });

  it('runs repotype report command via universal test harness', async () => {
    const root = makeRepo();
    const result = await testCLI(repotypeReportCommand as any, {
      args: ['--target', root, '--format', 'json'],
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('"report"');
    expect(result.stdout).toContain('"filesScanned"');
  });

  it('runs repotype plugins status via universal test harness', async () => {
    const root = makeRepo();
    const result = await testCLI(repotypePluginsStatusCommand as any, {
      args: ['--target', root],
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toContain('"plugins"');
  });
});
