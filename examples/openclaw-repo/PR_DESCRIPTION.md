# Add Repotype for repository structure enforcement

## What is Repotype?

[Repotype](https://supernalintelligence.github.io/repotype/) is a repo-level linter that enforces structure, not just code. ESLint checks your code — Repotype checks your repository.

## Why add it to OpenClaw?

With 50+ skills, multiple packages, and many contributors, structural drift is inevitable:
- Skills missing SKILL.md
- Packages missing README.md
- Inconsistent file naming
- Accidentally committed secrets

Repotype catches these **before** they land in main.

## What this PR adds

```yaml
# repotype.yaml
version: "1"

folders:
  - id: skill-structure
    path: skills/*
    requiredFiles:
      - SKILL.md

  - id: package-structure
    path: packages/*
    requiredFiles:
      - package.json
      - README.md

files:
  - id: env-safety
    glob: ".env*"
    forbidContentPatterns:
      - "sk-[a-zA-Z0-9]{20,}"   # OpenAI keys
      - "ghp_[a-zA-Z0-9]{36}"    # GitHub PATs
```

## Usage

```bash
# Validate
npx repotype validate .

# Auto-fix (renames, adds missing files)
npx repotype fix .

# CI integration
npx repotype validate . --json
```

## CI Integration (optional)

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

## Configuration

Starting with `unmatchedFiles: allow` (permissive mode). Can tighten to `deny` once the repo fully conforms.

## Links

- [Repotype Docs](https://supernalintelligence.github.io/repotype/)
- [OpenClaw Example Config](https://supernalintelligence.github.io/repotype/examples/openclaw-project/)
- [npm package](https://www.npmjs.com/package/repotype)

---

Built to Help Fight Entropy with ♥ from [Supernal Intelligence](https://supernal.ai)
