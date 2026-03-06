import fs from 'node:fs';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

export class ContentPolicyAdapter implements ValidatorAdapter {
  id = 'content-policy';

  supports(_filePath: string, context: ValidatorContext): boolean {
    return context.ruleSet.fileRules.some(
      (rule) => Array.isArray(rule.forbidContentPatterns) && rule.forbidContentPatterns.length > 0
    );
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const raw = fs.readFileSync(filePath, 'utf8');

    for (const rule of context.ruleSet.fileRules) {
      for (const pattern of rule.forbidContentPatterns || []) {
        let regex: RegExp | null = null;
        try {
          regex = new RegExp(pattern, 'm');
        } catch (error) {
          diagnostics.push({
            code: 'invalid_forbid_content_pattern',
            message: `Invalid forbidContentPatterns regex '${pattern}': ${(error as Error).message}`,
            severity: 'warning',
            file: filePath,
            ruleId: rule.id,
          });
        }

        if (!regex) {
          continue;
        }

        if (regex.test(raw)) {
          diagnostics.push({
            code: 'forbidden_content_pattern',
            message: `Forbidden content pattern matched: ${pattern}`,
            severity: 'error',
            file: filePath,
            ruleId: rule.id,
            details: {
              hint:
                "Remove or redact this content, or intentionally relax the rule in repotype.yaml if this is expected.",
            },
          });
        }
      }
    }

    return diagnostics;
  }
}
