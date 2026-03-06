# AGENTS.md - Repotype

## Purpose

Repotype enforces repository-level contracts for structure, markdown/frontmatter quality, templates, and cross-reference integrity. It also supports config-driven operations for git checks, watcher installation, and cleanup triage.

## Use This Package For

- Repository validation: `repotype validate`
- Compliance reports: `repotype report`
- Profile bootstrap: `repotype init` or `repotype init --from <profile.yaml>`
- Rule explainability: `repotype explain`
- Safe autofix: `repotype fix`
- Managed operations: `repotype status` + `repotype apply`
- Plugin wrappers: `repotype plugins status` + `repotype plugins install`
- Automated cleanup to queue: `repotype cleanup-run`

## Install Repotype Skill (For Agents)

From repository root:

```bash
bash skills/repotype/scripts/install-local.sh
```

Manual alternative:

```bash
mkdir -p "$CODEX_HOME/skills"
ln -sfn "$(pwd)/skills/repotype" "$CODEX_HOME/skills/repotype"
```

Skill definition:

- `skills/repotype/SKILL.md`

## Recommended Agent Workflow

1. Build and validate package
```bash
pnpm --filter @supernal/repotype build
pnpm --filter @supernal/repotype exec -- node bin/repotype.js init . --force
pnpm --filter @supernal/repotype exec -- node bin/repotype.js validate . --json
```

2. Check managed state
```bash
pnpm --filter @supernal/repotype exec -- node bin/repotype.js status . --json
pnpm --filter @supernal/repotype exec -- node bin/repotype.js report . --json --output .repotype/reports/compliance.json
pnpm --filter @supernal/repotype exec -- node bin/repotype.js report . --format html --output .repotype/reports/compliance.html
```

3. Apply declared operations in `repotype.yaml`
```bash
pnpm --filter @supernal/repotype exec -- node bin/repotype.js apply .
pnpm --filter @supernal/repotype exec -- node bin/repotype.js plugins status . --json
pnpm --filter @supernal/repotype exec -- node bin/repotype.js plugins install . --json
```

4. Cleanup triage (start dry-run)
```bash
pnpm --filter @supernal/repotype exec -- node bin/repotype.js cleanup-run . --queue sort_queue --min-errors 3 --dry-run
```

## Config Contract

Repotype reads `repotype.yaml` (fallback: `repo-schema.yaml`) and supports:

- `files`/`folders`/`templates`/`rules` for validation
- `operations` for hooks/watcher automation
- `plugins` for external lint/fix wrappers (markdownlint, biome, eslint, etc.)
- `extends` for profile inheritance/import (relative file paths)

Package-level Supernal config:

- `packages/repotype/supernal.yaml`
- local requirements in `packages/repotype/.supernal/requirements`
- local features in `packages/repotype/.supernal/features`
- Gherkin stories in `packages/repotype/stories`
- traceability outputs in `packages/repotype/.supernal/traceability`
- package standards rules in `packages/repotype/repotype.yaml`

Framework profiles should live outside Repotype core:

- Use `repotype init <target> --from <framework-profile.yaml>` to bootstrap.
- Keep framework-specific rules (for example Supernal) in that framework's own profile source.

## Supernal-Type Definition

A repo is Supernal-type when both are true:

- It has a `repotype.yaml` contract.
- Its contract inherits a Supernal profile (for example `profiles/supernal/repotype.yaml`) and validates both governance and code layout.

Recommended layering:

1. Base repotype profile (shared core contract)
2. Supernal governance profile (framework contract)
3. Repo-local overlay rules

Agent check:

- Read `repotype.yaml`.
- Resolve `extends` chain.
- Confirm Supernal profile is in the chain.

Generate SI story tests:

```bash
si generate-story-tests packages/repotype/stories --output packages/repotype/tests/generated/stories
pnpm --filter @supernal/repotype traceability:check
pnpm --filter @supernal/repotype self:validate:all
pnpm --filter @supernal/repotype self:report:all
```

Minimal operations example:

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

Minimal plugin wrapper example:

```yaml
plugins:
  - id: markdownlint
    enabled: false
    install:
      - cmd: "pnpm add -D markdownlint-cli2"
    validate:
      cmd: "pnpm exec markdownlint-cli2 \"**/*.md\""
    severityOnFailure: error
```

Plugin command execution behavior:

- Plugin commands run from repo root by default.
- Set `cwd` on a plugin command when the tool should run from a subdirectory.

## Logs and Evidence

When cleanup moves files, inspect:

- `sort_queue/cleanup-log.jsonl`
- `sort_queue/cleanup-log.md`

These are the audit trail for what changed and why.

## Self-Validation (This Repo)

From repo root:

```bash
pnpm --filter @supernal/repotype exec -- node bin/repotype.js validate . --json
```
