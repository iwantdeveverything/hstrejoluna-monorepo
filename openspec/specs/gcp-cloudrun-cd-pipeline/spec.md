# gcp-cloudrun-cd-pipeline Specification

## Purpose

Definir un pipeline CI/CD en GitHub Actions que valide calidad en PRs y despliegue automaticamente a Cloud Run usando Artifact Registry y Workload Identity Federation.

## Requirements

### Requirement: Pull Request Quality Gate

The system MUST execute CI validation on pull requests and SHALL block merges when required checks fail.

#### Scenario: Required checks pass

- GIVEN an open pull request targeting `master`
- WHEN CI jobs for lint, typecheck, tests, and build complete successfully
- THEN the pull request MUST report required checks as passing

#### Scenario: Required checks fail

- GIVEN an open pull request with failing validation
- WHEN CI finishes with at least one failed job
- THEN the merge gate MUST remain blocked
- AND failure logs MUST identify the failing stage

### Requirement: Immutable Artifact Publication

The system MUST publish deployable images to Artifact Registry with immutable identifiers tied to source revisions.

#### Scenario: Image publication on protected branch

- GIVEN a new commit merged into `master`
- WHEN CD build and push stages run
- THEN an image MUST be published with a revision-derived tag
- AND deployment metadata SHALL reference the same image digest

#### Scenario: Publish prevention on build errors

- GIVEN a failing container build in CD
- WHEN the publish step is evaluated
- THEN no new image MUST be pushed for that revision

### Requirement: Keyless Cloud Run Deployment

The system MUST authenticate to Google Cloud through Workload Identity Federation and MUST NOT require static JSON service account keys.

#### Scenario: Successful keyless deploy

- GIVEN a configured OIDC trust between GitHub and GCP
- WHEN CD runs on an authorized branch event
- THEN deployment MUST succeed using federated credentials

#### Scenario: Unauthorized repository context

- GIVEN a workflow run from an untrusted branch or repo context
- WHEN cloud authentication is requested
- THEN access MUST be denied
- AND no Cloud Run update MAY be applied

### Requirement: Matrix Deploy Strategy

cd-cloudrun.yml deploy jobs MUST use a matrix strategy with `matrix.app` entries for `portfolio` and `maestros-del-salmon`. A single job template SHALL parameterize `SERVICE_NAME`, `IMAGE_NAME`, `SMOKE_PATH`, and app-specific env vars per matrix entry. Behavior MUST remain identical to current separate jobs.

- **Phase**: 3
- **Priority**: Medium

#### Scenario: Matrix deploy produces identical deployments

- GIVEN cd-cloudrun.yml with matrix.app = [portfolio, maestros-del-salmon]
- WHEN the matrix strategy runs both entries
- THEN portfolio and maestros-del-salmon deploy with the same configuration as the current separate jobs

#### Scenario: App-specific env vars scope correctly

- GIVEN matrix.app = portfolio
- WHEN the deploy step executes
- THEN portfolio-specific secrets and env vars (e.g., SALMON_ORIGIN, SANITY_API_READ_TOKEN) are injected; salmon-specific vars are not

### Requirement: Docker Layer Caching

Docker build steps in cd-cloudrun.yml MUST use Docker Buildx with `--cache-from type=gha` and `--cache-to type=gha` for cross-build layer caching via GitHub Actions cache.

- **Phase**: 3
- **Priority**: Medium

#### Scenario: Cached layers reduce build time

- GIVEN a prior successful push to the same branch
- WHEN Docker buildx runs with --cache-from type=gha
- THEN unchanged layers MUST be pulled from cache, reducing build wall-clock time

### Requirement: Turbo Build in Docker

Docker build steps MUST invoke `turbo run build --filter=<app>` instead of raw `npm run build` within the build stage to leverage turbo's task hashing and caching.

- **Phase**: 3
- **Priority**: Low

#### Scenario: Turbo-cached build inside Docker

- GIVEN a Dockerfile that uses turbo run build --filter
- WHEN the Docker build stage executes
- THEN turbo cache avoids redundant compilation if inputs match a prior build
