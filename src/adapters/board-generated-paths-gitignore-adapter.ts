/**
 * board-generated-paths-gitignore adapter
 *
 * Lints module.yaml's storage.generated_paths declaration against real
 * .gitignore coverage. A board declares which of its own directories hold
 * large/regenerable output (ML experiment runs, checkpoints, training logs)
 * via storage.generated_paths (repo-root-relative, sibling of storage.paths —
 * see packages/modules/CLAUDE.md's Board STORAGE Declaration section). This
 * adapter fails when a declared path is NOT actually covered by a .gitignore
 * rule, so the declaration can't silently drift from the real ignore state.
 *
 * Root incident this exists to prevent recurring: jev-lab's own experiments/
 * directory accumulated 39,777 untracked files (63GB) that blew the
 * SessionEnd hook's 30s timeout via `git add -A` — fixed with a hand-written
 * board-local .gitignore line, with no mechanism checking such a line stays
 * in sync with what a board actually declares it generates.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';
import { createIgnoreMatcher } from '../core/path-ignore.js';

function isBoardYaml(filePath: string): boolean {
  return filePath.endsWith('/module.yaml') || filePath === 'module.yaml';
}

export class BoardGeneratedPathsGitignoreAdapter implements ValidatorAdapter {
  id = 'board-generated-paths-gitignore';

  supports(filePath: string, _context: ValidatorContext): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    return isBoardYaml(normalized);
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, 'utf8');
    } catch {
      // board-yaml-completeness-adapter already reports unreadable/invalid
      // module.yaml files — this adapter only adds the generated_paths check.
      return diagnostics;
    }

    let doc: Record<string, unknown>;
    try {
      const parsed = yaml.load(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return diagnostics;
      }
      doc = parsed as Record<string, unknown>;
    } catch {
      return diagnostics;
    }

    const storage = doc['storage'];
    if (typeof storage !== 'object' || storage === null || Array.isArray(storage)) {
      return diagnostics;
    }

    const generatedPaths = (storage as Record<string, unknown>)['generated_paths'];
    if (!Array.isArray(generatedPaths) || generatedPaths.length === 0) {
      return diagnostics;
    }

    const repoRoot = context.repoRoot;
    if (!repoRoot) {
      diagnostics.push({
        code: 'board_generated_paths_no_repo_root',
        severity: 'warning',
        file: filePath,
        message:
          'storage.generated_paths is declared but no repoRoot was available to check .gitignore coverage against.',
        ruleId: this.id,
      });
      return diagnostics;
    }

    const matcher = createIgnoreMatcher(repoRoot);

    for (const entry of generatedPaths) {
      if (typeof entry !== 'string' || entry.trim().length === 0) {
        diagnostics.push({
          code: 'board_generated_path_invalid',
          severity: 'error',
          file: filePath,
          message: `storage.generated_paths contains a non-string or empty entry: ${JSON.stringify(entry)}.`,
          ruleId: this.id,
          details: { entry },
        });
        continue;
      }

      const relativePath = entry.replace(/^\/+/, '').replace(/\/+$/, '');
      const absolutePath = path.join(repoRoot, relativePath);

      if (!matcher.isIgnored(absolutePath)) {
        diagnostics.push({
          code: 'board_generated_path_not_ignored',
          severity: 'error',
          file: filePath,
          message: `storage.generated_paths declares "${entry}" but it is not covered by any .gitignore rule. A declared generated path must actually be ignored, or it can balloon into a large untracked tree (see jev-lab's experiments/ incident) with nothing catching the drift.`,
          ruleId: this.id,
          details: { path: entry },
        });
      }
    }

    return diagnostics;
  }
}
