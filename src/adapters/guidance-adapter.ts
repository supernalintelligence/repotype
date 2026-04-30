import path from 'node:path';
import fs from 'node:fs';
import { minimatch } from 'minimatch';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

function isInManagedFolderScope(relativePath: string, context: ValidatorContext): boolean {
  const folders = context.config.folders || [];
  if (folders.length === 0) {
    return true;
  }

  return folders.some((folder) => {
    if (folder.path) {
      return relativePath === folder.path || relativePath.startsWith(`${folder.path}/`);
    }
    if (folder.glob) {
      return minimatch(relativePath, folder.glob, { dot: true });
    }
    return false;
  });
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function isTemplateSource(relativePath: string): boolean {
  const normalized = normalizePath(relativePath);
  return normalized.includes('/templates/') || normalized.endsWith('.template.md');
}

function isRepotypeSystemFile(relativePath: string): boolean {
  const normalized = normalizePath(relativePath);
  return normalized === 'repotype.yaml' || normalized === 'repo-schema.yaml';
}

function isReferencedByConfig(relativePath: string, context: ValidatorContext): boolean {
  const normalized = normalizePath(relativePath);

  if ((context.config.templates || []).some((t) => normalizePath(t.path) === normalized)) {
    return true;
  }

  for (const rule of context.config.files || []) {
    if (rule.schema && typeof rule.schema.schema === 'string' && normalizePath(rule.schema.schema) === normalized) {
      return true;
    }
  }

  for (const folder of context.config.folders || []) {
    const bindings = folder.schemaBindings || {};
    for (const key of Object.keys(bindings)) {
      const binding = bindings[key];
      if (typeof binding.schema === 'string' && normalizePath(binding.schema) === normalized) {
        return true;
      }
    }
  }

  return false;
}

export class GuidanceAdapter implements ValidatorAdapter {
  id = 'guidance';

  supports(_filePath: string, _context: ValidatorContext): boolean {
    return true;
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const relative = context.ruleSet.filePath;
    const strictUnmatchedPolicy = context.config.defaults?.unmatchedFiles ?? 'deny';

    if (context.ruleSet.fileRules.length === 0) {
      if (isRepotypeSystemFile(relative) || isReferencedByConfig(relative, context)) {
        return diagnostics;
      }

      if (strictUnmatchedPolicy === 'allow') {
        diagnostics.push({
          code: 'no_matching_file_rule',
          message: `No file rule matched '${relative}'. Legacy permissive mode is enabled (defaults.unmatchedFiles=allow).`,
          severity: 'suggestion',
          file: filePath,
          details: {
            mode: 'permissive',
            recommendation: 'Set defaults.unmatchedFiles to deny for strict deny-by-default enforcement.',
          },
        });
        return diagnostics;
      }

      if (!isInManagedFolderScope(relative, context) && (context.config.folders || []).length > 0) {
        // deny-by-default should still fail unmatched paths even outside managed folder scope
      }

      diagnostics.push({
        code: 'no_matching_file_rule',
        message: `No file rule matched '${relative}'. Deny-by-default policy requires explicit file allow rules.`,
        severity: 'error',
        file: filePath,
        details: {
          mode: 'deny',
          example: `files:\n  - id: ${path.basename(relative, path.extname(relative)) || 'rule-id'}\n    glob: "${relative}"`,
          compatibilityEscapeHatch: 'defaults.unmatchedFiles: allow',
        },
      });
      return diagnostics;
    }

    if (!filePath.endsWith('.md')) {
      return diagnostics;
    }

    const body = fs.readFileSync(filePath, 'utf8');
    const hasFrontmatter = body.startsWith('---\n');

    if (!context.ruleSet.schema && hasFrontmatter && !isTemplateSource(relative)) {
      diagnostics.push({
        code: 'missing_schema_binding',
        message:
          `Matched rule(s) for '${relative}' but no frontmatter schema is bound. ` +
          `Generate one with: repotype generate schema "${path.dirname(filePath)}" "schemas/${path.basename(path.dirname(filePath))}.frontmatter.schema.json"`,
        severity: 'suggestion',
        file: filePath,
      });
    }

    if (context.ruleSet.requiredSections.length === 0) {
      diagnostics.push({
        code: 'missing_required_sections_rule',
        message:
          `Matched rule(s) for '${relative}' but requiredSections is empty. ` +
          'Add requiredSections to enforce expected markdown structure.',
        severity: 'suggestion',
        file: filePath,
      });
    }

    return diagnostics;
  }
}
