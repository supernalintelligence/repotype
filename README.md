# Repotype

[![CI](https://github.com/supernalintelligence/repotype/actions/workflows/ci.yml/badge.svg)](https://github.com/supernalintelligence/repotype/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/repotype.svg)](https://www.npmjs.com/package/repotype)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](LICENSE)
[![docs](https://img.shields.io/badge/docs-supernalintelligence.github.io-0ea5e9)](https://supernalintelligence.github.io/repotype/)

**Linting for your entire repository. Not just code.**

ESLint checks your code. Prettier formats it. Repotype checks your **repository structure** — folders, file naming, schemas, frontmatter, and documentation standards.

📖 **[Read the Documentation →](https://supernalintelligence.github.io/repotype/)**

## Install

```bash
npm install -g repotype
# or
npx repotype validate .
```

## Quick Start

```bash
# Initialize config
repotype init .

# Validate
repotype validate .

# Auto-fix issues
repotype fix .

# Generate report
repotype report . --output report.md
```

## What It Validates

- **📁 Folder structure** — required directories, allowlists, path patterns
- **📋 File standards** — naming conventions, companion files, JSON/YAML schemas
- **📝 Documentation** — frontmatter schemas, required sections, template detection
- **🔒 Content policies** — forbidden patterns, secret detection

## Example Config

```yaml
# repotype.yaml
version: "1"

defaults:
  unmatchedFiles: deny  # Strict mode

folders:
  - id: src-structure
    path: src
    requiredFolders: [components, hooks, utils]
    pathCase: kebab

files:
  - id: typescript
    glob: "src/**/*.ts"
    pathCase: kebab
    
  - id: docs
    glob: "docs/**/*.md"
    frontmatter:
      required: [title, description]
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](https://supernalintelligence.github.io/repotype/getting-started/introduction/) | Installation and first steps |
| [Configuration](https://supernalintelligence.github.io/repotype/guides/configuration/) | Full config reference |
| [Folder Rules](https://supernalintelligence.github.io/repotype/guides/folder-rules/) | Control directory structure |
| [File Rules](https://supernalintelligence.github.io/repotype/guides/file-rules/) | Validate files by pattern |
| [CI Integration](https://supernalintelligence.github.io/repotype/guides/ci-integration/) | GitHub Actions, GitLab CI |
| [CLI Reference](https://supernalintelligence.github.io/repotype/reference/cli/) | All commands |

## CLI Commands

```bash
repotype init [target]           # Create repotype.yaml
repotype validate [target]       # Validate repository
repotype fix [target]            # Auto-fix violations
repotype report [target]         # Generate compliance report
repotype explain <file>          # Explain rules for a file
repotype status [target]         # Show operations status
repotype apply [target]          # Apply hooks/watcher config
repotype install-checks          # Install git hooks
```

## CI Integration

```yaml
# .github/workflows/repotype.yml
name: Repotype
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx repotype validate . --json
```

## Share with Agents

Repotype is designed for human + agent teams. Add this to your agent instructions:

> Use `repotype validate .` before committing. Run `repotype fix .` to auto-fix issues. Check `repotype.yaml` for repository standards.

## License

MIT — [Supernal Intelligence](https://supernal.ai)

---

Built to Help Fight Entropy with ♥ from [Supernal Intelligence](https://supernal.ai)
