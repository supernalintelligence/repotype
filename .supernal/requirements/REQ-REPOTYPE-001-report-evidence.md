---
id: REQ-REPOTYPE-001
title: Repotype compliance evidence report generation
status: active
owner: repotype
feature: .supernal/features/FEAT-REPOTYPE-001-evidence-reporting.md
stories:
  - stories/repotype-report-evidence.feature
tests:
  - tests/generated/stories/repotype-evidence-reporting.spec.ts
evidence:
  - .repotype/reports/repotype-package.compliance.json
  - .repotype/reports/repotype-package.compliance.html
  - .repotype/reports/repotype-package.compliance.md
---

# Requirement

Repotype SHALL support generating compliance evidence reports in JSON, Markdown, and HTML formats so repositories can publish machine-readable and human-readable evidence.

## Acceptance Criteria

```gherkin
Feature: Repotype Evidence Reporting
  Scenario: Generate compliance report artifacts
    Given I navigate to "http://localhost:4310/health"
    When I refresh the page
    Then the current URL should be "http://localhost:4310/health"
```

## Notes

- This package uses Supernal Interface story generation for E2E scaffold coverage.
- Story source: `stories/repotype-report-evidence.feature`
