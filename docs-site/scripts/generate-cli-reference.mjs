#!/usr/bin/env node
/**
 * Auto-generate CLI reference documentation from repotype --help output
 * Run: node scripts/generate-cli-reference.mjs
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, '../src/content/docs/reference');
const REPOTYPE_BIN = join(__dirname, '../../bin/repotype.js');

// Commands to document
const COMMANDS = [
  { name: 'validate', description: 'Validate repository against rules' },
  { name: 'fix', description: 'Auto-fix violations' },
  { name: 'report', description: 'Generate compliance reports' },
  { name: 'explain', description: 'Explain rules for a specific file' },
  { name: 'init', description: 'Initialize repotype.yaml config' },
  { name: 'status', description: 'Show operations status' },
  { name: 'apply', description: 'Apply operations (hooks, watcher)' },
  { name: 'scaffold', description: 'Generate files from templates' },
  { name: 'cleanup-run', description: 'Move severely invalid files to queue' },
  { name: 'install-checks', description: 'Install git hooks' },
  { name: 'install-watcher', description: 'Install file watcher' },
  { name: 'generate schema', description: 'Generate schema from existing files' },
  { name: 'plugins status', description: 'Show plugin status' },
  { name: 'plugins install', description: 'Install plugin dependencies' },
  { name: 'serve', description: 'Start HTTP API server' },
];

function getHelp(command) {
  try {
    const cmd = command ? `node ${REPOTYPE_BIN} ${command} --help` : `node ${REPOTYPE_BIN} --help`;
    return execSync(cmd, { encoding: 'utf-8', cwd: join(__dirname, '../..') });
  } catch (e) {
    return e.stdout || '';
  }
}

function parseHelp(helpText) {
  const lines = helpText.split('\n');
  const sections = { usage: '', description: '', options: [], arguments: [] };
  
  let currentSection = 'description';
  
  for (const line of lines) {
    if (line.startsWith('Usage:')) {
      sections.usage = line.replace('Usage:', '').trim();
    } else if (line.includes('Options:')) {
      currentSection = 'options';
    } else if (line.includes('Arguments:')) {
      currentSection = 'arguments';
    } else if (currentSection === 'options' && line.trim().startsWith('-')) {
      sections.options.push(line.trim());
    } else if (currentSection === 'arguments' && line.trim()) {
      sections.arguments.push(line.trim());
    } else if (currentSection === 'description' && line.trim() && !sections.description) {
      sections.description = line.trim();
    }
  }
  
  return sections;
}

function generateMarkdown() {
  const mainHelp = getHelp('');
  
  let content = `---
title: CLI Commands
description: Complete reference for all Repotype CLI commands
---

{/* AUTO-GENERATED - DO NOT EDIT DIRECTLY */}
{/* Run: pnpm run docs:generate to regenerate */}

import { Aside } from '@astrojs/starlight/components';

## Overview

\`\`\`bash
${mainHelp.split('\n').slice(0, 15).join('\n')}
\`\`\`

## Commands

`;

  for (const cmd of COMMANDS) {
    const help = getHelp(cmd.name);
    const parsed = parseHelp(help);
    
    const cmdName = cmd.name.replace(' ', '-');
    
    content += `### ${cmd.name}

${cmd.description}

\`\`\`bash
repotype ${cmd.name} ${parsed.usage || '[options]'}
\`\`\`

`;

    if (parsed.options.length > 0) {
      content += `**Options:**

| Flag | Description |
|------|-------------|
`;
      for (const opt of parsed.options) {
        // Parse option line like "-o, --output <file>  Output file path"
        const match = opt.match(/^(-[^\s]+(?:,\s*--[^\s]+)?(?:\s+<[^>]+>)?)\s+(.+)$/);
        if (match) {
          content += `| \`${match[1].trim()}\` | ${match[2].trim()} |\n`;
        } else {
          content += `| \`${opt}\` | |\n`;
        }
      }
      content += '\n';
    }

    content += `<details>
<summary>Full help output</summary>

\`\`\`
${help}
\`\`\`

</details>

---

`;
  }

  content += `
## Global Options

These options work with all commands:

| Flag | Description |
|------|-------------|
| \`--help\` | Show help for command |
| \`--version\` | Show version number |
| \`--json\` | Output in JSON format |

## Exit Codes

| Code | Meaning |
|------|---------|
| \`0\` | Success |
| \`1\` | Validation errors found |
| \`2\` | Configuration or runtime error |

---

<Aside>
This reference is auto-generated from CLI help output.
Run \`pnpm run docs:generate\` to update.
</Aside>
`;

  return content;
}

// Main
mkdirSync(DOCS_DIR, { recursive: true });
const markdown = generateMarkdown();
writeFileSync(join(DOCS_DIR, 'cli.mdx'), markdown);
console.log('✓ Generated reference/cli.mdx');
