import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

interface DangerousPattern {
  regex: RegExp;
  reason: string;
  fix: string;
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  // Specific directory rules first so they produce the most precise message
  {
    regex: /^\.ralph-logs\/?$/,
    reason: 'Ralph logs directory (.ralph-logs/) at the repo root is being hidden.',
    fix: 'Delete the .ralph-logs/ directory. Ralph logs belong in .supernal-local/ralph/logs/ — configure ralph to write there.',
  },
  {
    regex: /^\.ralph-specs\/?$/,
    reason: 'Ralph specs directory (.ralph-specs/) at the repo root is being hidden.',
    fix: 'Delete the .ralph-specs/ directory. Ralph specs belong in .supernal/docs/specs/ — configure ralph to write there.',
  },
  // General ralph artifact files (status, diff, audit, test, log, iter, complete)
  {
    regex: /^\.ralph-(?:status|diff|audit|test|log|iter|complete)/,
    reason: 'Ralph runtime artifacts (status, diff, audit, test, log, iter, complete files) are being hidden at the repo root.',
    fix: 'Delete these files instead of ignoring them. Ralph artifacts belong in .supernal-local/ralph/ — configure ralph to write there, not at the repo root.',
  },
  {
    regex: /^[/*]*\*?\.plan\.md$/,
    reason: 'Root-level *.plan.md files are stray ralph output being silently hidden.',
    fix: 'Delete these plan files. Plans belong in .supernal/docs/plans/ — configure ralph to write there, not at the repo root.',
  },
  {
    regex: /^\*-ralph\.complete$/,
    reason: 'Ralph completion markers (*-ralph.complete) are being hidden at the repo root.',
    fix: 'Delete these completion markers instead of ignoring them. Completion markers should be deleted after each run.',
  },
  {
    regex: /^\.loop-complete$/,
    reason: 'Loop completion marker (.loop-complete) is being hidden instead of deleted.',
    fix: 'Delete .loop-complete after each loop run instead of ignoring it.',
  },
  {
    regex: /^[/*]*\*\.complete$/,
    reason: 'Broad *.complete glob is hiding all completion marker files.',
    fix: 'Delete completion markers after use instead of ignoring them. If only ralph markers are intended, use a narrower pattern like *-ralph.complete.',
  },
];

export class GitignorePolicyAdapter implements ValidatorAdapter {
  id = 'gitignore-policy';

  supports(filePath: string, _context: ValidatorContext): boolean {
    return path.basename(filePath) === '.gitignore';
  }

  async validate(filePath: string, _context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      diagnostics.push({
        code: 'gitignore_read_error',
        message: `Could not read .gitignore: ${(error as Error).message}`,
        severity: 'warning',
        file: filePath,
      });
      return diagnostics;
    }

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();

      // Skip empty lines and comments
      if (trimmed === '' || trimmed.startsWith('#')) {
        continue;
      }

      for (const { regex, reason, fix } of DANGEROUS_PATTERNS) {
        if (regex.test(trimmed)) {
          diagnostics.push({
            code: 'dangerous_ignore_pattern',
            severity: 'warning',
            file: filePath,
            message: `Dangerous .gitignore pattern '${trimmed}': ${reason} ${fix}`,
            details: {
              line: i + 1,
              pattern: trimmed,
              reason,
              fix,
            },
          });
          break; // one diagnostic per line — first matching rule wins
        }
      }
    }

    return diagnostics;
  }
}
