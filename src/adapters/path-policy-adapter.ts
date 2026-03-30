import path from 'node:path';
import type { Diagnostic, FileRule, ValidatorAdapter, ValidatorContext } from '../core/types.js';

function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

function matchesCase(value: string, mode: NonNullable<FileRule['pathCase']>): boolean {
  if (mode === 'kebab') {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }
  if (mode === 'snake') {
    return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(value);
  }
  if (mode === 'camel') {
    return /^[a-z][A-Za-z0-9]*$/.test(value);
  }
  return /^[a-z0-9]+$/.test(value);
}

function segmentsForCase(relativePath: string): string[] {
  const normalized = normalize(relativePath);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) {
    return [];
  }

  const last = parts[parts.length - 1];
  const ext = path.extname(last);
  if (ext) {
    parts[parts.length - 1] = last.slice(0, last.length - ext.length);
  }
  return parts.filter((entry) => entry.length > 0);
}

export class PathPolicyAdapter implements ValidatorAdapter {
  id = 'path-policy';

  supports(_filePath: string, context: ValidatorContext): boolean {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.pathPattern || rule.pathCase));
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const relativePath = context.ruleSet.filePath;

    for (const rule of context.ruleSet.fileRules) {
      if (rule.pathPattern) {
        let regex: RegExp | null = null;
        try {
          regex = new RegExp(rule.pathPattern);
        } catch (error) {
          diagnostics.push({
            code: 'invalid_path_pattern',
            message: `Invalid pathPattern regex '${rule.pathPattern}': ${(error as Error).message}`,
            severity: 'warning',
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: 'Fix this regex in repotype.yaml.',
            },
          });
        }

        if (regex && !regex.test(relativePath)) {
          diagnostics.push({
            code: 'path_pattern_mismatch',
            message: `Path '${relativePath}' does not match pattern ${rule.pathPattern}`,
            severity: 'error',
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: 'Rename/move file or adjust pathPattern in repotype.yaml.',
            },
          });
        }
      }

      if (rule.pathCase) {
        const segments = segmentsForCase(relativePath);
        for (const segment of segments) {
          if (segment.startsWith('.')) {
            continue;
          }
          if (!matchesCase(segment, rule.pathCase)) {
            diagnostics.push({
              code: 'path_case_mismatch',
              message: `Path segment '${segment}' is not ${rule.pathCase}-case in '${relativePath}'`,
              severity: 'error',
              file: filePath,
              ruleId: rule.id,
              details: {
                expected: rule.pathCase,
                segment,
                hint: 'Rename this file/folder segment or relax pathCase in repotype.yaml.',
              },
            });
          }
        }
      }
    }

    return diagnostics;
  }
}
