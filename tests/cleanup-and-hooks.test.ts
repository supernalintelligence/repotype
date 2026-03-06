import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCleanup } from '../src/cli/cleanup.js';
import { installChecks } from '../src/cli/git-hooks.js';

function makeRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-hooks-test-'));
  fs.mkdirSync(path.join(root, '.git', 'hooks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'examples', 'schemas'), { recursive: true });
  fs.mkdirSync(path.join(root, 'examples', 'templates'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
templates:
  - id: requirement
    path: examples/templates/requirement.md
files:
  - id: req
    glob: "docs/requirements/**/*.md"
    requiredSections:
      - Description
      - Acceptance Criteria
      - Test Strategy
    template:
      id: requirement
      enforce: true
`,
  );

  fs.writeFileSync(
    path.join(root, 'examples', 'templates', 'requirement.md'),
    `---
id: "REQ-XXX"
title: ""
status: "todo"
---

# {{title}}

## Description

[Description]

## Acceptance Criteria

- [ ] item

## Test Strategy

- unit
`,
  );

  fs.writeFileSync(
    path.join(root, 'docs', 'requirements', 'req-bad.md'),
    `---
id: "REQ-BAD-001"
---

# Missing Bits
`,
  );

  return root;
}

describe('cleanup and hooks', () => {
  it('installs both git hooks idempotently', () => {
    const root = makeRepo();

    const first = installChecks({ target: root, hook: 'both' });
    const second = installChecks({ target: root, hook: 'both' });

    expect(first.hooks.length).toBe(2);
    expect(second.hooks.every((h) => h.status === 'unchanged' || h.status === 'updated')).toBe(true);

    const preCommit = fs.readFileSync(path.join(root, '.git', 'hooks', 'pre-commit'), 'utf8');
    expect(preCommit.includes('repotype validate')).toBe(true);
  });

  it('moves severely invalid files into sort_queue and logs actions', async () => {
    const root = makeRepo();
    const queueDir = path.join(root, 'sort_queue');

    const result = await runCleanup({
      target: root,
      queueDir,
      minErrors: 2,
      dryRun: false,
    });

    expect(result.candidates).toBeGreaterThan(0);
    expect(result.moved).toBeGreaterThan(0);

    const movedFile = path.join(queueDir, 'docs', 'requirements', 'req-bad.md');
    expect(fs.existsSync(movedFile)).toBe(true);
    expect(fs.existsSync(path.join(queueDir, 'cleanup-log.jsonl'))).toBe(true);
    expect(fs.existsSync(path.join(queueDir, 'cleanup-log.md'))).toBe(true);
  });
});
