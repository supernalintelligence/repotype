import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { GitignorePolicyAdapter } from '../src/adapters/gitignore-policy-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function makeContext(): ValidatorContext {
  return {} as ValidatorContext;
}

function codes(diagnostics: { code: string }[]): string[] {
  return diagnostics.map((d) => d.code);
}

function groupIds(diagnostics: { details?: Record<string, unknown> }[]): string[] {
  return diagnostics
    .filter((d) => (d as { code: string }).code === 'missing_gitignore_coverage')
    .map((d) => d.details?.group as string);
}

describe('GitignorePolicyAdapter — required coverage', () => {
  const adapter = new GitignorePolicyAdapter();
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function writeGitignore(content: string): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-gitignore-test-'));
    tmpDirs.push(dir);
    const file = path.join(dir, '.gitignore');
    fs.writeFileSync(file, content);
    return file;
  }

  it('flags every required group as missing on an empty .gitignore', async () => {
    const file = writeGitignore('');
    const diagnostics = await adapter.validate(file, makeContext());
    const missing = groupIds(diagnostics);
    expect(missing).toEqual(
      expect.arrayContaining([
        'node_modules',
        'build-output',
        'os-junk',
        'local-env',
        'log-artifacts',
        'board-storage',
      ]),
    );
    expect(diagnostics.every((d) => d.severity === 'error' || d.code === 'dangerous_ignore_pattern')).toBe(true);
  });

  it('does not flag a group once a covering line is present', async () => {
    const file = writeGitignore(
      'node_modules/\n.next/\ndist/\n.DS_Store\n.env.local\n*.log\n.supernal-local/\n',
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(groupIds(diagnostics)).toEqual([]);
  });

  it('accepts .supernal-local as coverage for log artifacts (ralph logs live there)', async () => {
    const file = writeGitignore(
      'node_modules/\n.next/\n.DS_Store\n.env.local\n.supernal-local/\n',
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(groupIds(diagnostics)).not.toContain('log-artifacts');
  });

  it('flags missing board-storage coverage independently of log-artifacts', async () => {
    // *.log alone covers log-artifacts but NOT board-storage (a narrower rule doesn't
    // imply the whole .supernal-local/ dir is ignored) -- board-owned runtime DB/cache/
    // storage/asset dirs must be blanket-excluded on their own.
    const file = writeGitignore('node_modules/\n.next/\n.DS_Store\n.env.local\n*.log\n');
    const diagnostics = await adapter.validate(file, makeContext());
    expect(groupIds(diagnostics)).toContain('board-storage');
    expect(groupIds(diagnostics)).not.toContain('log-artifacts');
  });

  it('a narrow per-file .supernal-local rule does NOT satisfy board-storage (must be blanket)', async () => {
    const file = writeGitignore(
      'node_modules/\n.next/\n.DS_Store\n.env.local\n*.log\n.supernal-local/rules-state.json\n',
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(groupIds(diagnostics)).toContain('board-storage');
  });

  it('accepts a blanket .supernal-local/ rule (with or without trailing slash) as board-storage coverage', async () => {
    const withSlash = writeGitignore(
      'node_modules/\n.next/\n.DS_Store\n.env.local\n*.log\n.supernal-local/\n',
    );
    expect(groupIds(await adapter.validate(withSlash, makeContext()))).not.toContain('board-storage');

    const noSlash = writeGitignore(
      'node_modules/\n.next/\n.DS_Store\n.env.local\n*.log\n.supernal-local\n',
    );
    expect(groupIds(await adapter.validate(noSlash, makeContext()))).not.toContain('board-storage');
  });

  it('still flags dangerous ralph-artifact patterns alongside the new coverage check', async () => {
    const file = writeGitignore('.ralph-logs/\n');
    const diagnostics = await adapter.validate(file, makeContext());
    expect(codes(diagnostics)).toContain('dangerous_ignore_pattern');
    expect(codes(diagnostics)).toContain('missing_gitignore_coverage');
  });

  it('a fully-covered real-world-shaped .gitignore produces zero coverage diagnostics', async () => {
    const file = writeGitignore(
      [
        'node_modules',
        'dist',
        '.next',
        '.DS_Store',
        '.env*',
        '.env*.local',
        '*.log',
        '.ralph-log-*.jsonl',
        '.supernal-local/',
      ].join('\n'),
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(groupIds(diagnostics)).toEqual([]);
  });
});
