import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parseMarkdown } from '../core/markdown.js';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export class FrontmatterSchemaAdapter implements ValidatorAdapter {
  id = 'frontmatter-schema';

  supports(filePath: string, context: ValidatorContext): boolean {
    return filePath.endsWith('.md') && Boolean(context.ruleSet.schema?.kind === 'frontmatter');
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const schemaRef = context.ruleSet.schema?.schema;
    if (!schemaRef || typeof schemaRef !== 'string') {
      return diagnostics;
    }

    const schemaPath = path.resolve(context.repoRoot, schemaRef);
    if (!fs.existsSync(schemaPath)) {
      return [
        {
          code: 'schema_not_found',
          message: `Schema file not found: ${schemaRef}`,
          severity: 'error',
          file: filePath,
        },
      ];
    }

    const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaRaw);
    const validate = ajv.compile(schema);
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

    const ok = validate(parsed.frontmatter);
    if (ok) {
      return diagnostics;
    }

    for (const err of validate.errors || []) {
      diagnostics.push({
        code: 'frontmatter_schema_violation',
        message: `${err.instancePath || '/'} ${err.message || 'invalid'}`,
        severity: 'error',
        file: filePath,
      });
    }

    return diagnostics;
  }
}
