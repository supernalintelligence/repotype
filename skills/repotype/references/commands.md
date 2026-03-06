# Repotype Commands

## Validation

- `repotype validate .`
- `repotype validate docs/requirements --json`
- `repotype explain docs/requirements/req-x.md`

## Operations

- `repotype status . --json`
- `repotype apply .`

## Hooks/Watcher

- `repotype install-checks --hook both --target .`
- `repotype install-watcher --target . --schedule "*/15 * * * *"`

## Cleanup

- `repotype cleanup-run . --queue sort_queue --min-errors 3 --dry-run`
- `repotype cleanup-run . --queue sort_queue --min-errors 3`

## Logs

- `sort_queue/cleanup-log.jsonl`
- `sort_queue/cleanup-log.md`
