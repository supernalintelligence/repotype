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

// Detects unquoted YAML plain scalars containing ' #' which YAML parses as a
// comment start, silently truncating the value. Only fires for simple key: value
// lines — skips quoted values ("...", '...') and block scalars (|, >, [, {).
function findFrontmatterCommentTruncations(body: string): { line: number; key: string; raw: string }[] {
  const results: { line: number; key: string; raw: string }[] = [];
  if (!body.startsWith('---\n')) {
    return results;
  }
  const endMarker = body.indexOf('\n---', 4);
  if (endMarker === -1) {
    return results;
  }
  const frontmatter = body.slice(4, endMarker);
  const lines = frontmatter.split('\n');
  // key: plain-scalar-value  # comment
  // Exclude whitespace from the first char so backtracking can't give up the
  // colon's trailing space and make a flow-indicator value (e.g. [a,b]) appear
  // to start as a plain scalar.
  const plainScalarWithHash = /^(\s*)([\w][\w-]*)(\s*:\s*)([^|>['"{}\s][^\n]*)\s+#/;
  for (let i = 0; i < lines.length; i++) {
    const m = plainScalarWithHash.exec(lines[i]);
    if (m) {
      results.push({ line: i + 2, key: m[2], raw: lines[i].trim() });
    }
  }
  return results;
}

function isReferencedByConfig(relativePath: string, context: ValidatorContext): boolean {
  const normalized = normalizePath(relativePath);

  if ((context.config.templates || []).some((t) => typeof t.path === 'string' && normalizePath(t.path) === normalized)) {
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

    if (hasFrontmatter) {
      for (const hit of findFrontmatterCommentTruncations(body)) {
        diagnostics.push({
          code: 'frontmatter_comment_truncation',
          message:
            `Frontmatter field '${hit.key}' (line ${hit.line}) contains ' #' in an unquoted scalar — ` +
            `YAML will silently treat everything after it as a comment. Quote the value to preserve it.`,
          severity: 'warning',
          file: filePath,
          details: { line: hit.line, raw: hit.raw },
        });
      }
    }

    return diagnostics;
  }
}
