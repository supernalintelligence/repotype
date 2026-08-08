import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

interface BadPathPattern {
  regex: RegExp;
  reason: string;
}

// Paths that should never be git-tracked, regardless of size. These are the
// concrete categories found bloating supernal-nova's .git to 23GB (2026-08-07
// audit): committed Next.js webpack caches and repeated PDF/binary re-exports
// living alongside build output dirs.
const BAD_PATH_PATTERNS: BadPathPattern[] = [
  {
    regex: /(^|\/)\.next\/cache\//,
    reason: 'Next.js build cache (.next/cache/) should never be committed — it is fully regenerable and grows without bound across builds.',
  },
  {
    regex: /(^|\/)node_modules\//,
    reason: 'node_modules should never be committed.',
  },
  {
    regex: /\.pack(\.gz)?$/,
    reason: 'webpack .pack/.pack.gz cache files should never be committed — regenerable build cache.',
  },
];

// Log-shaped filename patterns — these are runtime output, not source or
// content, and should live outside git (e.g. .supernal-local/) regardless of
// size.
const LOG_NAME_PATTERNS: RegExp[] = [/ralph-log/i, /\.log\.jsonl$/i, /-log-\d+.*\.jsonl$/i];

const GENERIC_SIZE_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5MB
const JSONL_SIZE_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1MB — jsonl files are almost always log/export dumps

export class LargeGeneratedFileAdapter implements ValidatorAdapter {
  id = 'large-generated-file';

  supports(filePath: string, _context: ValidatorContext): boolean {
    // Runs on every scanned file — cheap (one stat call), and the checks
    // below are all path/size based, not content based.
    return true;
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const relativePath = path.relative(context.repoRoot, filePath).replace(/\\/g, '/');

    for (const { regex, reason } of BAD_PATH_PATTERNS) {
      if (regex.test(relativePath)) {
        diagnostics.push({
          code: 'generated_path_tracked',
          severity: 'error',
          file: filePath,
          message: `'${relativePath}' matches a generated/build-cache path that should never be tracked: ${reason} Add it to .gitignore and remove it from git.`,
          details: { pattern: regex.source, reason },
        });
        // A bad-path match already explains the problem; skip the size check
        // below to avoid a redundant second diagnostic on the same file.
        return diagnostics;
      }
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      // File may have been deleted/moved between scan and stat (e.g. a
      // rename in progress); nothing to flag.
      return diagnostics;
    }
    if (!stat.isFile()) {
      return diagnostics;
    }

    const basename = path.basename(relativePath);
    const isJsonl = basename.endsWith('.jsonl');
    const looksLikeLog = LOG_NAME_PATTERNS.some((re) => re.test(basename));

    if (looksLikeLog) {
      diagnostics.push({
        code: 'log_shaped_file_tracked',
        severity: 'error',
        file: filePath,
        message: `'${relativePath}' looks like a runtime log/export file (${(stat.size / 1024).toFixed(0)}KB) — these belong in .supernal-local/ or another gitignored runtime dir, not tracked in git.`,
        details: { sizeBytes: stat.size },
      });
      return diagnostics;
    }

    if (isJsonl && stat.size > JSONL_SIZE_THRESHOLD_BYTES) {
      diagnostics.push({
        code: 'large_jsonl_tracked',
        severity: 'warning',
        file: filePath,
        message: `'${relativePath}' is a ${(stat.size / (1024 * 1024)).toFixed(1)}MB tracked .jsonl file — .jsonl is commonly log/export output; verify this is real content, not a runtime dump that should be gitignored.`,
        details: { sizeBytes: stat.size },
      });
      return diagnostics;
    }

    if (stat.size > GENERIC_SIZE_THRESHOLD_BYTES) {
      diagnostics.push({
        code: 'large_file_tracked',
        severity: 'warning',
        file: filePath,
        message: `'${relativePath}' is ${(stat.size / (1024 * 1024)).toFixed(1)}MB — large binary/generated files bloat git history permanently (git cannot diff them, every revision is a full new blob). Confirm this belongs in git; consider external/object storage for frequently-regenerated assets.`,
        details: { sizeBytes: stat.size },
      });
    }

    return diagnostics;
  }
}
