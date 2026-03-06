Feature: Repotype Evidence Reporting
  As a repository maintainer
  I want a generated compliance evidence output
  So that I can publish proof in CI and static sites

  Scenario: Evidence endpoint is reachable for reporting workflows
    Given I navigate to "http://localhost:4310/health"
    When I refresh the page
    Then the current URL should be "http://localhost:4310/health"
