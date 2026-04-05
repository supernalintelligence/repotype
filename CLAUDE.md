# Repotype - Repository Structure Validation

Repo-level linting and structure validation engine. Validates filenames, paths, folder structure, markdown templates, frontmatter schemas, file schemas, cross-references, content policies, and guidance rules -- NOT code linting. v0.1.1, MIT, open source.

## Tech Stack

- TypeScript (ESM, `"type": "module"`)
- Build: tsup
- Test: Vitest
- Runtime: Node.js >= 20
- Config: YAML (`repotype.yaml` or `repo-schema.yaml`)
- Dependencies: `@supernal/universal-command`, ajv, express, handlebars, js-yaml, minimatch, glob

## Build & Test

```bash
pnpm run build          # tsup
pnpm test               # generates CLI tests first, then vitest run
pnpm run test:e2e       # end-to-end CLI + universal interface tests
pnpm run typecheck      # tsc --noEmit
pnpm run self:validate  # validate this repo against its own repotype.yaml
```

## Repo Structure

```
src/
  core/           # Engine internals
    types.ts        # All type definitions (Diagnostic, RepoSchemaConfig, ValidatorAdapter, etc.)
    config-loader.ts  # YAML config loading with inheritance (extends) and circular detection
    validator-framework.ts  # ValidationEngine - orchestrates adapters over scanned files
    rule-engine.ts    # Resolves effective rules for a file path
    autofix.ts        # Safe autofix application
    plugin-runner.ts  # External plugin execution
    template-engine.ts  # Handlebars-based scaffolding
    schema-generator.ts  # Generate JSON schemas from content
    presets.ts        # Built-in preset configs
    path-ignore.ts    # .gitignore-style path exclusion
    glob.ts           # Glob utilities
    markdown.ts       # Markdown/frontmatter parsing
  adapters/       # 9 validator adapters (each implements ValidatorAdapter interface)
    filename-adapter.ts       # Filename pattern matching
    path-policy-adapter.ts    # Path casing (kebab/snake/camel/lower) and unmatched file denial
    folder-structure-adapter.ts  # Required/allowed folders and files
    markdown-template-adapter.ts  # Required sections in markdown
    frontmatter-schema-adapter.ts  # JSON Schema validation of frontmatter
    file-schema-adapter.ts    # JSON/YAML file schema validation
    cross-reference-adapter.ts  # Cross-file reference integrity
    content-policy-adapter.ts  # Forbidden content pattern detection
    guidance-adapter.ts       # Soft guidance rules
  cli/            # CLI entry points and use-case orchestration
    main.ts         # Commander.js CLI setup
    use-cases.ts    # High-level operations (validate, explain, fix, scaffold, etc.)
    operations.ts   # Hook/watcher operational config
    git-hooks.ts    # Git hook installation
    watcher.ts      # Cron-based cleanup watcher
    cleanup.ts      # Triage queue for severely invalid files
    runtime.ts      # Creates default ValidationEngine with all adapters
  service/
    server.ts       # Express REST API server (POST /validate, POST /explain)
  sdk/
    report-sdk.ts   # Compliance report generation
  universal-commands.ts  # All UniversalCommand definitions (repotype validate/explain/fix/etc.)
  index.ts        # Public API exports
profiles/         # Reusable config profiles (extend via repotype.yaml)
examples/         # Example configs, templates, schemas
tests/            # Vitest test files
bin/repotype.js   # CLI entry point
```

## Config System (`repotype.yaml`)

- `version`: required, string
- `extends`: single path or array of paths (inheritance with deep merge, circular detection)
- `defaults`: `inheritance`, `strictness`, `unmatchedFiles` (deny/allow)
- `folders`: array of FolderRule (requiredFolders, allowedFolders, requiredFiles, allowedFiles)
- `files`: array of FileRule (glob, filenamePattern, pathCase, requiredSections, schema bindings, forbidContentPatterns, crossReferences)
- `templates`: Handlebars templates for scaffolding
- `rules`: cross-file rules (companion files, cross-references)
- `plugins`: external tool integration (install/validate/fix commands)
- `operations`: git hooks and cron watcher configuration

## Code Conventions

- All adapters implement the `ValidatorAdapter` interface from `core/types.ts`: `id`, `supports()`, `validate()`
- All CLI commands are defined as `UniversalCommand` instances in `universal-commands.ts` -- this auto-generates CLI, API, and MCP interfaces
- Diagnostics use severity levels: `error`, `warning`, `suggestion`
- Autofix actions must be marked `safe: true` to be applied automatically
- Config files searched upward from target path (`repotype.yaml` or `repo-schema.yaml`)
- The `lint.allowOverbroad` flag on file rules suppresses overbroad glob warnings

## Important Rules

- Do NOT add new validators without implementing the `ValidatorAdapter` interface and registering in `cli/runtime.ts`
- All new CLI commands MUST use `UniversalCommand` from `@supernal/universal-command` -- no raw Commander.js
- Config inheritance merges arrays (folders, files, templates, rules, plugins) by concatenation
- The `pathCase` rule on FileRule applies to the full relative path, not just the filename
- When `defaults.unmatchedFiles` is `deny`, any file not matching a configured glob is an error

---

## Meta-Repo Context

This package is a **git submodule** within the [supernal-coding](https://github.com/supernalintelligence/supernal-coding) monorepo. When working here, the parent repo's CLAUDE.md is NOT auto-loaded — you are in an isolated git root.

**Cross-cutting tools available from the parent repo:**
- `sc task create/list/done` — task management (tracks work across all packages)
- `sc test` — test runner with requirement evidence logging
- `si test` — interface testing, contract scanning
- `@supernal/universal-command` — all new commands must use this pattern
- `repotype validate` — repo structure validation

**Parent docs:** See the root [CLAUDE.md](../../CLAUDE.md) and [/supernal/CLAUDE.md](../../../CLAUDE.md) for monorepo-wide conventions and the full sub-repo map.
