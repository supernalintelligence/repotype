import fs from 'node:fs';
import path from 'node:path';
import { extractSections, parseMarkdown, parseMarkdownContent } from '../core/markdown.js';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

function stripFencedCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, '');
}

function stripInlineCode(content: string): string {
  return content.replace(/`[^`]*`/g, '');
}

function loadTemplateRequiredFields(templatePath: string): string[] {
  if (!fs.existsSync(templatePath)) {
    return [];
  }
  const raw = fs.readFileSync(templatePath, 'utf8');
  const parsed = parseMarkdownContent(raw);
  return Object.keys(parsed.frontmatter || {}).filter((key) => !key.startsWith('_'));
}

function loadTemplateSections(templatePath: string): string[] {
  if (!fs.existsSync(templatePath)) {
    return [];
  }
  const raw = fs.readFileSync(templatePath, 'utf8');
  const parsed = parseMarkdownContent(raw);
  return extractSections(parsed.body || '');
}

export class MarkdownTemplateAdapter implements ValidatorAdapter {
  id = 'markdown-template';

  supports(filePath: string, _context: ValidatorContext): boolean {
    return filePath.endsWith('.md');
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
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
    const fileSections = extractSections(parsed.body);

    for (const section of context.ruleSet.requiredSections) {
      if (!fileSections.includes(section)) {
        diagnostics.push({
          code: 'missing_section',
          message: `Missing required section: ## ${section}`,
          severity: 'error',
          file: filePath,
          autofix: {
            type: 'add_section',
            safe: true,
            file: filePath,
            payload: { section },
          },
        });
      }
    }

    const templateId = context.ruleSet.template?.id;
    if (templateId) {
      const template = (context.config.templates || []).find((t) => t.id === templateId);
      if (template) {
        const templatePath = path.resolve(context.repoRoot, template.path);
        const requiredFields = loadTemplateRequiredFields(templatePath);
        const requiredTemplateSections = loadTemplateSections(templatePath);

        for (const field of requiredFields) {
          if (!Object.hasOwn(parsed.frontmatter, field)) {
            diagnostics.push({
              code: 'missing_frontmatter_field',
              message: `Missing frontmatter field '${field}' required by template '${templateId}'`,
              severity: 'error',
              file: filePath,
              autofix: {
                type: 'add_frontmatter_field',
                safe: true,
                file: filePath,
                payload: { key: field, value: '' },
              },
            });
          }
        }

        for (const section of requiredTemplateSections) {
          if (!fileSections.includes(section)) {
            diagnostics.push({
              code: 'missing_template_section',
              message: `Missing template section: ## ${section}`,
              severity: 'error',
              file: filePath,
              autofix: {
                type: 'add_section',
                safe: true,
                file: filePath,
                payload: { section },
              },
            });
          }
        }
      }
    }

    const configuredHints = context.ruleSet.templateHints;
    if (configuredHints.length > 0) {
      const hintTarget = stripInlineCode(stripFencedCodeBlocks(parsed.body));
      for (const hint of configuredHints) {
        if (!hintTarget.includes(hint)) continue;
        diagnostics.push({
          code: 'template_hint_present',
          message: `Template hint still present: ${hint}`,
          severity: 'warning',
          file: filePath,
          autofix: {
            type: 'remove_template_hint',
            safe: true,
            file: filePath,
            payload: { hint },
          },
        });
      }
    }

    return diagnostics;
  }
}
