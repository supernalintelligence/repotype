/**
 * Shared module-level cache for git staged file detection.
 *
 * Both SentinelContentAdapter and WorkflowGateAdapter need to know which files
 * are currently in the git staging area. This module provides a single
 * `getStagedFiles()` function backed by a module-level Map so git is spawned
 * AT MOST ONCE per repoRoot per process lifetime — regardless of how many
 * adapter instances call it or how many files are validated.
 *
 * DIFF-AWARE GATE: When git diff --cached returns empty (no staged files, e.g.
 * when repotype is run manually outside a pre-commit hook), getStagedFiles()
 * returns an empty Set and ALL diff-aware adapters skip their checks. This is
 * intentional — it mirrors the bash pre-commit guard behavior. CI runs of
 * repotype validate also have no staged files and will silently skip both
 * adapters.
 */

import { spawnSync } from 'node:child_process';

const stagedFilesCache = new Map<string, Set<string>>();
const gitAvailabilityCache = new Map<string, boolean>();

/**
 * Returns the set of relative file paths currently staged in the git index.
 * Returns an empty Set if git is unavailable or no files are staged.
 * Caches per repoRoot — exactly one git spawn per repoRoot per process.
 */
export function getStagedFiles(repoRoot: string): Set<string> {
  if (stagedFilesCache.has(repoRoot)) {
    return stagedFilesCache.get(repoRoot)!;
  }

  const result = spawnSync('git', ['diff', '--cached', '--name-only'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0 || result.error) {
    // git unavailable or not a git repo — store empty sentinel so we don't retry
    gitAvailabilityCache.set(repoRoot, false);
    const empty = new Set<string>();
    stagedFilesCache.set(repoRoot, empty);
    return empty;
  }

  gitAvailabilityCache.set(repoRoot, true);
  const staged = new Set<string>(
    result.stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
  );

  stagedFilesCache.set(repoRoot, staged);
  return staged;
}

/**
 * Returns true if the last getStagedFiles() call for this repoRoot encountered
 * a git error (git unavailable, not a git repo, etc.). Returns false if git was
 * available (even if there were zero staged files).
 * Triggers getStagedFiles() if not yet called for this repoRoot.
 */
export function wasGitUnavailable(repoRoot: string): boolean {
  getStagedFiles(repoRoot);
  return gitAvailabilityCache.get(repoRoot) === false;
}
