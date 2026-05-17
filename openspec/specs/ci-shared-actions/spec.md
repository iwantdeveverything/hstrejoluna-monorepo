# ci-shared-actions Specification

## Purpose

Reusable composite actions for node dependency setup, caching, and common workflow steps across CI/CD pipelines.

## Requirements

### Requirement: Composite Action for Node Dependency Setup

`.github/actions/setup-node-deps/action.yml` MUST composite: Node 22 setup (actions/setup-node@v4 with npm cache), `npm ci`, and Next.js cache restore (actions/cache@v4 using package-lock.json hash key only). The cache key MUST NOT include source file globs.

- **Phase**: 1
- **Priority**: High

#### Scenario: Setup in single reusable step

- GIVEN a workflow referencing `uses: .github/actions/setup-node-deps`
- WHEN the step executes
- THEN Node 22 installs, npm ci completes, and .next/cache is restored

### Requirement: Deduplicate Workflow Setup

ci.yml, qa-professional.yml, and cd-cloudrun.yml MUST consume `.github/actions/setup-node-deps` for shared setup, eliminating duplicated checkout+node+install+cache step blocks across all three workflows.

- **Phase**: 2
- **Priority**: High

#### Scenario: No duplicated setup across workflows

- GIVEN all three workflow files
- WHEN compared for Node/npm/cache setup steps
- THEN each workflow references the composite action once; no inline duplicated setup remains
