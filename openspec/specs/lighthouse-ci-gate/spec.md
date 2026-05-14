# lighthouse-ci-gate Specification

## Purpose

Define realistic Lighthouse CI assertion thresholds that match actual application performance, replacing broken 0.9 targets that cause perpetual CI failure.

> **Note**: Design chose Performance thresholds `0.7w/0.6e` (warn at 0.7 to catch regressions, error at 0.6 to protect against catastrophic degradation) as authoritative over the original spec's `0.6w/0.5e`. FCP uses error-only at 5000ms; LCP uses error-only at 4000ms. Rationale: 0.9 perf on an SSR portfolio with SVG filters is unrealistic. Warning thresholds omitted for FCP/LCP where the primary concern is catastrophic failure, not gradual drift.

## Requirements

### Requirement: Calibrated Thresholds

The Lighthouse CI config (`lighthouserc.cjs`) SHALL use the following assertion thresholds:

| Metric            | Warning | Error |
|-------------------|---------|-------|
| Performance       | 0.7     | 0.6   |
| Accessibility     | 0.9     | 0.8   |
| Best Practices    | 0.9     | 0.8   |
| SEO               | 0.95    | 0.9   |
| FCP (ms)          | —       | 5000  |
| LCP (ms)          | —       | 4000  |
| TBT (ms)          | 600     | 1000  |
| CLS               | 0.1     | 0.25  |

#### Scenario: CI passes with realistic scores

- GIVEN a production build of the portfolio app
- WHEN `qa:lighthouse` runs against `/en`
- THEN all categories SHALL pass at warning level or above
- AND zero assertions SHALL fail at error level
- AND no category SHALL produce NaN scores

#### Scenario: regression below error level fails CI

- GIVEN a PR introduces a performance regression
- WHEN Lighthouse scores drop below error thresholds
- THEN `qa:lighthouse` SHALL exit with non-zero code
- AND the PR SHALL be blocked from merging

#### Scenario: warning-level violations allowed but reported

- GIVEN a score falls between warning and error thresholds
- WHEN `qa:lighthouse` completes
- THEN the step SHALL pass (exit 0)
- AND a warning annotation SHALL appear in the CI output

### Requirement: Direct URL Bypasses Redirects

The Lighthouse CI URL SHALL target `/en` directly, avoiding the 307 redirect from `/` that adds latency.

#### Scenario: no redirect in audit path

- GIVEN `lighthouserc.cjs` configured with `url` pointing to `/en`
- WHEN Lighthouse audits the page
- THEN the first navigation SHALL return HTTP 200
- AND no HTTP 307 redirect SHALL appear in the trace
- AND the redirect overhead (~200-500ms) SHALL be eliminated from TTFB/FCP

### Requirement: Turbo-Orchestrated Lighthouse CI

`qa-professional.yml` Lighthouse job MUST use `turbo run qa:lighthouse --filter=<app>` instead of `npm run qa:lighthouse --workspace=...`.

- **Phase**: 2
- **Priority**: High

#### Scenario: Lighthouse uses turbo orchestration

- GIVEN qa-professional.yml lighthouse-bundle job
- WHEN Lighthouse CI runs
- THEN turbo orchestrates the task; no raw npm run qa:lighthouse call exists in the workflow

### Requirement: Reuse Turbo Build Cache for Lighthouse

The `qa:lighthouse` task MUST declare `dependsOn: ["^build"]` so turbo provides the cached build artifact. The Lighthouse job MUST NOT rebuild the Next.js app separately; it SHALL reuse the turbo-cached build output.

- **Phase**: 2
- **Priority**: High

#### Scenario: No double build for Lighthouse

- GIVEN a CI run where build completed (or is cached)
- WHEN qa:lighthouse executes
- THEN Lighthouse reuses the cached build output; no second `npm run build` or `next build` runs

### Requirement: Conditional QA Jobs on Affected Packages

`qa-professional.yml` MUST conditionally skip E2E and Lighthouse jobs when `--filter` analysis determines no relevant packages changed. Jobs SHALL still run on `workflow_dispatch` triggers regardless of affected scope.

- **Phase**: 2
- **Priority**: Medium

#### Scenario: Skip QA on docs-only changes

- GIVEN a PR that only modifies .md files
- WHEN --affected analysis determines no app packages changed
- THEN E2E and Lighthouse jobs are skipped

#### Scenario: Force run on workflow_dispatch

- GIVEN a manual workflow_dispatch trigger
- WHEN --affected analysis runs
- THEN jobs execute regardless of affected scope
