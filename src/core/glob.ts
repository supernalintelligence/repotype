import { Minimatch } from "minimatch";

const MATCH_OPTS = { dot: true, nocase: false, nocomment: true } as const;

/**
 * Cache of compiled Minimatch instances keyed by glob pattern.
 *
 * `matchesGlob` is called once per (file × rule) pair during validation. The
 * top-level `minimatch(path, pattern, opts)` helper recompiles the pattern into
 * a regex AST on every call, so a full-tree run was paying O(files × rules)
 * glob compilations — millions of recompilations of the same ~90 patterns. That
 * is the root cause of the workspace-mode hang. Compiling each distinct pattern
 * once and reusing the instance makes per-file matching an O(1) regex test.
 *
 * All callers use the same fixed MATCH_OPTS, so the pattern string alone is a
 * sufficient cache key. `new Minimatch(pattern, opts).match(p)` is exactly what
 * the top-level `minimatch()` helper does internally — caching it is purely a
 * compilation memoization and does not change matching semantics.
 */
const compiledCache = new Map<string, Minimatch>();

function getCompiled(glob: string): Minimatch {
  let mm = compiledCache.get(glob);
  if (!mm) {
    mm = new Minimatch(glob, MATCH_OPTS);
    compiledCache.set(glob, mm);
  }
  return mm;
}

export function matchesGlob(pathValue: string, glob: string): boolean {
  return getCompiled(glob).match(pathValue);
}
