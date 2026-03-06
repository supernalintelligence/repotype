import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  explainPath,
  fixPath,
  generateComplianceReport,
  generateSchemaFromContent,
  installPluginRequirements,
  pluginStatus,
  scaffoldFromTemplate,
  validatePath,
} from '../src/cli/use-cases.js';
import {
  parseComplianceReportJson,
  renderComplianceReportFromJson,
} from '../src/sdk/report-sdk.js';

function makeFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-test-'));
  fs.mkdirSync(path.join(root, 'examples', 'schemas'), { recursive: true });
  fs.mkdirSync(path.join(root, 'examples', 'templates'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
templates:
  - id: requirement
    path: examples/templates/requirement.md
files:
  - id: req
    glob: "docs/requirements/**/*.md"
    filenamePattern: "^req-[a-z0-9-]+\\\\.md$"
    forbidContentPatterns:
      - "API_KEY="
    schema:
      kind: frontmatter
      schema: examples/schemas/requirement.frontmatter.schema.json
    requiredSections:
      - Description
      - Acceptance Criteria
      - Test Strategy
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
status: "todo"
---

# {{title}}

## Description

[Description]

## Acceptance Criteria

- [ ] item

## Test Strategy

- unit
`,
  );

  fs.writeFileSync(
    path.join(root, 'examples', 'schemas', 'requirement.frontmatter.schema.json'),
    JSON.stringify({
      type: 'object',
      required: ['id', 'title', 'status'],
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        status: { type: 'string' },
      },
    }),
  );

  return root;
}

function makeFolderRuleFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-folder-test-'));
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'rogue'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
folders:
  - id: docs-root
    path: docs
    requiredFolders:
      - requirements
    allowedFolders:
      - requirements
    requiredFiles:
      - README.md
    allowedFiles:
      - README.md
`,
  );

  fs.writeFileSync(path.join(root, 'docs', 'requirements', 'req.md'), '# ok\n');
  fs.writeFileSync(path.join(root, 'docs', 'notes.txt'), 'not allowed\n');

  return root;
}

function makeUnmatchedRootFixture(mode: 'deny' | 'allow' = 'deny'): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-unmatched-root-'));
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
defaults:
  unmatchedFiles: ${mode}
files:
  - id: docs-md
    glob: "docs/**/*.md"
`,
  );

  fs.writeFileSync(path.join(root, 'docs', 'requirements', 'req-a.md'), '# okay\n');
  fs.writeFileSync(path.join(root, 'README.md'), '# unmatched root file\n');
  return root;
}

function makeIgnoreFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-ignore-test-'));
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scratch'), { recursive: true });
  fs.mkdirSync(path.join(root, 'generated'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
defaults:
  unmatchedFiles: deny
files:
  - id: docs-txt
    glob: "docs/**/*.txt"
`,
  );

  fs.writeFileSync(path.join(root, '.gitignore'), 'scratch/\n*.tmp\n');
  fs.writeFileSync(path.join(root, '.customignore'), 'generated/\n');
  fs.writeFileSync(path.join(root, 'docs', 'keep.txt'), 'kept\n');
  fs.writeFileSync(path.join(root, 'scratch', 'rogue.md'), '# should be ignored\n');
  fs.writeFileSync(path.join(root, 'generated', 'rogue.json'), '{"ignored":true}\n');
  fs.writeFileSync(path.join(root, 'rogue.tmp'), 'ignored by extension rule\n');

  return root;
}

function makeTypedFileFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-typed-test-'));
  fs.mkdirSync(path.join(root, 'config'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'Bad_Path'), { recursive: true });
  fs.mkdirSync(path.join(root, 'schemas'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
files:
  - id: json-config
    glob: "config/**/*.json"
    schema:
      kind: json
      schema: schemas/config.schema.json
  - id: yaml-config
    glob: "config/**/*.yaml"
    schema:
      kind: yaml
      schema: schemas/service.schema.json
  - id: path-policy
    glob: "src/**/*.ts"
    pathCase: kebab
    pathPattern: '^src/[a-z0-9\\-/]+\\.ts$'
`,
  );

  fs.writeFileSync(
    path.join(root, 'schemas', 'config.schema.json'),
    JSON.stringify({
      type: 'object',
      required: ['name', 'enabled'],
      properties: {
        name: { type: 'string' },
        enabled: { type: 'boolean' },
      },
      additionalProperties: true,
    }),
  );

  fs.writeFileSync(
    path.join(root, 'schemas', 'service.schema.json'),
    JSON.stringify({
      type: 'object',
      required: ['service', 'port'],
      properties: {
        service: { type: 'string' },
        port: { type: 'integer' },
      },
      additionalProperties: true,
    }),
  );

  return root;
}

function makePluginFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-plugin-test-'));
  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
plugins:
  - id: ok-install
    install:
      - cmd: 'node -e "process.exit(0)"'
  - id: sample-validate
    validate:
      cmd: 'node -e "process.exit(1)"'
    severityOnFailure: warning
  - id: sample-fix
    fix:
      cmd: 'node -e "process.exit(0)"'
`,
  );
  fs.writeFileSync(path.join(root, 'README.md'), '# sample\n');
  return root;
}

function makeExtendedConfigFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-extends-test-'));
  fs.mkdirSync(path.join(root, 'profiles'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs', 'requirements'), { recursive: true });

  fs.writeFileSync(
    path.join(root, 'profiles', 'base.yaml'),
    `version: "1"
files:
  - id: req-doc
    glob: "docs/requirements/**/*.md"
    requiredSections:
      - Description
`,
  );

  fs.writeFileSync(
    path.join(root, 'repotype.yaml'),
    `version: "1"
extends: "profiles/base.yaml"
`,
  );

  fs.writeFileSync(
    path.join(root, 'docs', 'requirements', 'req-a.md'),
    `# Requirement

No section
`,
  );

  return root;
}

describe('repotype', () => {
  it('validates and reports diagnostics', async () => {
    const root = makeFixtureRepo();
    const file = path.join(root, 'docs', 'requirements', 'req-auth.md');

    fs.writeFileSync(
      file,
      `---
id: "REQ-AUTH-001"
status: "todo"
---

# Requirement

## Description

TODO:
`,
    );

    const result = await validatePath(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it('explains effective rules', () => {
    const root = makeFixtureRepo();
    const file = path.join(root, 'docs', 'requirements', 'req-auth.md');
    fs.writeFileSync(file, '# test\n');

    const explained = explainPath(file);
    expect(explained.reason.length).toBeGreaterThan(0);
    expect(explained.effective.fileRules.length).toBe(1);
  });

  it('scaffolds from template', () => {
    const root = makeFixtureRepo();
    const output = path.join(root, 'docs', 'requirements', 'req-new.md');
    const created = scaffoldFromTemplate('requirement', output, { title: 'My Requirement' });

    expect(created).toBe(output);
    expect(fs.readFileSync(output, 'utf8')).toContain('# My Requirement');
  });

  it('applies safe fixes', async () => {
    const root = makeFixtureRepo();
    const file = path.join(root, 'docs', 'requirements', 'req-fix.md');

    fs.writeFileSync(
      file,
      `---
id: "REQ-FIX-001"
status: "todo"
---

# Title

## Description

[Description]
`,
    );

    const output = await fixPath(root);
    expect(output.fix.applied).toBeGreaterThan(0);
  });

  it('flags forbidden content patterns', async () => {
    const root = makeFixtureRepo();
    const file = path.join(root, 'docs', 'requirements', 'req-secret.md');
    fs.writeFileSync(
      file,
      `---
id: "REQ-SECRET-001"
title: "Secret"
status: "todo"
---

## Description

Do not include API_KEY=abcd in docs.

## Acceptance Criteria

- [ ] redacted

## Test Strategy

- lint
`,
    );

    const result = await validatePath(root);
    expect(result.diagnostics.some((d) => d.code === 'forbidden_content_pattern')).toBe(true);
  });

  it('loads and applies extended config profiles', async () => {
    const root = makeExtendedConfigFixtureRepo();
    const result = await validatePath(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'missing_section')).toBe(true);
  });

  it('generates frontmatter schema from markdown content', () => {
    const root = makeFixtureRepo();
    const docsDir = path.join(root, 'docs', 'requirements');
    fs.writeFileSync(
      path.join(docsDir, 'req-one.md'),
      `---
id: "REQ-ONE-001"
title: "One"
status: "todo"
priority: "high"
---
`,
    );
    fs.writeFileSync(
      path.join(docsDir, 'req-two.md'),
      `---
id: "REQ-TWO-001"
title: "Two"
status: "todo"
---
`,
    );

    const outputSchema = path.join(root, 'examples', 'schemas', 'generated.frontmatter.schema.json');
    const generated = generateSchemaFromContent(docsDir, outputSchema);

    expect(generated.filesParsed).toBe(2);
    expect(generated.required).toContain('id');
    expect(generated.required).toContain('title');
    expect(generated.required).toContain('status');
    const schema = JSON.parse(fs.readFileSync(outputSchema, 'utf8'));
    expect(schema.type).toBe('object');
    expect(schema.properties.id.type).toBe('string');
  });

  it('generates markdown and json compliance reports', async () => {
    const root = makeFixtureRepo();
    const file = path.join(root, 'docs', 'requirements', 'req-report.md');
    fs.writeFileSync(
      file,
      `---
id: "REQ-REPORT-001"
status: "todo"
---

## Description
`,
    );

    const markdownReport = await generateComplianceReport(root);
    expect(markdownReport.rendered).toContain('# Repotype Compliance Report');
    expect(markdownReport.report.totals.diagnostics).toBeGreaterThan(0);

    const jsonReport = await generateComplianceReport(root, 'json');
    expect(jsonReport.rendered).toContain('"generatedAt"');
    expect(jsonReport.report.byCode.length).toBeGreaterThan(0);

    const htmlReport = await generateComplianceReport(root, 'html');
    expect(htmlReport.rendered).toContain('<!doctype html>');
    expect(htmlReport.rendered).toContain('Repotype Compliance Report');

    const parsed = parseComplianceReportJson(jsonReport.rendered);
    expect(parsed.filesScanned).toBeGreaterThan(0);

    const htmlFromJson = renderComplianceReportFromJson(jsonReport.rendered, 'html');
    expect(htmlFromJson).toContain('<!doctype html>');
  });

  it('returns diagnostics instead of crashing on invalid frontmatter yaml', async () => {
    const root = makeFixtureRepo();
    const file = path.join(root, 'docs', 'requirements', 'req-bad.md');
    fs.writeFileSync(
      file,
      `---
description: something: else
---
`,
    );

    const result = await validatePath(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'invalid_frontmatter_yaml')).toBe(true);
  });

  it('enforces folder structure rules from folders config', async () => {
    const root = makeFolderRuleFixtureRepo();
    const result = await validatePath(root);

    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'disallowed_child_folder')).toBe(true);
    expect(result.diagnostics.some((d) => d.code === 'disallowed_child_file')).toBe(true);
    expect(result.diagnostics.some((d) => d.code === 'required_file_missing')).toBe(true);
  });

  it('validates JSON and YAML files against bound schemas', async () => {
    const root = makeTypedFileFixtureRepo();
    fs.writeFileSync(path.join(root, 'config', 'app.json'), JSON.stringify({ name: 'app' }));
    fs.writeFileSync(path.join(root, 'config', 'service.yaml'), 'service: api\nport: "3000"\n');

    const result = await validatePath(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'file_schema_violation')).toBe(true);
  });

  it('enforces file path case and path pattern rules', async () => {
    const root = makeTypedFileFixtureRepo();
    fs.writeFileSync(path.join(root, 'config', 'app.json'), JSON.stringify({ name: 'app', enabled: true }));
    fs.writeFileSync(path.join(root, 'config', 'service.yaml'), 'service: api\nport: 3000\n');
    fs.writeFileSync(path.join(root, 'src', 'Bad_Path', 'BadFile.ts'), 'export const x = 1;\n');

    const result = await validatePath(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'path_case_mismatch')).toBe(true);
    expect(result.diagnostics.some((d) => d.code === 'path_pattern_mismatch')).toBe(true);
  });

  it('runs plugin validation commands and reports failures as diagnostics', async () => {
    const root = makePluginFixtureRepo();
    const result = await validatePath(root);
    expect(result.diagnostics.some((d) => d.code === 'plugin_validate_failed')).toBe(true);
    const pluginFailure = result.diagnostics.find((d) => d.code === 'plugin_validate_failed');
    expect(pluginFailure?.severity).toBe('warning');
  });

  it('runs plugin install commands and reports status', () => {
    const root = makePluginFixtureRepo();
    const installs = installPluginRequirements(root);
    expect(installs.ok).toBe(true);
    expect(installs.installs.length).toBe(1);
    expect(installs.installs[0].id).toBe('ok-install');

    const status = pluginStatus(root);
    expect(status.plugins.length).toBe(3);
    expect(status.plugins.some((p) => p.id === 'sample-validate' && p.hasValidate)).toBe(true);
  });

  it('fails unmatched root files by default (deny-by-default)', async () => {
    const root = makeUnmatchedRootFixture('deny');
    const result = await validatePath(root);

    expect(result.ok).toBe(false);
    const unmatched = result.diagnostics.find((d) => d.code === 'no_matching_file_rule' && d.file.endsWith('README.md'));
    expect(unmatched?.severity).toBe('error');
  });

  it('supports legacy permissive mode via defaults.unmatchedFiles=allow', async () => {
    const root = makeUnmatchedRootFixture('allow');
    const result = await validatePath(root);

    expect(result.ok).toBe(true);
    const unmatched = result.diagnostics.find((d) => d.code === 'no_matching_file_rule' && d.file.endsWith('README.md'));
    expect(unmatched?.severity).toBe('suggestion');
  });

  it('ignores paths from .gitignore and .*ignore* files during validation', async () => {
    const root = makeIgnoreFixtureRepo();
    const result = await validatePath(root);

    expect(result.ok).toBe(true);
    expect(result.diagnostics.some((d) => d.code === 'no_matching_file_rule' && d.file.endsWith('rogue.tmp'))).toBe(
      false,
    );
    expect(
      result.diagnostics.some((d) => d.code === 'no_matching_file_rule' && d.file.includes('/scratch/rogue.md')),
    ).toBe(false);
    expect(
      result.diagnostics.some((d) => d.code === 'no_matching_file_rule' && d.file.includes('/generated/rogue.json')),
    ).toBe(false);
  });

  it('ignores .gitignore and .*ignore* paths in schema generation', () => {
    const root = makeIgnoreFixtureRepo();
    const outputSchema = path.join(root, 'schema.json');
    fs.writeFileSync(path.join(root, 'docs', 'included.md'), '---\nid: "A"\n---\n');
    fs.writeFileSync(path.join(root, 'scratch', 'ignored.md'), '---\nid: "B"\n---\n');

    const generated = generateSchemaFromContent(root, outputSchema, '**/*.md');
    expect(generated.filesParsed).toBe(1);
  });

  it('runs plugin fix commands through repotype fix', async () => {
    const root = makePluginFixtureRepo();
    const result = await fixPath(root);
    expect(result.validation.diagnostics.some((d) => d.code === 'plugin_fix_ok')).toBe(true);
  });
});
