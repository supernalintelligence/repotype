/**
 * Board story completeness adapter
 *
 * Every board in packages/boards/ that has a board.yaml MUST have at least one
 * .feature file under a stories/ sibling directory. Boards without stories cannot
 * be considered complete — they have no test coverage and no simulation harness entry.
 *
 * Rule ID: board-story-required
 * Severity: error — boards without stories fail lint
 *
 * Fires on: board.yaml files inside packages/boards/<name>/
 * Checks: sibling stories/ directory exists AND contains at least one .feature file
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

const BOARDS_DIR_SEGMENT = `${path.sep}packages${path.sep}boards${path.sep}`;
const BOARDS_DIR_SEGMENT_FWD = '/packages/boards/';

function isBoardYaml(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return (
    normalized.includes(BOARDS_DIR_SEGMENT_FWD) &&
    (normalized.endsWith('/board.yaml') || normalized === 'board.yaml')
  );
}

function boardNameFromPath(filePath: string): string {
  return path.basename(path.dirname(filePath));
}

/** Directories that are infrastructure, not user-facing boards. */
const SKIP_DIRS = new Set([
  '__mocks__',
  '__system__',
  'lib',
  'lib-dist',
  'scripts',
  'specs',
  'agents',
  'doc-folder',
]);

export class BoardStoryCompletenessAdapter implements ValidatorAdapter {
  id = 'board-story-required';

  supports(filePath: string, _context: ValidatorContext): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    if (!isBoardYaml(normalized)) return false;
    const boardName = boardNameFromPath(filePath);
    return !SKIP_DIRS.has(boardName);
  }

  async validate(filePath: string, _context: ValidatorContext): Promise<Diagnostic[]> {
    const boardDir = path.dirname(filePath);
    const boardName = boardNameFromPath(filePath);
    const storiesDir = path.join(boardDir, 'stories');

    // stories/ directory must exist
    if (!fs.existsSync(storiesDir) || !fs.statSync(storiesDir).isDirectory()) {
      return [
        {
          code: 'board_story_missing',
          message: `Board '${boardName}' has no stories/ directory. Every board must have at least one .feature file in stories/. Run the Story Generation Agent to create it.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { boardName, expectedDir: storiesDir },
        },
      ];
    }

    // stories/ must contain at least one .feature file
    const featureFiles = fs
      .readdirSync(storiesDir)
      .filter((f) => f.endsWith('.feature'));

    if (featureFiles.length === 0) {
      return [
        {
          code: 'board_story_empty',
          message: `Board '${boardName}' has a stories/ directory but no .feature files. Add at least one .feature file or run the Story Generation Agent.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { boardName, storiesDir },
        },
      ];
    }

    return [];
  }
}
