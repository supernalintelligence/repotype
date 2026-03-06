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

function isTemplateSource(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/');
  return normalized.includes('/templates/') || normalized.endsWith('.template.md');
}

export class GuidanceAdapter implements ValidatorAdapter {
  id = 'guidance';

  supports(filePath: string, _context: ValidatorContext): boolean {
    return filePath.endsWith('.md');
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const relative = context.ruleSet.filePath;

    if (context.ruleSet.fileRules.length === 0) {
      if (!isInManagedFolderScope(relative, context)) {
        return diagnostics;
      }
      diagnostics.push({
        code: 'no_matching_file_rule',
        message: `No file rule matched '${relative}'. Add a files rule in repotype.yaml to enforce expectations.`,
        severity: 'suggestion',
        file: filePath,
        details: {
          example: `files:\n  - id: ${path.basename(relative, '.md') || 'rule-id'}\n    glob: "${relative}"`,
        },
      });
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
