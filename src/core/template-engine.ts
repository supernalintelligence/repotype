import fs from 'node:fs';
import path from 'node:path';
import Handlebars from 'handlebars';
import type { RepoSchemaConfig } from './types.js';

export function renderTemplate(
  config: RepoSchemaConfig,
  repoRoot: string,
  templateId: string,
  variables: Record<string, unknown>,
): string {
  const template = (config.templates || []).find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const templatePath = path.resolve(repoRoot, template.path);
  const source = fs.readFileSync(templatePath, 'utf8');
  const compiled = Handlebars.compile(source, { noEscape: true });
  return compiled(variables);
}
