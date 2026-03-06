import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { parseMarkdown } from './markdown.js';

type JsonSchema = Record<string, unknown>;

interface AggregateEntry {
  count: number;
  values: unknown[];
}

function inferType(value: unknown): string {
  if (Array.isArray(value)) {
    return 'array';
  }
  if (value === null) {
    return 'null';
  }
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return Number.isInteger(value) ? 'integer' : 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
}

function inferArrayItems(values: unknown[]): JsonSchema {
  const itemTypes = new Set<string>();
  for (const value of values) {
    if (Array.isArray(value)) {
      for (const item of value) {
        itemTypes.add(inferType(item));
      }
    }
  }

  if (itemTypes.size === 0) {
    return {};
  }

  if (itemTypes.size === 1) {
    return { type: [...itemTypes][0] };
  }

  return {
    anyOf: [...itemTypes].map((type) => ({ type })),
  };
}

function inferPropertySchema(values: unknown[]): JsonSchema {
  const types = new Set(values.map((value) => inferType(value)));
  if (types.size === 0) {
    return {};
  }

  if (types.size === 1) {
    const only = [...types][0];
    if (only === 'array') {
      return {
        type: 'array',
        items: inferArrayItems(values),
      };
    }
    return { type: only };
  }

  return {
    anyOf: [...types].map((type) =>
      type === 'array'
        ? { type: 'array', items: inferArrayItems(values) }
        : { type }
    ),
  };
}

function discoverMarkdownFiles(targetPath: string, pattern: string): string[] {
  const absolute = path.resolve(targetPath);
  const stat = fs.statSync(absolute);

  if (stat.isFile()) {
    return [absolute];
  }

  return globSync(pattern, {
    cwd: absolute,
    absolute: true,
    nodir: true,
    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
  });
}

export function generateFrontmatterSchemaFromContent(
  targetPath: string,
  outputPath: string,
  pattern: string = '**/*.md'
): {
  output: string;
  filesConsidered: number;
  filesParsed: number;
  filesFailed: number;
  required: string[];
  properties: string[];
} {
  const files = discoverMarkdownFiles(targetPath, pattern);
  const aggregate = new Map<string, AggregateEntry>();
  let filesParsed = 0;
  let filesFailed = 0;

  for (const file of files) {
    try {
      const parsed = parseMarkdown(file);
      const frontmatter = parsed.frontmatter || {};
      filesParsed += 1;

      for (const [key, value] of Object.entries(frontmatter)) {
        const current = aggregate.get(key) || { count: 0, values: [] };
        current.count += 1;
        current.values.push(value);
        aggregate.set(key, current);
      }
    } catch {
      filesFailed += 1;
    }
  }

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const [key, entry] of aggregate.entries()) {
    properties[key] = inferPropertySchema(entry.values);
    if (filesParsed > 0 && entry.count === filesParsed) {
      required.push(key);
    }
  }

  const schema = {
    type: 'object',
    required: required.sort(),
    properties,
    additionalProperties: true,
  };

  const outputAbsolute = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(outputAbsolute), { recursive: true });
  fs.writeFileSync(outputAbsolute, `${JSON.stringify(schema, null, 2)}\n`);

  return {
    output: outputAbsolute,
    filesConsidered: files.length,
    filesParsed,
    filesFailed,
    required: required.sort(),
    properties: Object.keys(properties).sort(),
  };
}
