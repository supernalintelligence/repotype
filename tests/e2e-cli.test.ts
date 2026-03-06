import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCLI } from '../src/cli/main.js';

function makeE2ERepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-e2e-'));
  fs.mkdirSync(path.join(root, '.git', 'hooks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'examples', 'templates'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
operations:
  hooks:
    enabled: true
    hook: both
  watcher:
    enabled: false
templates:
  - id: requirement
    path: examples/templates/requirement.md
files:
  - glob: "docs/requirements/**/*.md"
    requiredSections:
      - Description
    template:
      id: requirement
      enforce: true
`,
  );

  fs.writeFileSync(
    path.join(root, 'examples', 'templates', 'requirement.md'),
    `---
id: "REQ-XXX"
title: ""
---

## Description

[Description]
`,
  );

  fs.writeFileSync(
    path.join(root, 'docs', 'requirements', 'req-demo.md'),
    `---
id: "REQ-DEMO-001"
---

# Broken Doc
`,
  );

  return root;
}

function makePluginE2ERepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-plugin-e2e-'));
  fs.mkdirSync(path.join(root, '.git', 'hooks'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
plugins:
  - id: plugin-install
    install:
      - cmd: 'node -e "process.exit(0)"'
  - id: plugin-validate
    validate:
      cmd: 'node -e "process.exit(0)"'
`,
  );
  fs.writeFileSync(path.join(root, 'README.md'), '# plugin-e2e\n');
  return root;
}

function makeConfigOverrideE2ERepo(): { repoRoot: string; configPath: string } {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-config-e2e-'));
  const configRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-config-file-e2e-'));
  fs.mkdirSync(path.join(repoRoot, '.supernal', 'features'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, '.supernal', 'requirements'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, '.supernal', 'traceability'), { recursive: true });

  fs.writeFileSync(path.join(repoRoot, 'supernal.yaml'), 'version: "1"\n');
  fs.writeFileSync(
    path.join(repoRoot, '.supernal', 'features', 'FEAT-DEMO-001.md'),
    `# Feature\n\n## Scope\n\nok\n\n## Evidence\n\nok\n`,
  );
  fs.writeFileSync(
    path.join(repoRoot, '.supernal', 'requirements', 'README.md'),
    `# Requirements\n\n## Requirement Summary\n\nok\n\n## Traceability\n\nok\n`,
  );
  fs.writeFileSync(
    path.join(repoRoot, '.supernal', 'requirements', 'REQ-DEMO-001.md'),
    `# Requirement\n\n## Acceptance Criteria\n\n- ok\n\n## Notes\n\nok\n`,
  );
  fs.writeFileSync(
    path.join(repoRoot, '.supernal', 'traceability', 'traceability.md'),
    `# Repotype Requirement Traceability\n\n## Summary\n\nok\n\n## Matrix\n\nok\n`,
  );

  const configPath = path.join(configRoot, 'supernal-profile.yaml');
  fs.writeFileSync(
    configPath,
    `version: "1"
folders:
  - path: .supernal
    requiredFolders:
      - features
      - requirements
      - traceability
files:
  - glob: "supernal.yaml"
  - glob: ".supernal/features/*.md"
    filenamePattern: "^FEAT-[A-Z0-9-]+.*\\\\.md$"
    requiredSections:
      - Feature
      - Scope
      - Evidence
  - glob: ".supernal/requirements/REQ-*.md"
    filenamePattern: "^REQ-[A-Z0-9-]+.*\\\\.md$"
    requiredSections:
      - Requirement
      - Acceptance Criteria
      - Notes
  - glob: ".supernal/requirements/README.md"
    requiredSections:
      - Requirements
      - Requirement Summary
      - Traceability
  - glob: ".supernal/traceability/traceability.md"
    requiredSections:
      - Repotype Requirement Traceability
      - Summary
      - Matrix
`,
  );

  return { repoRoot, configPath };
}

describe('repotype CLI e2e', () => {
  it('init writes generic preset config', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-init-e2e-'));
    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;
    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const code = await runCLI([
        'node',
        'repotype',
        'init',
        root,
      ]);
      expect(code).toBe(0);
      const configPath = path.join(root, 'repotype.yaml');
      expect(fs.existsSync(configPath)).toBe(true);
      expect(fs.readFileSync(configPath, 'utf8')).toContain('docs/requirements/**/*.md');
      expect(out).toContain('source: preset:default');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });

  it('validate emits JSON and non-zero for invalid repo', async () => {
    const root = makeE2ERepo();

    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;

    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const code = await runCLI(['node', 'repotype', 'validate', root, '--json']);
      expect(code).toBe(1);
      expect(out).toContain('"ok": false');
      expect(out).toContain('missing_section');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });

  it('apply installs configured hooks and status reports state', async () => {
    const root = makeE2ERepo();

    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;
    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const applyCode = await runCLI(['node', 'repotype', 'apply', root, '--json']);
      expect(applyCode).toBe(0);

      const preCommit = fs.readFileSync(path.join(root, '.git', 'hooks', 'pre-commit'), 'utf8');
      const prePush = fs.readFileSync(path.join(root, '.git', 'hooks', 'pre-push'), 'utf8');
      expect(preCommit).toContain('repotype-checks');
      expect(prePush).toContain('repotype-checks');

      out = '';
      const statusCode = await runCLI(['node', 'repotype', 'status', root, '--json']);
      expect(statusCode).toBe(0);
      expect(out).toContain('"managed": true');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });

  it('generate schema infers frontmatter schema from content', async () => {
    const root = makeE2ERepo();
    const output = path.join(root, 'examples', 'schemas', 'generated.schema.json');
    fs.mkdirSync(path.dirname(output), { recursive: true });

    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;
    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const code = await runCLI(['node', 'repotype', 'generate', 'schema', path.join(root, 'docs'), output]);
      expect(code).toBe(0);
      expect(fs.existsSync(output)).toBe(true);
      expect(out).toContain('schema written:');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });

  it('plugins status/install commands report configured plugin requirements', async () => {
    const root = makePluginE2ERepo();
    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;
    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const statusCode = await runCLI(['node', 'repotype', 'plugins', 'status', root, '--json']);
      expect(statusCode).toBe(0);
      expect(out).toContain('plugin-validate');

      out = '';
      const installCode = await runCLI(['node', 'repotype', 'plugins', 'install', root, '--json']);
      expect(installCode).toBe(0);
      expect(out).toContain('"ok": true');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });

  it('report command emits markdown and json output', async () => {
    const root = makeE2ERepo();

    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;
    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const markdownCode = await runCLI(['node', 'repotype', 'report', root]);
      expect(markdownCode).toBe(1);
      expect(out).toContain('Repotype Compliance Report');

      out = '';
      const jsonCode = await runCLI(['node', 'repotype', 'report', root, '--json']);
      expect(jsonCode).toBe(1);
      expect(out).toContain('"generatedAt"');
      expect(out).toContain('"totals"');

      out = '';
      const reportFile = path.join(root, '.repotype', 'reports', 'compliance.html');
      const htmlCode = await runCLI([
        'node',
        'repotype',
        'report',
        root,
        '--format',
        'html',
        '--output',
        reportFile,
      ]);
      expect(htmlCode).toBe(1);
      expect(fs.existsSync(reportFile)).toBe(true);
      expect(fs.readFileSync(reportFile, 'utf8')).toContain('<!doctype html>');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });

  it('validate accepts external config override', async () => {
    const { repoRoot, configPath } = makeConfigOverrideE2ERepo();
    let out = '';
    const originalLog = console.log;
    process.exitCode = 0;
    console.log = (...args: unknown[]) => {
      out += `${args.join(' ')}\n`;
    };

    try {
      const code = await runCLI(['node', 'repotype', 'validate', repoRoot, '--json', '--config', configPath]);
      expect(code).toBe(0);
      expect(out).toContain('"ok": true');
    } finally {
      console.log = originalLog;
      process.exitCode = 0;
    }
  });
});
