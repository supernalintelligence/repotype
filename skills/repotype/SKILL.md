---
name: repotype
description: Config-driven repository contract and markdown/frontmatter linting with cleanup automation. Use when validating repo structure, enforcing templates/schemas, installing git checks, managing watcher cron jobs, or triaging invalid files to sort_queue.
---

# repotype - Repository Contract Automation

Use this skill when you need deterministic repository governance for docs/code structure, template enforcement, and agent-safe cleanup workflows.

## Prerequisites

- Run from the `repotype` repository root
- `pnpm` available
- Repository config in `repotype.yaml` (or legacy `repo-schema.yaml`)

## Install The Skill (Codex)

Install into `$CODEX_HOME/skills` using one of the following:

```bash
# From this repository root
bash skills/repotype/scripts/install-local.sh
```

```bash
# Manual symlink install
mkdir -p "$CODEX_HOME/skills"
ln -sfn "$(pwd)/skills/repotype" "$CODEX_HOME/skills/repotype"
```

After install, agents can reference `repotype` directly.

## Primary Workflow

1. Validate and inspect
```bash
pnpm build
node bin/repotype.js validate . --json
node bin/repotype.js status . --json
node bin/repotype.js plugins status . --json
node bin/repotype.js report . --json --output .repotype/reports/compliance.json
node bin/repotype.js report . --format html --output .repotype/reports/compliance.html
```

2. Enforce config-driven operations
```bash
node bin/repotype.js apply .
```

3. Triage invalid files to `sort_queue`
```bash
node bin/repotype.js cleanup-run . --queue sort_queue --min-errors 3
```

## Config-Driven Operations

Define operations in `repotype.yaml`:

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

Then run:

```bash
node bin/repotype.js apply .
```

## High-Signal Commands

- `repotype validate [target] [--json]`
- `repotype fix [target]`
- `repotype explain <file> [--json]`
- `repotype status [target] [--json]`
- `repotype apply [target] [--json]`
- `repotype plugins status [target] [--json]`
- `repotype plugins install [target] [--json]`
- `repotype install-checks --hook both --target .`
- `repotype install-watcher --schedule "*/15 * * * *" --target .`
- `repotype cleanup-run [target] --queue sort_queue --min-errors 3 [--dry-run]`

## Safety Rules

- Default to `cleanup-run --dry-run` before first live run.
- Keep `minErrors` conservative (3+ recommended).
- Always inspect `sort_queue/cleanup-log.jsonl` after moves.
- Use `repotype status` before and after `apply` to confirm managed state.

## References

- [Repotype Commands](references/commands.md)
