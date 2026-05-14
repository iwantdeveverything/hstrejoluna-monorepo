# turbo-pipeline-orchestration Specification

## Purpose

Turborepo task graph, caching, filtering, and remote cache integration for all CI/CD pipelines.

## Requirements

### Requirement: Complete Task Graph

`turbo.json` SHALL define tasks `test`, `typecheck`, `qa:lighthouse`, and `qa:bundle` with correct `dependsOn` and `outputs`. `test` and `qa:*` tasks MUST depend on `^build`. `qa:lighthouse` outputs SHALL include `.lighthouseci/**`. `qa:bundle` outputs SHALL be empty (assertion-only).

- **Phase**: 1
- **Priority**: High

#### Scenario: All pipeline tasks discoverable by turbo

- GIVEN turbo.json includes test, typecheck, qa:lighthouse, qa:bundle
- WHEN `turbo run lint typecheck build test` executes
- THEN all tasks resolve and run in dependency order

#### Scenario: QA tasks wait for dependency builds

- GIVEN a workspace with qa:lighthouse or qa:bundle scripts
- WHEN turbo invokes those tasks
- THEN `^build` dependencies for that workspace MUST complete first

### Requirement: Dependency Chain for lint and typecheck

`lint` and `typecheck` tasks in turbo.json MUST declare `dependsOn: ["^build"]` so type information and compiled outputs exist before linting or type-checking runs.

- **Phase**: 1
- **Priority**: High

#### Scenario: Lint and typecheck wait for dependency builds

- GIVEN a workspace that imports types from a dependency workspace
- WHEN `turbo run lint typecheck build` executes
- THEN lint and typecheck MUST run after `^build` for depended-upon workspaces

### Requirement: Root Script Delegation to Turbo

Root `package.json` scripts for `build`, `lint`, `typecheck`, and `test` MUST delegate to `turbo run` with `--filter` instead of sequential `npm run --workspace` chains. The `dev` script already uses turbo and SHALL remain unchanged.

- **Phase**: 1
- **Priority**: High

#### Scenario: Root scripts invoke turbo orchestrator

- GIVEN root package.json with turbo-powered scripts
- WHEN developer runs `npm run build` or `npm run lint`
- THEN turbo orchestrates execution across filtered workspaces

#### Scenario: Filter flag honors workspace targeting

- GIVEN `turbo run build --filter=apps/portfolio`
- WHEN executed
- THEN only portfolio and its workspace dependencies build

### Requirement: Fix Next.js Cache Key

CI Next.js cache key MUST use only the `package-lock.json` hash. The `**/*.[jt]s` and `**/*.[jt]sx` globs MUST be removed from cache keys in all workflows.

- **Phase**: 1
- **Priority**: High

#### Scenario: Cache hits on non-source changes

- GIVEN a PR that modifies only markdown or CSS files
- WHEN CI restores the Next.js cache
- THEN the cache MUST hit from a prior run matching the same package-lock.json

#### Scenario: Cache invalidation on dependency change

- GIVEN a PR that modifies package-lock.json
- WHEN CI restores the Next.js cache
- THEN cache MUST miss and a fresh restore-plus-rebuild occurs

### Requirement: Turbo-ify CI Quality Pipeline

ci.yml quality job MUST use `turbo run lint typecheck build test` with `--filter` for affected-package detection. Raw `npm run` calls for these tasks SHALL be replaced entirely.

- **Phase**: 2
- **Priority**: High

#### Scenario: CI uses turbo for quality checks

- GIVEN ci.yml quality job
- WHEN CI executes
- THEN all quality tasks run through turbo, not raw npm scripts

#### Scenario: Affected-package filtering in CI

- GIVEN a PR that touches only apps/portfolio
- WHEN `turbo run lint typecheck build test --filter=apps/portfolio...` runs
- THEN only portfolio and its dependencies execute; unchanged workspaces skip

### Requirement: Remote Cache Integration

CI workflows MUST support `TURBO_TOKEN` and `TURBO_TEAM` repository secrets for Turborepo remote cache. When these secrets are absent, turbo MUST fall back to local cache without errors.

- **Phase**: 2
- **Priority**: Medium

#### Scenario: Remote cache configured

- GIVEN TURBO_TOKEN and TURBO_TEAM secrets configured in GitHub
- WHEN CI runs
- THEN turbo pushes and pulls cache artifacts from the remote store

#### Scenario: Remote cache not configured

- GIVEN no TURBO_TOKEN or TURBO_TEAM secrets
- WHEN CI runs
- THEN turbo falls back to local filesystem cache and completes successfully