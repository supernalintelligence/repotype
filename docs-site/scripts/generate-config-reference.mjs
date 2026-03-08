#!/usr/bin/env node
/**
 * Auto-generate configuration schema reference from repotype.yaml examples
 * Run: node scripts/generate-config-reference.mjs
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, '../src/content/docs/reference');

// Config schema - defined here as source of truth
const CONFIG_SCHEMA = {
  version: {
    type: 'string',
    required: true,
    description: 'Config version. Currently always `"1"`.',
    example: '"1"',
  },
  extends: {
    type: 'string[]',
    required: false,
    description: 'Paths to parent configs to inherit from.',
    example: '["./profiles/base.yaml"]',
  },
  defaults: {
    type: 'object',
    required: false,
    description: 'Default behavior settings.',
    children: {
      unmatchedFiles: {
        type: '"deny" | "allow"',
        default: '"deny"',
        description: 'How to handle files not matching any rule. `deny` = error, `allow` = suggestion.',
      },
    },
  },
  folders: {
    type: 'FolderRule[]',
    required: false,
    description: 'Folder structure rules.',
    children: {
      id: { type: 'string', required: true, description: 'Unique identifier for this rule.' },
      path: { type: 'string', required: true, description: 'Folder path (can include globs like `src/*`).' },
      requiredFolders: { type: 'string[]', description: 'Subdirectories that must exist.' },
      allowedFolders: { type: 'string[]', description: 'Only these subdirectories are allowed.' },
      requiredFiles: { type: 'string[]', description: 'Files that must exist in this folder.' },
      allowedFiles: { type: 'string[]', description: 'Only these files are allowed (glob patterns).' },
      pathCase: { type: '"kebab" | "camel" | "pascal" | "snake"', description: 'Naming convention for folder.' },
    },
  },
  files: {
    type: 'FileRule[]',
    required: false,
    description: 'File validation rules.',
    children: {
      id: { type: 'string', required: true, description: 'Unique identifier for this rule.' },
      glob: { type: 'string', required: true, description: 'Glob pattern to match files.' },
      pathCase: { type: '"kebab" | "camel" | "pascal" | "snake"', description: 'Naming convention for file paths.' },
      pathPattern: { type: 'string', description: 'Regex pattern for path validation.' },
      schema: { type: 'SchemaConfig', description: 'JSON/YAML schema validation.' },
      frontmatter: { type: 'FrontmatterConfig', description: 'Markdown frontmatter validation.' },
      requiredCompanion: { type: 'CompanionRule[]', description: 'Required companion files.' },
      forbidContentPatterns: { type: 'string[]', description: 'Block files containing these patterns.' },
      templateHints: { type: 'string[]', description: 'Warn if these placeholders exist.' },
    },
  },
  plugins: {
    type: 'Plugin[]',
    required: false,
    description: 'External tool integrations.',
    children: {
      id: { type: 'string', required: true, description: 'Unique plugin identifier.' },
      enabled: { type: 'boolean', default: 'true', description: 'Whether plugin is active.' },
      install: { type: 'Command[]', description: 'Commands to install plugin dependencies.' },
      validate: { type: 'Command', description: 'Command to run for validation.' },
      fix: { type: 'Command', description: 'Command to run for auto-fix.' },
      severityOnFailure: { type: '"error" | "warning"', default: '"error"', description: 'Severity when plugin fails.' },
    },
  },
  operations: {
    type: 'object',
    required: false,
    description: 'Git hooks and watcher configuration.',
    children: {
      hooks: {
        type: 'HooksConfig',
        description: 'Git hooks settings.',
        children: {
          enabled: { type: 'boolean', default: 'false', description: 'Enable git hooks.' },
          hook: { type: '"pre-commit" | "pre-push" | "both"', default: '"pre-commit"', description: 'Which hooks to install.' },
        },
      },
      watcher: {
        type: 'WatcherConfig',
        description: 'File watcher settings.',
        children: {
          enabled: { type: 'boolean', default: 'false', description: 'Enable file watcher.' },
          schedule: { type: 'string', description: 'Cron schedule for watcher.' },
          queueDir: { type: 'string', default: '"sort_queue"', description: 'Directory for quarantined files.' },
          minErrors: { type: 'number', default: '3', description: 'Minimum errors before quarantine.' },
          logFile: { type: 'string', description: 'Path to watcher log file.' },
        },
      },
    },
  },
};

function renderProperty(name, prop, depth = 0) {
  const indent = '  '.repeat(depth);
  const required = prop.required ? ' **(required)**' : '';
  const defaultVal = prop.default ? ` (default: \`${prop.default}\`)` : '';
  
  let content = `${indent}- \`${name}\`: \`${prop.type}\`${required}${defaultVal}\n`;
  content += `${indent}  ${prop.description}\n`;
  
  if (prop.children) {
    content += '\n';
    for (const [childName, childProp] of Object.entries(prop.children)) {
      content += renderProperty(childName, childProp, depth + 1);
    }
  }
  
  return content;
}

function generateMarkdown() {
  let content = `---
title: Configuration Schema
description: Complete reference for repotype.yaml configuration
---

{/* AUTO-GENERATED - DO NOT EDIT DIRECTLY */}
{/* Run: pnpm run docs:generate to regenerate */}

import { Aside } from '@astrojs/starlight/components';

## Config File

Repotype configuration is defined in \`repotype.yaml\` at your repository root.

\`\`\`yaml title="repotype.yaml"
version: "1"

defaults:
  unmatchedFiles: deny

folders:
  - id: example-folder
    path: src
    requiredFolders: [components]

files:
  - id: example-files
    glob: "**/*.ts"
    pathCase: kebab
\`\`\`

## Schema Reference

`;

  for (const [name, prop] of Object.entries(CONFIG_SCHEMA)) {
    content += `### \`${name}\`

**Type:** \`${prop.type}\`${prop.required ? ' **(required)**' : ''}

${prop.description}

`;

    if (prop.example) {
      content += `\`\`\`yaml
${name}: ${prop.example}
\`\`\`

`;
    }

    if (prop.children) {
      content += `**Properties:**

`;
      for (const [childName, childProp] of Object.entries(prop.children)) {
        content += renderProperty(childName, childProp, 0);
        content += '\n';
      }
    }

    content += '---\n\n';
  }

  content += `
## Type Definitions

### SchemaConfig

\`\`\`typescript
interface SchemaConfig {
  kind: "json" | "yaml";
  schema: string; // Path to JSON Schema file
}
\`\`\`

### FrontmatterConfig

\`\`\`typescript
interface FrontmatterConfig {
  required?: string[];      // Required field names
  schema?: string;          // Path to JSON Schema for frontmatter
}
\`\`\`

### CompanionRule

\`\`\`typescript
interface CompanionRule {
  pattern: string;  // Glob pattern relative to matched file
}
\`\`\`

### Command

\`\`\`typescript
interface Command {
  cmd: string;  // Shell command to execute
}
\`\`\`

## Full Example

\`\`\`yaml title="repotype.yaml"
version: "1"

extends:
  - ./profiles/base.yaml

defaults:
  unmatchedFiles: deny

folders:
  - id: src-structure
    path: src
    requiredFolders:
      - components
      - hooks
      - utils
    pathCase: kebab

  - id: docs-structure
    path: docs
    requiredFiles:
      - README.md
    allowedFolders:
      - guides
      - reference
      - api

files:
  - id: typescript
    glob: "src/**/*.{ts,tsx}"
    pathCase: kebab
    
  - id: react-components
    glob: "src/components/**/*.tsx"
    requiredCompanion:
      - pattern: "*.test.tsx"
      
  - id: markdown-docs
    glob: "docs/**/*.md"
    frontmatter:
      required:
        - title
        - description
      schema: schemas/doc.schema.json
      
  - id: package-json
    glob: "package.json"
    schema:
      kind: json
      schema: schemas/package.schema.json
      
  - id: all-files
    glob: "**/*"
    forbidContentPatterns:
      - "API_KEY\\\\s*="
      - "password\\\\s*[:=]"

plugins:
  - id: eslint
    enabled: true
    validate:
      cmd: "pnpm exec eslint ."
    fix:
      cmd: "pnpm exec eslint --fix ."
    severityOnFailure: error

operations:
  hooks:
    enabled: true
    hook: pre-commit
    
  watcher:
    enabled: false
    schedule: "*/15 * * * *"
    queueDir: sort_queue
    minErrors: 3
\`\`\`

---

<Aside>
This reference is auto-generated from the configuration schema.
Run \`pnpm run docs:generate\` to update.
</Aside>
`;

  return content;
}

// Main
mkdirSync(DOCS_DIR, { recursive: true });
const markdown = generateMarkdown();
writeFileSync(join(DOCS_DIR, 'config.mdx'), markdown);
console.log('✓ Generated reference/config.mdx');
