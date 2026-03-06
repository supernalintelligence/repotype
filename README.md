# repotype

[![CI](https://github.com/supernalintelligence/repotype/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/supernalintelligence/repotype/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](https://github.com/supernalintelligence/repotype/blob/main/LICENSE)
[![tests](https://img.shields.io/badge/tests-51%20passing-16a34a)](https://github.com/supernalintelligence/repotype/actions/workflows/ci.yml)
[![docs](https://img.shields.io/badge/docs-github%20pages-0ea5e9)](https://supernalintelligence.github.io/repotype/)

Repotype is your repository contract engine.

It prevents repo drift by enforcing structure, templates, frontmatter schemas, and cross-references, while giving agents and CI deterministic outputs.

If your team has ever said "we thought this doc format was required" or "why did this file end up here?" this is for that.

## Install (npm)

Repotype is published on npm as `repotype` (latest: `0.1.0`).

```bash
# global CLI
npm install -g repotype

# OR run without installing globally
npx repotype validate .
```

Download/package page:

- npm: [npmjs.com/package/repotype](https://www.npmjs.com/package/repotype)
- source: [github.com/supernalintelligence/repotype](https://github.com/supernalintelligence/repotype)

## Why Repotype

- Define repository rules once in `repotype.yaml`
- Validate as CLI, service, and universal-command runtime
- Enforce git checks and watcher automation from config
- Triage severely invalid files into `sort_queue` with audit logs
- Enforce path/case policies and validate JSON/YAML files with JSON Schema

## 60-Second Quickstart

```bash
# 1) Initialize generic starter config
repotype init .

# 2) Validate current repo
repotype validate .

# 3) Inspect operations state
repotype status . --json

# 4) Apply operations declared in repotype.yaml
repotype apply .
```

## Share With Your Agents

Copy/paste blurb:

```text
Use repotype to enforce repository structure and doc contracts before writing files.
Run `repotype validate . --json` first, then only create or modify files that match repotype.yaml rules.
If validation fails, follow diagnostics or run `repotype fix` / `repotype cleanup-run` to restore compliance.
```

## Deny-by-default validation behavior

Repotype now defaults to **deny-by-default** for unmatched files.

- Diagnostic code: `no_matching_file_rule`
- Default severity: `error`
- Behavior: any scanned file path not explicitly matched by `files[*].glob` fails validation.

Legacy compatibility escape hatch:

```yaml
defaults:
  unmatchedFiles: allow
```

In permissive mode, unmatched files emit `suggestion` diagnostics instead of errors.

Strict root allowlist preset is available via:

```bash
repotype init . --type strict
```

## Core Commands

- `repotype validate [target] [--json]`
- `repotype report [target] [--json] [--output report.md]`
- `repotype fix [target]`
- `repotype explain <file> [--json]`
- `repotype scaffold <templateId> <output> --set key=value`
- `repotype generate schema <target> <output> [--pattern "**/*.md"]`
- `repotype init [target] [--type default|strict] [--from path/to/profile.yaml] [--force]`
- `repotype cleanup-run [target] --queue sort_queue --min-errors 3 [--dry-run] [--json]`
- `repotype status [target] [--json]`
- `repotype apply [target] [--json]`
- `repotype install-checks --hook both --target .`
- `repotype install-watcher --schedule "*/15 * * * *" --target .`
- `repotype plugins status [target] [--json]`
- `repotype plugins install [target] [--json]`
- `repotype serve --port 4310`

## Separation of Concerns

Repotype stays framework-neutral. It does not ship framework-specific types (for example, Supernal).

Frameworks should own their own `repotype.yaml` profile and use Repotype as the validator runtime.

You can initialize from an external profile file:

```bash
repotype init . --from ./profiles/supernal/repotype.yaml
```

Repotype configs support inheritance via `extends`:

```yaml
version: "1"
extends:
  - "../../profiles/repotype/repotype.yaml"
  - "../../profiles/supernal/repotype.yaml"
```

This is the recommended way for agents to classify repo type by contract: inspect `repotype.yaml` inheritance chain.

## Config

Place `repotype.yaml` at repository root.

Legacy `repo-schema.yaml` is also supported for migration compatibility.

See full sample: `packages/repotype/examples/repotype.yaml`

### Operations (Config-Driven)

```yaml
operations:
  hooks:
    enabled: true
    hook: both
  watcher:
    enabled: true
    schedule: "*/15 * * * *"
    queueDir: "sort_queue"
    minErrors: 3
    logFile: ".repotype/logs/watcher.log"
```

Then apply and inspect:

```bash
repotype apply .
repotype status .
```

### Plugin Requirements (Wrapper For External Linters)

Repotype can install and run external tools (for example markdown linters and biome/eslint) as plugin requirements.

```yaml
plugins:
  - id: markdownlint
    enabled: false
    install:
      - cmd: "pnpm add -D markdownlint-cli2"
    validate:
      cmd: "pnpm exec markdownlint-cli2 \"**/*.md\""
    severityOnFailure: error

  - id: biome
    enabled: false
    install:
      - cmd: "pnpm add -D @biomejs/biome"
    validate:
      cmd: "pnpm exec biome check ."
    fix:
      cmd: "pnpm exec biome check --write ."
    severityOnFailure: warning
```

Commands:

```bash
repotype plugins status . --json
repotype plugins install . --json
repotype validate . --json  # includes plugin validate diagnostics
repotype fix .              # runs repotype autofix + plugin fix commands
```

### Compliance Reports

Generate a readable compliance report (Markdown by default):

```bash
repotype report . --output .repotype/reports/compliance.md
```

Generate JSON report for automation:

```bash
repotype report . --json --output .repotype/reports/compliance.json
```

Generate HTML report for direct publish/embed in docs sites:

```bash
repotype report . --format html --output .repotype/reports/compliance.html
```

SDK helpers for other sites:

```ts
import {
  parseComplianceReportJson,
  renderComplianceReportFromJson,
} from 'repotype';

const json = await fetch('/evidence/repotype-package.compliance.json').then((r) => r.text());
const report = parseComplianceReportJson(json);
const html = renderComplianceReportFromJson(json, 'html');
```

### Folder Structure Rules

Repotype also enforces repository layout constraints:

```yaml
folders:
  - id: docs-root
    path: docs
    requiredFolders:
      - requirements
    allowedFolders:
      - requirements
      - architecture
    requiredFiles:
      - README.md
    allowedFiles:
      - README.md
```

### Path Case And Pattern Rules

```yaml
files:
  - id: source-path-policy
    glob: "src/**/*.ts"
    pathCase: kebab
    pathPattern: '^src/[a-z0-9\\-/]+\\.ts$'
```

### JSON/YAML File Schema Rules

```yaml
files:
  - id: app-config-json
    glob: "config/**/*.json"
    schema:
      kind: json
      schema: schemas/app-config.schema.json

  - id: service-config-yaml
    glob: "config/**/*.yaml"
    schema:
      kind: yaml
      schema: schemas/service-config.schema.json
```

### Content Policy (What Not Allowed)

You can block unsafe content patterns directly in file rules:

```yaml
files:
  - id: repotype-docs
    glob: "docs/features/developer-tooling/repotype/*.md"
    forbidContentPatterns:
      - "API_KEY ="
      - "BEGIN_PRIVATE_KEY"
      - "password\\s*:"
```

If a pattern matches, validation returns `forbidden_content_pattern` as an error.

### Template Hint Rules (Config-Only)

Repotype does not use built-in template hint strings. Hint checks run only when declared in file rules.

```yaml
files:
  - id: requirement-md
    glob: "docs/requirements/**/*.md"
    templateHints:
      - "[Description]"
      - "TODO:"
      - "FIXME:"
```

If a configured hint appears, validation returns `template_hint_present` as a warning.

### Schema Generation From Existing Content

Generate a starter frontmatter schema from current markdown content:

```bash
repotype generate schema docs/features/developer-tooling/repotype schemas/repotype/feature-doc.frontmatter.schema.json
```

This helps bootstrap or update schemas when your documents are already in good shape.

## Safety and Cleanup Policy

`cleanup-run` is intentionally conservative and threshold-based.

A file is moved to `sort_queue` only when its error count meets `--min-errors`.

Recommended rollout:

```bash
repotype cleanup-run . --queue sort_queue --min-errors 3 --dry-run
repotype cleanup-run . --queue sort_queue --min-errors 3
```

Audit logs are always written when moves are made:

- `sort_queue/cleanup-log.jsonl`
- `sort_queue/cleanup-log.md`

## Rollback / Disable Operations

Repotype is declarative: disable in config and re-apply.

```yaml
operations:
  hooks:
    enabled: false
  watcher:
    enabled: false
```

```bash
repotype apply .
```

## CI Integration (GitHub Actions)

```yaml
name: repotype
on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter repotype build
      - run: pnpm --filter repotype exec -- node bin/repotype.js validate . --json
      - run: pnpm --filter repotype exec -- node bin/repotype.js report . --json --output .repotype/reports/compliance.json
      - uses: actions/upload-artifact@v4
        with:
          name: repotype-evidence
          path: .repotype/reports/**
```

This repository's `repotype.yml` workflow now generates:

- `.repotype/reports/repotype-package.compliance.json`
- `.repotype/reports/repotype-package.compliance.html`
- `.repotype/reports/repotype-package.compliance.md`

and uploads them as the `repotype-evidence` artifact.

On `push` to `main`, the same workflow also uploads `.repotype/publish` as a Pages artifact and deploys it to GitHub Pages automatically.

## Service API

- `GET /health`
- `POST /validate` body: `{ "target": "." }`
- `POST /explain` body: `{ "target": "docs/requirements/req-example.md" }`

## Universal Command Exports

- `repotypeValidateCommand`
- `repotypeReportCommand`
- `repotypeFixCommand`
- `repotypeCleanupRunCommand`
- `repotypeInstallChecksCommand`
- `repotypeInstallWatcherCommand`
- `repotypeExplainCommand`
- `repotypeStatusCommand`
- `repotypeApplyCommand`
- `repotypeScaffoldCommand`
- `repotypeGenerateSchemaCommand`
- `repotypePluginsStatusCommand`
- `repotypePluginsInstallCommand`

## Project Files

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [ROADMAP.md](./ROADMAP.md)
- [LICENSE](./LICENSE)
- Simple site starter: [site/index.html](./site/index.html)

## Testing

Repotype includes:

- Unit/integration tests (`vitest`)
- E2E CLI workflow tests (`tests/e2e-cli.test.ts`)
- Generated CLI surface tests from universal-command exports (`tests/generated/universal-cli.generated.test.ts`)
- Universal-command test harness integration (`tests/universal-interface.integration.test.ts`)

Current baseline: 51 tests across 7 Vitest files (updated March 6, 2026).

Generate + run:

```bash
pnpm --filter repotype test
pnpm --filter repotype test:e2e
```

## Agents

- Skill: `skills/repotype/SKILL.md`
- Skill installer: `skills/repotype/scripts/install-local.sh`
- Agent guide: `packages/repotype/AGENTS.md`

## Supernal Workflow

Repotype is initialized as a package-level Supernal repo:

- Config: `packages/repotype/supernal.yaml`
- Local requirements: `packages/repotype/.supernal/requirements/`
- Gherkin stories: `packages/repotype/stories/`
- Local features: `packages/repotype/.supernal/features/`
- Traceability matrix: `packages/repotype/.supernal/traceability/`
- Package standards config: `packages/repotype/repotype.yaml`

Generate Supernal Interface story tests:

```bash
si generate-story-tests packages/repotype/stories --output packages/repotype/tests/generated/stories
```

Generate and verify requirement traceability:

```bash
pnpm --filter repotype traceability:generate
pnpm --filter repotype traceability:check
pnpm --filter repotype self:validate:all
pnpm --filter repotype self:report:all
```

## Migration Note

Repotype supersedes the initial `repo-schema` naming in this workspace.

- Prefer `repotype.yaml` going forward
- Existing `repo-schema.yaml` continues to load for compatibility

## License

MIT. See [LICENSE](https://github.com/supernalintelligence/repotype/blob/main/LICENSE).
