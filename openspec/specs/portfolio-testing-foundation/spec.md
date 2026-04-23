# portfolio-testing-foundation Specification

## Purpose

Definir una base formal de testing para `apps/portfolio` que cubra la logica nueva de certificados con ejecucion automatizada y repetible.

## Requirements

### Requirement: Test Runner and Environment Setup

The system MUST provide a configured test runner for \`apps/portfolio\` with a browser-like environment and LOCALE context support for testing localized components.

#### Scenario: Local test execution

- GIVEN project dependencies are installed
- WHEN a developer runs the portfolio test command
- THEN the test runner MUST execute successfully in the configured environment
- AND the command MUST be documented in package scripts

#### Scenario: Localized component test

- GIVEN a component uses i18n hooks
- WHEN it is tested with a specific locale mock (e.g., 'es')
- THEN it MUST render the correct localized strings from the dictionary.

### Requirement: Certificates Domain Test Coverage

The system SHALL include automated tests for certificate normalization and certificate section rendering behaviors defined in this change.

#### Scenario: Normalization behavior validation

- GIVEN raw Apify certificate payloads with full and partial fields
- WHEN normalization logic is tested
- THEN the tests MUST validate identity key derivation and null-safe mapping
- AND malformed entries SHOULD be asserted as skipped or handled defensively

#### Scenario: Certificates UI rendering validation

- GIVEN certificate lists with and without source links
- WHEN `CertificatesOverview` is rendered in tests
- THEN the tests MUST verify certificate labels and issuer metadata
- AND the tests MUST verify empty-state rendering when input is empty

### Requirement: CI-Friendly Test Command Contract

The system MUST expose deterministic test commands that can be reused in local development and CI pipelines.

#### Scenario: Non-watch execution for automation

- GIVEN CI or pre-merge validation contexts
- WHEN the non-watch test script is executed
- THEN the command MUST terminate with pass/fail exit codes
- AND failures MUST identify the failing suite and test case

#### Scenario: Fast feedback in development

- GIVEN developers iterating on the certificates change
- WHEN watch-mode command is executed
- THEN the runner SHOULD provide incremental reruns for touched files
- AND developers MAY run scoped tests for certificate modules/components
