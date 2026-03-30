# Contributing to Repotype

## Scope

Repotype is a repository contract engine. Changes should preserve deterministic validation behavior and safe cleanup semantics.

## Local Development

```bash
pnpm --filter @supernal/repotype test
pnpm --filter @supernal/repotype build
```

## Contribution Rules

- Keep rule resolution deterministic.
- Prefer additive diagnostics over destructive behavior.
- Treat cleanup moves as high risk; keep `--dry-run` workflows documented.
- Maintain compatibility with `repotype.yaml` and legacy `repo-schema.yaml`.

## Pull Request Checklist

- [ ] Tests pass (`pnpm --filter @supernal/repotype test`)
- [ ] Build passes (`pnpm --filter @supernal/repotype build`)
- [ ] README updated if commands/config changed
- [ ] Examples updated if config schema changed
- [ ] Safety/rollback behavior documented for operations changes

## Commit Guidance

Use clear, traceable commit messages aligned with repository standards.

Examples:
- `feat(repotype): add watcher status inspection (REQ-XXX)`
- `fix(repotype): prevent cleanup move on low-confidence diagnostics (TASK-XXX)`
