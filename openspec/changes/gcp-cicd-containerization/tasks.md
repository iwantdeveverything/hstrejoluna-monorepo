# Tasks: GCP CI/CD and Containerization Baseline

## Phase 1: Infrastructure and Baseline Contracts

- [x] 1.1 Create `.github/workflows/ci.yml` with PR trigger to `master` and required jobs for `npm ci`, lint, build, and portfolio tests.
- [x] 1.2 Create `.github/workflows/cd-cloudrun.yml` with push trigger on `master`, OIDC auth step, Artifact Registry push, and Cloud Run deploy steps.
- [x] 1.3 Add required workflow env/secret contract section in `docs/deploy/gcp-namecom.md` (`GCP_PROJECT_ID`, `WIF_PROVIDER`, service names, region).
- [x] 1.4 Define IAM/WIF bootstrap command checklist in `docs/deploy/gcp-namecom.md` for reproducible setup.

## Phase 2: Containerization Implementation

- [x] 2.1 Create `apps/portfolio/Dockerfile` as multi-stage build (deps/build/runtime) with Cloud Run compatible startup.
- [x] 2.2 Create `apps/maestros-del-salmon/Dockerfile` as multi-stage build aligned with monorepo workspace structure.
- [x] 2.3 Ensure runtime stages in both Dockerfiles use minimal final image and non-root execution where feasible.
- [x] 2.4 Add `.dockerignore` entries (or app-level ignore files) to reduce context size and avoid leaking local artifacts.

## Phase 3: Integration and Runtime Wiring

- [x] 3.1 Modify `apps/portfolio/next.config.ts` to use `SALMON_ORIGIN` with local fallback instead of hardcoded `http://localhost:3001`.
- [x] 3.2 Update `package.json` root scripts as needed for CI consistency (single commands for lint/build and optional CI test command).
- [x] 3.3 Implement image tagging and digest pinning logic in `.github/workflows/cd-cloudrun.yml` to keep deploys immutable.
- [x] 3.4 Add post-deploy smoke check steps in `.github/workflows/cd-cloudrun.yml` for Cloud Run service URLs.

## Phase 4: Testing and Verification

- [x] 4.1 Validate `containerized-nextjs-services` scenarios by running local `docker build` for both app Dockerfiles with lockfile-pinned installs.
- [ ] 4.2 Validate `gcp-cloudrun-cd-pipeline` scenarios by opening a PR and confirming CI blocks merge when a required check fails.
- [ ] 4.3 Validate keyless deploy by running CD on `master` and confirming GCP auth succeeds without JSON keys.
- [ ] 4.4 Validate `domain-routing-and-tls` scenarios with DNS resolution and HTTPS certificate checks for apex and `www`.

## Phase 5: Documentation, Rollout, and Rollback

- [x] 5.1 Complete `docs/deploy/gcp-namecom.md` with cutover order (`www` then apex), verification checklist, and rollback steps.
- [x] 5.2 Document operational decision for `apps/studio` (in-scope vs out-of-scope deploy) in `docs/deploy/gcp-namecom.md`.
- [ ] 5.3 Capture first production rollout evidence (workflow run IDs and deployed image digests) in the change notes for auditability.
