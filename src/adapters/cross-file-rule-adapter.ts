import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { minimatch } from 'minimatch';
import { parseMarkdown } from '../core/markdown.js';
import type { Diagnostic, DiagnosticSeverity, ValidatorAdapter, ValidatorContext } from '../core/types.js';

// CrossFileRuleAdapter
//
// Implements `rules[].kind: 'cross_reference'` from repotype.yaml.
//
// Each rule specifies:
//   - sourceGlob  — which files are validated
//   - field       — frontmatter field whose value is the reference ID
//   - target      — glob pattern where the placeholder is replaced by the field value
//                   Use the literal string {field_value} in the target glob.
//   - severity    — 'error' | 'warning' | 'suggestion' (default 'error')
//   - optional    — when true, skip if field is absent or empty string
export class CrossFileRuleAdapter implements ValidatorAdapter {
  id = 'cross-file-rule';

  supports(filePath: string, context: ValidatorContext): boolean {
    const rules = context.config.rules ?? [];
    return rules.some(
      (r) =>
        r.kind === 'cross_reference' &&
        r.field &&
        r.target &&
        minimatch(path.relative(context.repoRoot, filePath).replace(/\\/g, '/'), r.sourceGlob, { dot: true }),
    );
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const rules = context.config.rules ?? [];
    const relPath = path.relative(context.repoRoot, filePath).replace(/\\/g, '/');

    for (const rule of rules) {
      if (rule.kind !== 'cross_reference') continue;
      if (!rule.field || !rule.target) continue;
      if (!minimatch(relPath, rule.sourceGlob, { dot: true })) continue;

      const severity: DiagnosticSeverity = rule.severity ?? 'error';

      let parsed;
      try {
        parsed = parseMarkdown(filePath);
      } catch (error) {
        diagnostics.push({
          code: 'invalid_frontmatter_yaml',
          message: `Invalid YAML frontmatter: ${(error as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: rule.id,
        });
        continue;
      }

      const rawValue = parsed.frontmatter[rule.field];

      // Skip if optional and field is absent or empty
      if (rule.optional) {
        if (rawValue === undefined || rawValue === null || rawValue === '') continue;
      }

      if (typeof rawValue !== 'string' || rawValue.trim() === '') continue;

      const fieldValue = rawValue.trim();
      const targetGlob = rule.target.replace('{field_value}', fieldValue);
      const absoluteGlob = path.isAbsolute(targetGlob)
        ? targetGlob
        : path.join(context.repoRoot, targetGlob);

      // Resolve the glob to check if any matching file exists
      let matches: string[];
      if (context.globalFileIndex) {
        // Workspace mode: use the pre-built index
        const normalizedGlob = absoluteGlob.replace(/\\/g, '/');
        matches = [];
        for (const entry of context.globalFileIndex) {
          if (minimatch(entry.replace(/\\/g, '/'), normalizedGlob, { dot: true })) {
            matches.push(entry);
            break;
          }
        }
      } else {
        matches = globSync(absoluteGlob.replace(/\\/g, '/'), { dot: true });
      }

      if (matches.length === 0) {
        diagnostics.push({
          code: 'broken_cross_file_reference',
          message: `Rule '${rule.id}': field '${rule.field}' value '${fieldValue}' does not resolve to any file matching '${rule.target}'`,
          severity,
          file: filePath,
          ruleId: rule.id,
          details: {
            field: rule.field,
            value: fieldValue,
            targetPattern: rule.target,
          },
        });
      }
    }

    return diagnostics;
  }
}
