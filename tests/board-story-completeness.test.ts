import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { BoardStoryCompletenessAdapter } from '../src/adapters/board-story-completeness-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function makeBoardDir(base: string, boardName: string, withStories?: 'empty' | 'with-feature' | 'none'): string {
  const boardsDir = path.join(base, 'packages', 'boards', boardName);
  fs.mkdirSync(boardsDir, { recursive: true });
  if (withStories === 'empty') {
    fs.mkdirSync(path.join(boardsDir, 'stories'), { recursive: true });
  } else if (withStories === 'with-feature') {
    const storiesDir = path.join(boardsDir, 'stories');
    fs.mkdirSync(storiesDir, { recursive: true });
    fs.writeFileSync(path.join(storiesDir, `${boardName}.feature`), `Feature: ${boardName}\n  Scenario: loads\n    Given I am on the board\n`);
  }
  const boardYaml = path.join(boardsDir, 'board.yaml');
  fs.writeFileSync(boardYaml, `id: ${boardName}\ntitle: Test\n`);
  return boardYaml;
}

function makeContext(): ValidatorContext {
  return {} as ValidatorContext;
}

describe('BoardStoryCompletenessAdapter', () => {
  const adapter = new BoardStoryCompletenessAdapter();
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function tmp(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-test-'));
    tmpDirs.push(dir);
    return dir;
  }

  it('ignores non-board.yaml files', () => {
    const base = tmp();
    const notBoard = path.join(base, 'packages', 'boards', 'my-board', 'something.yaml');
    fs.mkdirSync(path.dirname(notBoard), { recursive: true });
    fs.writeFileSync(notBoard, 'id: test');
    expect(adapter.supports(notBoard, makeContext())).toBe(false);
  });

  it('ignores board.yaml outside packages/boards/', () => {
    const base = tmp();
    const notInBoards = path.join(base, 'packages', 'other', 'my-board', 'board.yaml');
    fs.mkdirSync(path.dirname(notInBoards), { recursive: true });
    fs.writeFileSync(notInBoards, 'id: test');
    expect(adapter.supports(notInBoards, makeContext())).toBe(false);
  });

  it('ignores infrastructure dirs (lib, scripts, __mocks__, etc.)', () => {
    const base = tmp();
    for (const skip of ['lib', 'scripts', '__mocks__', '__system__', 'agents']) {
      const boardYaml = path.join(base, 'packages', 'boards', skip, 'board.yaml');
      fs.mkdirSync(path.dirname(boardYaml), { recursive: true });
      fs.writeFileSync(boardYaml, 'id: test');
      expect(adapter.supports(boardYaml, makeContext())).toBe(false);
    }
  });

  it('supports board.yaml inside packages/boards/<name>/', () => {
    const base = tmp();
    const boardYaml = makeBoardDir(base, 'my-board', 'with-feature');
    expect(adapter.supports(boardYaml, makeContext())).toBe(true);
  });

  it('errors when stories/ directory is missing', async () => {
    const base = tmp();
    const boardYaml = makeBoardDir(base, 'ghost-board', 'none');
    const diagnostics = await adapter.validate(boardYaml, makeContext());
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('board_story_missing');
    expect(diagnostics[0].severity).toBe('error');
    expect(diagnostics[0].message).toContain('ghost-board');
  });

  it('errors when stories/ directory exists but has no .feature files', async () => {
    const base = tmp();
    const boardYaml = makeBoardDir(base, 'empty-stories-board', 'empty');
    const diagnostics = await adapter.validate(boardYaml, makeContext());
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('board_story_empty');
    expect(diagnostics[0].severity).toBe('error');
  });

  it('passes when stories/ has at least one .feature file', async () => {
    const base = tmp();
    const boardYaml = makeBoardDir(base, 'complete-board', 'with-feature');
    const diagnostics = await adapter.validate(boardYaml, makeContext());
    expect(diagnostics).toHaveLength(0);
  });
});
