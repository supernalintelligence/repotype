/**
 * SentinelContentAdapter — diff-aware validator that checks required sentinel
 * strings are present in the STAGED content of a file before it is committed.
 *
 * Configuration (added to FileRule in types.ts):
 *   requireSentinels?: string[]            — strings that must be present
 *   sentinelOverrideEnvVar?: string        — env var that bypasses the check
 *   sentinelDeletionThreshold?: number     — max deleted lines before blocking
 *
 * DIFF-AWARE: The adapter only fires when the file is in the git staging area
 * (git diff --cached --name-only). If a file is not staged, the adapter
 * returns [] immediately without reading file content. This means:
 *   - Manual `repotype validate` runs → no staged files → adapter skips
 *   - CI `repotype validate` runs → no staged files → adapter skips
 *   - Pre-commit hook runs → staged files present → adapter checks them
 *
 * This behavior is intentional and mirrors the bash locked-patterns-sentinel
 * guard that this adapter replaces.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';
import { getStagedFiles, wasGitUnavailable } from './git-staged-cache.js';

const ENV_VAR_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

export class SentinelContentAdapter implements ValidatorAdapter {
  id = 'sentinel-content';

  supports(_filePath: string, context: ValidatorContext): boolean {
    return context.ruleSet.fileRules.some(
      (rule) => Array.isArray(rule.requireSentinels) && rule.requireSentinels.length > 0,
    );
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const relPath = context.ruleSet.filePath;
    const repoRoot = context.repoRoot;

    // Check if git is available; if not, fall back to working-tree read
    const gitUnavailable = wasGitUnavailable(repoRoot);

    // Get the set of staged files
    const stagedFiles = getStagedFiles(repoRoot);

    let content: Buffer;

    if (gitUnavailable) {
      // Emit warning and fall back to working-tree content
      diagnostics.push({
        code: 'sentinel_git_unavailable',
        message: `git index unavailable for ${relPath}; falling back to working-tree read for sentinel checks.`,
        severity: 'warning',
        file: filePath,
      });
      try {
        content = fs.readFileSync(filePath);
      } catch {
        // File doesn't exist on disk either — nothing to check
        return diagnostics;
      }
    } else if (!stagedFiles.has(relPath)) {
      // File is not staged — skip silently (diff-aware gate)
      return [];
    } else {
      // Read staged content from git index: git show :<relPath>
      const showResult = spawnSync('git', ['show', `:${relPath}`], {
        cwd: repoRoot,
        encoding: 'buffer',
      });
      if (showResult.status !== 0 || showResult.error) {
        // Fallback to working tree
        diagnostics.push({
          code: 'sentinel_git_unavailable',
          message: `Could not read staged content for ${relPath} (git show failed); falling back to working-tree read.`,
          severity: 'warning',
          file: filePath,
        });
        try {
          content = fs.readFileSync(filePath);
        } catch {
          return diagnostics;
        }
      } else {
        content = showResult.stdout;
      }
    }

    const contentStr = content.toString('utf8');

    for (const rule of context.ruleSet.fileRules) {
      if (!Array.isArray(rule.requireSentinels) || rule.requireSentinels.length === 0) {
        continue;
      }

      // Validate sentinelOverrideEnvVar format to guard against typos
      if (rule.sentinelOverrideEnvVar && !ENV_VAR_PATTERN.test(rule.sentinelOverrideEnvVar)) {
        diagnostics.push({
          code: 'sentinel_config_error',
          message: `sentinelOverrideEnvVar '${rule.sentinelOverrideEnvVar}' is not a valid environment variable name (must match /^[A-Z_][A-Z0-9_]*$/).`,
          severity: 'warning',
          file: filePath,
          ruleId: rule.id,
        });
      }

      // Check deletion threshold (only when file is actually staged and git is available)
      if (
        !gitUnavailable &&
        stagedFiles.has(relPath) &&
        typeof rule.sentinelDeletionThreshold === 'number'
      ) {
        const diffResult = spawnSync('git', ['diff', '--cached', '--', relPath], {
          cwd: repoRoot,
          encoding: 'utf8',
        });
        if (diffResult.status === 0 && !diffResult.error) {
          const deletionCount = diffResult.stdout
            .split('\n')
            .filter((line) => line.startsWith('-') && !line.startsWith('---'))
            .length;

          if (deletionCount > rule.sentinelDeletionThreshold) {
            const overrideSet =
              rule.sentinelOverrideEnvVar &&
              process.env[rule.sentinelOverrideEnvVar] === '1';

            if (overrideSet) {
              diagnostics.push({
                code: 'sentinel_content_override',
                message: `Deletion threshold exceeded for ${relPath} (${deletionCount} lines deleted, threshold: ${rule.sentinelDeletionThreshold}) but ${rule.sentinelOverrideEnvVar}=1 is set — override accepted.`,
                severity: 'warning',
                file: filePath,
                ruleId: rule.id,
                details: {
                  deletionCount,
                  threshold: rule.sentinelDeletionThreshold,
                  overrideEnvVar: rule.sentinelOverrideEnvVar,
                },
              });
            } else {
              diagnostics.push({
                code: 'sentinel_deletion_threshold_exceeded',
                message: `Too many lines deleted from ${relPath}: ${deletionCount} lines deleted (threshold: ${rule.sentinelDeletionThreshold}). Set ${rule.sentinelOverrideEnvVar ?? 'the override env var'}=1 if this deletion is intentional.`,
                severity: 'error',
                file: filePath,
                ruleId: rule.id,
                details: {
                  deletionCount,
                  threshold: rule.sentinelDeletionThreshold,
                  overrideEnvVar: rule.sentinelOverrideEnvVar,
                },
              });
            }
          }
        }
      }

      // Check each required sentinel
      for (const sentinel of rule.requireSentinels) {
        if (!contentStr.includes(sentinel)) {
          const overrideSet =
            rule.sentinelOverrideEnvVar &&
            process.env[rule.sentinelOverrideEnvVar] === '1';

          if (overrideSet) {
            diagnostics.push({
              code: 'sentinel_content_override',
              message: `Sentinel '${sentinel}' is missing from ${relPath} but ${rule.sentinelOverrideEnvVar}=1 is set — override accepted.`,
              severity: 'warning',
              file: filePath,
              ruleId: rule.id,
              details: {
                sentinel,
                overrideEnvVar: rule.sentinelOverrideEnvVar,
              },
            });
          } else {
            diagnostics.push({
              code: 'sentinel_content_removed',
              message: `Required sentinel '${sentinel}' is missing from ${relPath}. This string must be present before committing.${rule.sentinelOverrideEnvVar ? ` Set ${rule.sentinelOverrideEnvVar}=1 to bypass if this removal is intentional.` : ''}`,
              severity: 'error',
              file: filePath,
              ruleId: rule.id,
              details: {
                sentinel,
                overrideEnvVar: rule.sentinelOverrideEnvVar,
                hint: rule.sentinelOverrideEnvVar
                  ? `Set ${rule.sentinelOverrideEnvVar}=1 if this removal is intentional`
                  : 'Restore the required sentinel string before committing',
              },
            });
          }
        }
      }
    }

    return diagnostics;
  }
}
