import fs from 'node:fs';
import path from 'node:path';
import { parseMarkdown } from '../core/markdown.js';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string') as string[];
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
}

export class CrossReferenceAdapter implements ValidatorAdapter {
  id = 'cross-reference';

  supports(_filePath: string, context: ValidatorContext): boolean {
    return Boolean(context.ruleSet.crossReferences);
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const cross = context.ruleSet.crossReferences;
    if (!cross) {
      return diagnostics;
    }

    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error) {
      return [
        {
          code: 'invalid_frontmatter_yaml',
          message: `Invalid YAML frontmatter: ${(error as Error).message}`,
          severity: 'error',
          file: filePath,
          details: {
            hint: 'Fix YAML syntax first, then re-run validate.',
          },
        },
      ];
    }
    const base = path.dirname(filePath);

    for (const field of cross.fields) {
      const refs = asStringArray(parsed.frontmatter[field]);
      for (const ref of refs) {
        if (!cross.allowAbsolute && path.isAbsolute(ref)) {
          diagnostics.push({
            code: 'invalid_reference_absolute',
            message: `Absolute path not allowed in ${field}: ${ref}`,
            severity: 'error',
            file: filePath,
          });
          continue;
        }

        const resolved = path.resolve(base, ref);
        if (!fs.existsSync(resolved)) {
          diagnostics.push({
            code: 'broken_reference',
            message: `Broken reference in ${field}: ${ref}`,
            severity: 'error',
            file: filePath,
            details: { resolved },
          });
          continue;
        }

        if (cross.allowedExtensions && cross.allowedExtensions.length > 0) {
          const ext = path.extname(resolved);
          if (!cross.allowedExtensions.includes(ext)) {
            diagnostics.push({
              code: 'reference_extension_not_allowed',
              message: `Reference extension not allowed in ${field}: ${ref}`,
              severity: 'error',
              file: filePath,
            });
          }
        }
      }
    }

    return diagnostics;
  }
}
