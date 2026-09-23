import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { BoardGeneratedPathsGitignoreAdapter } from '../src/adapters/board-generated-paths-gitignore-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function makeContext(repoRoot: string): ValidatorContext {
  return { repoRoot } as ValidatorContext;
}

function codes(diagnostics: { code: string }[]): string[] {
  return diagnostics.map((d) => d.code);
}

describe('BoardGeneratedPathsGitignoreAdapter', () => {
  const adapter = new BoardGeneratedPathsGitignoreAdapter();
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function makeRepo(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-generated-paths-test-'));
    tmpDirs.push(dir);
    return dir;
  }

  function writeModuleYaml(repoRoot: string, boardId: string, content: string): string {
    const boardDir = path.join(repoRoot, 'packages', 'modules', boardId);
    fs.mkdirSync(boardDir, { recursive: true });
    const file = path.join(boardDir, 'module.yaml');
    fs.writeFileSync(file, content);
    return file;
  }

  it('supports() matches module.yaml, not other files', () => {
    expect(adapter.supports('packages/modules/foo/module.yaml', {} as ValidatorContext)).toBe(true);
    expect(adapter.supports('module.yaml', {} as ValidatorContext)).toBe(true);
    expect(adapter.supports('packages/modules/foo/board.yaml', {} as ValidatorContext)).toBe(false);
  });

  it('is a no-op when storage.generated_paths is absent', async () => {
    const repoRoot = makeRepo();
    const file = writeModuleYaml(
      repoRoot,
      'no-generated-paths',
      'id: "no-generated-paths"\nstorage:\n  database: true\n  paths:\n    - .supernal/modules/no-generated-paths/\n',
    );
    const diagnostics = await adapter.validate(file, makeContext(repoRoot));
    expect(diagnostics).toEqual([]);
  });

  it('flags a declared generated_paths entry with NO covering .gitignore rule', async () => {
    const repoRoot = makeRepo();
    const boardId = 'uncovered-board';
    const file = writeModuleYaml(
      repoRoot,
      boardId,
      `id: "${boardId}"\nstorage:\n  database: true\n  paths: []\n  generated_paths:\n    - .supernal/boards/${boardId}/experiments/\n`,
    );
    // No .gitignore anywhere covering experiments/ — declared but not ignored.
    const diagnostics = await adapter.validate(file, makeContext(repoRoot));
    expect(codes(diagnostics)).toContain('board_generated_path_not_ignored');
  });

  it('does not flag a declared generated_paths entry that IS covered by a real .gitignore rule', async () => {
    const repoRoot = makeRepo();
    const boardId = 'covered-board';
    const boardDir = path.join(repoRoot, 'packages', 'modules', boardId);
    fs.mkdirSync(boardDir, { recursive: true });
    fs.writeFileSync(path.join(boardDir, '.gitignore'), 'agent/checkpoints/\nagent/runs/\n');
    const file = writeModuleYaml(
      repoRoot,
      boardId,
      `id: "${boardId}"\nstorage:\n  database: true\n  paths: []\n  generated_paths:\n    - packages/modules/${boardId}/agent/checkpoints/\n    - packages/modules/${boardId}/agent/runs/\n`,
    );
    const diagnostics = await adapter.validate(file, makeContext(repoRoot));
    expect(codes(diagnostics)).not.toContain('board_generated_path_not_ignored');
    expect(diagnostics).toEqual([]);
  });

  it('flags a non-string/empty entry in generated_paths', async () => {
    const repoRoot = makeRepo();
    const boardId = 'bad-entry-board';
    const file = writeModuleYaml(
      repoRoot,
      boardId,
      `id: "${boardId}"\nstorage:\n  database: true\n  paths: []\n  generated_paths:\n    - ""\n`,
    );
    const diagnostics = await adapter.validate(file, makeContext(repoRoot));
    expect(codes(diagnostics)).toContain('board_generated_path_invalid');
  });

  it('is a no-op when module.yaml has no storage block at all', async () => {
    const repoRoot = makeRepo();
    const file = writeModuleYaml(repoRoot, 'no-storage-board', 'id: "no-storage-board"\nlabel: "No Storage"\n');
    const diagnostics = await adapter.validate(file, makeContext(repoRoot));
    expect(diagnostics).toEqual([]);
  });
});
