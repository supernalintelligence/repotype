import path from 'node:path';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

export class FilenameAdapter implements ValidatorAdapter {
  id = 'filename';

  supports(_filePath: string, context: ValidatorContext): boolean {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.filenamePattern));
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const name = path.basename(filePath);
    const diagnostics: Diagnostic[] = [];

    for (const rule of context.ruleSet.fileRules) {
      if (!rule.filenamePattern) {
        continue;
      }
      const regex = new RegExp(rule.filenamePattern);
      if (!regex.test(name)) {
        diagnostics.push({
          code: 'filename_pattern_mismatch',
          message: `Filename '${name}' does not match pattern ${rule.filenamePattern}`,
          severity: 'error',
          file: filePath,
          ruleId: rule.id,
        });
      }
    }

    return diagnostics;
  }
}
