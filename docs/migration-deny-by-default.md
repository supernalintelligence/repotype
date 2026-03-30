# Migration Guide: Deny-by-default unmatched files

## What changed

Starting with this release, Repotype treats unmatched files as validation errors by default.

Before:
- `no_matching_file_rule` emitted as `suggestion`
- Validation could pass even when root/unmatched files were outside schema coverage

After:
- `no_matching_file_rule` emits as `error`
- Validation fails unless file paths are explicitly covered by `files[*].glob` or are Repotype system/reference files.

## Required action

Add explicit file rules for all intended paths, for example:

```yaml
files:
  - id: repo-readme
    glob: "README.md"
  - id: docs-markdown
    glob: "docs/**/*.md"
  - id: schemas-json
    glob: "schemas/**/*.json"
```

## Compatibility escape hatch (temporary)

If you need time to migrate, enable permissive mode:

```yaml
defaults:
  unmatchedFiles: allow
```

This keeps unmatched files as `suggestion` diagnostics.

## Recommended migration path

1. Run `repotype validate . --json` and collect all `no_matching_file_rule` diagnostics.
2. Add or broaden `files[*].glob` rules intentionally.
3. Re-run validation until unmatched diagnostics are gone.
4. Remove `defaults.unmatchedFiles: allow` once clean.

## Strict preset option

For new repos or full lock-down, initialize strict profile:

```bash
repotype init . --type strict
```

This preset uses deny-by-default plus a root allowlist model.
