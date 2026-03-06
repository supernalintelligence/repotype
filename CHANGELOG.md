# Changelog

All notable changes to `@supernal/repotype` are documented in this file.

## 0.1.0 - 2026-03-06

Initial release in this monorepo.

### Added

- Core config loader and rule engine
- Adapter-based validators (filename, markdown/template, frontmatter schema, cross-reference)
- CLI commands: `validate`, `fix`, `explain`, `scaffold`, `serve`
- Operations commands: `install-checks`, `install-watcher`, `cleanup-run`, `status`, `apply`
- Config-driven operations via `operations` in `repotype.yaml`
- Cleanup queue logs: `cleanup-log.jsonl` and `cleanup-log.md`
- Agent assets: Repotype skill and package `AGENTS.md`
