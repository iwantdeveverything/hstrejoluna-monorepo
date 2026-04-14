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
