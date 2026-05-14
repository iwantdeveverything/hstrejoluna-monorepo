# E2E Testing Resilience Specification

## Purpose

Testing infrastructure requirements for deterministic Playwright E2E tests across Chrome, Firefox, and Safari in CI.

## Requirements

### Requirement: Async Assertion Resilience

E2E tests MUST use `waitFor` or `expect.poll()` for assertions dependent on async state transitions (dynamic imports, WebGL init, IntersectionObserver, Framer Motion).

#### Scenario: aria-current after scroll-driven navigation

- GIVEN a navigation click triggers smooth-scroll via `scrollIntoView`
- WHEN the test asserts `aria-current="location"` on the target nav link
- THEN the assertion MUST use `expect.poll()` with minimum 10s timeout

#### Scenario: Canvas visibility after dynamic WebGL import

- GIVEN a WebGL canvas loaded via `next/dynamic({ ssr: false })`
- WHEN the test asserts canvas visibility
- THEN the test MUST `waitFor` canvas attachment (`state: "attached"`) before asserting

#### Scenario: Assertion after Framer Motion AnimatePresence exit

- GIVEN `AnimatePresence` exit animation causing DOM detach/reattach
- WHEN asserting state of sibling elements after triggering exit
- THEN the test MUST combine `waitForTimeout` (minimum 500ms) with locator re-query

### Requirement: Locator Re-query After DOM Mutation

After DOM-mutating actions (click, scroll, animation trigger), E2E tests MUST re-query Playwright locators.

#### Scenario: Re-query aria-expanded after grid selection change

- GIVEN a grid where clicking item B collapses previously-expanded item A
- WHEN asserting `aria-expanded="false"` on item A after clicking item B
- THEN the test MUST re-query the locator (e.g., `projectButtons.nth(0)`)

### Requirement: CI Worker Configuration

Playwright CI workers SHALL use available CPU core count (minimum 4) and MUST NOT be hardcoded below that.

#### Scenario: Auto-detect CPU cores for workers

- GIVEN a CI runner with N CPU cores (N ≥ 4)
- WHEN the Playwright config loads in CI
- THEN `workers` SHALL be set to N or `undefined` (auto-detect)

### Requirement: CI Shard Support

The CI workflow SHOULD support `--shard` splitting to isolate flaky tests across parallel jobs.

#### Scenario: Sharded E2E execution

- GIVEN a CI workflow with `--shard=1/2` and `--shard=2/2` jobs
- WHEN each shard job executes
- THEN only its assigned test file slice SHALL run

### Requirement: Browser Launch Configuration

Firefox WebGL SHALL be force-enabled in CI Playwright config. Safari/WebKit tests SHALL be locally runnable via `PLAYWRIGHT_INCLUDE_WEBKIT=1`.

#### Scenario: Firefox WebGL force-enable in CI

- GIVEN the CI Playwright config targeting Firefox
- WHEN the browser launches
- THEN `webgl.force-enabled: true` SHALL be set via `firefoxUserPrefs`

#### Scenario: Safari local opt-in via env variable

- GIVEN `PLAYWRIGHT_INCLUDE_WEBKIT=1` is set
- WHEN the Playwright config loads
- THEN the WebKit browser project SHALL be included in the matrix

### Requirement: CI Consistency Gate

The E2E test suite MUST pass consistently across 3 consecutive CI runs with retries disabled.

#### Scenario: Three consecutive green runs

- GIVEN any change to the test suite or application code
- WHEN 3 consecutive CI runs execute with `retries: 0`
- THEN all test suites MUST pass on every run

### Requirement: Browser-Specific Test Handling

Headless Firefox WebGL2 tests MAY be skipped (documented reason required). WebGL `<canvas>` SHALL be excluded from Axe scans.

#### Scenario: Skip WebGL2 on headless Firefox

- GIVEN a test requiring WebGL2 canvas rendering
- WHEN the browser is headless Firefox
- THEN the test MAY be skipped via `test.skip(browserName === "firefox", reason)`

#### Scenario: Exclude canvas from Axe scan

- GIVEN a page containing a WebGL `<canvas>` element
- WHEN Axe accessibility scan executes
- THEN `<canvas>` SHALL be excluded via `AxeBuilder.exclude("canvas")`

### Requirement: Composite Action for E2E Setup

`qa-professional.yml` E2E jobs MUST use `.github/actions/setup-node-deps` for shared Node/npm/cache setup, replacing duplicated checkout+node+install+cache blocks.

- **Phase**: 2
- **Priority**: High

#### Scenario: E2E uses composite action for setup

- GIVEN qa-professional.yml E2E job
- WHEN the job's setup steps execute
- THEN the composite action handles Node 22, npm ci, and cache in one step; no inline duplication of those three operations remains
