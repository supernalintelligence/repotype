import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadSchema(repoRoot: string, schemaRef: string): Record<string, unknown> {
  const schemaPath = path.resolve(repoRoot, schemaRef);
  const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
  return JSON.parse(schemaRaw) as Record<string, unknown>;
}

export class FileSchemaAdapter implements ValidatorAdapter {
  id = 'file-schema';

  supports(_filePath: string, context: ValidatorContext): boolean {
    const kind = context.ruleSet.schema?.kind;
    return kind === 'json' || kind === 'yaml';
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const binding = context.ruleSet.schema;
    if (!binding || (binding.kind !== 'json' && binding.kind !== 'yaml')) {
      return diagnostics;
    }

    const schemaRef = binding.schema;
    if (typeof schemaRef !== 'string') {
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

    let schema: Record<string, unknown>;
    try {
      schema = loadSchema(context.repoRoot, schemaRef);
    } catch (error) {
      return [
        {
          code: 'invalid_schema_json',
          message: `Schema file is not valid JSON: ${schemaRef} (${(error as Error).message})`,
          severity: 'error',
          file: filePath,
        },
      ];
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    let payload: unknown;
    try {
      if (binding.kind === 'json') {
        payload = JSON.parse(raw);
      } else {
        payload = yaml.load(raw);
      }
    } catch (error) {
      return [
        {
          code: binding.kind === 'json' ? 'invalid_json_syntax' : 'invalid_yaml_syntax',
          message: `Invalid ${binding.kind.toUpperCase()} syntax: ${(error as Error).message}`,
          severity: 'error',
          file: filePath,
          details: {
            hint: `Fix ${binding.kind.toUpperCase()} syntax, then re-run validation.`,
          },
        },
      ];
    }

    const validate = ajv.compile(schema);
    const ok = validate(payload);
    if (ok) {
      return diagnostics;
    }

    for (const err of validate.errors || []) {
      diagnostics.push({
        code: 'file_schema_violation',
        message: `${err.instancePath || '/'} ${err.message || 'invalid'}`,
        severity: 'error',
        file: filePath,
        details: {
          kind: binding.kind,
        },
      });
    }

    return diagnostics;
  }
}
