# Delta for portfolio-testing-foundation

## ADDED Requirements

### Requirement: Storybook Static Build Validation

The system MUST include deterministic Storybook static build validation for `apps/portfolio` within the QA command contract.

#### Scenario: CI validates Storybook build

- GIVEN a pull request changes portfolio UI or stories
- WHEN the QA contract is executed in automation
- THEN the Storybook static build command MUST run and pass

#### Scenario: Broken story blocks merge

- GIVEN a story has invalid imports or render logic
- WHEN the QA contract runs Storybook static build
- THEN validation MUST fail with a non-zero exit code

### Requirement: Local Parity for Storybook QA

The system SHOULD provide a local command path that mirrors the Storybook CI validation behavior.

#### Scenario: Developer pre-check before push

- GIVEN a developer updates components or stories
- WHEN the local QA command is run
- THEN it SHOULD execute the same Storybook static build gate as CI

#### Scenario: Unchanged non-Storybook checks

- GIVEN existing lint and test gates are already configured
- WHEN Storybook validation is added
- THEN existing quality checks MUST remain in the QA contract

## MODIFIED Requirements

- None.

## REMOVED Requirements

- None.
