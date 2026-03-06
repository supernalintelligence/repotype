---
id: FEAT-REPOTYPE-001
title: Repotype evidence reporting and publication
status: active
owner: repotype
requirements:
  - REQ-REPOTYPE-001
---

# Feature

Repotype provides a full evidence pipeline from repository compliance checks to publishable JSON/HTML/Markdown artifacts.

## Scope

- Generate compliance reports (`report` command) in machine and human-readable formats.
- Publish evidence artifacts through CI and GitHub Pages.
- Maintain requirement-to-test traceability with Gherkin story generation.

## Evidence

- `.repotype/reports/repotype-package.compliance.json`
- `.repotype/reports/repotype-package.compliance.html`
- `.repotype/reports/repotype-package.compliance.md`
