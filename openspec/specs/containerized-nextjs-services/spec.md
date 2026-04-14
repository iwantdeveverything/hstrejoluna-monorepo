# containerized-nextjs-services Specification

## Purpose

Definir el contrato de contenedorizacion para apps Next.js del monorepo con imagenes reproducibles, seguras y aptas para Cloud Run.

## Requirements

### Requirement: Deterministic Multi-Stage Build

The system MUST define a multi-stage Docker build per app deployable that produces deterministic artifacts from the same commit.

#### Scenario: Reproducible build output

- GIVEN a tagged commit in the monorepo
- WHEN the Docker image is built twice with the same inputs
- THEN both builds MUST generate equivalent runtime artifacts
- AND dependency installation MUST use lockfile-pinned versions

#### Scenario: Build failure on invalid dependencies

- GIVEN a broken lockfile or incompatible dependency graph
- WHEN the Docker build process runs
- THEN the build MUST fail before publishing an image

### Requirement: Cloud Run Runtime Contract

The runtime image MUST be compatible with Cloud Run constraints and SHALL start with the expected HTTP listener configuration.

#### Scenario: Successful service startup

- GIVEN a deployed image in Cloud Run
- WHEN the container is started by the platform
- THEN the service MUST bind to the configured runtime port
- AND it MUST serve HTTP responses without manual shell interaction

#### Scenario: Non-root runtime hardening

- GIVEN the final runtime stage definition
- WHEN security checks inspect container metadata
- THEN the image SHOULD run as non-root
- AND build-only tooling MUST NOT be present in the final layer
