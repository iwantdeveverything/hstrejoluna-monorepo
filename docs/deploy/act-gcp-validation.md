# Local + Remote Validation (`act` + `gcloud`)

This guide covers how to validate the pending rollout checks using:
- `act` for local GitHub Actions workflow simulation.
- `gcloud` for real remote GCP and production-domain checks.

Entry-point strategy for this phase is **cost-first**: Cloud Run domain mapping (no external HTTPS Load Balancer by default).

## Why both are needed

`act` is excellent for workflow logic and CI behavior, but it cannot fully prove GitHub OIDC keyless auth against GCP in the same way as a real GitHub-hosted run.  
Use both tools together:

- Local simulation (`act`) for fast feedback and failure-path testing.
- Remote verification (`gcloud`) for WIF, deployed image digest, Cloud Run status, DNS, and TLS.

## Install prerequisites

### `act`

Install from the official project:
- [nektos/act](https://github.com/nektos/act)

### `gcloud`

Install from Google Cloud SDK docs:
- [Install Google Cloud CLI](https://cloud.google.com/sdk/docs/install)

Also required:
- Docker
- curl
- dig (optional but recommended for DNS checks)

## Files added for local workflow simulation

- `.github/act/events/pull_request.json`
- `.github/act/events/push-master.json`
- `.github/act/env.example`
- `.github/act/vars.example`
- `.github/act/secrets.example`
- `scripts/test-workflows-with-act.sh`

## 1) Test workflows locally with `act`

### Prepare local config

```bash
cp .github/act/env.example .github/act/env.local
cp .github/act/vars.example .github/act/vars.local
cp .github/act/secrets.example .github/act/secrets.local
```

Edit `*.local` files as needed for your setup.

### Run CI + CD local simulation

```bash
bash scripts/test-workflows-with-act.sh
```

### Simulate a required-check failure (for merge-block behavior)

```bash
ACT_FAIL_REQUIRED_CHECK=true bash scripts/test-workflows-with-act.sh
```

When `ACT_FAIL_REQUIRED_CHECK=true`, the CI job intentionally fails in `act` mode to verify failure handling.

## 2) Validate remote/prod requirements with `gcloud`

Use this script to verify what `act` cannot guarantee:
- WIF provider exists and is readable.
- Deployer service account exists.
- Artifact Registry repo exists.
- Cloud Run services are reachable and report latest revision.
- Latest revision image digest is present.
- Domain HTTP/TLS responses and DNS resolution.

```bash
GCP_PROJECT_ID="<project-id>" \
GCP_REGION="us-central1" \
GAR_REPOSITORY="apps" \
CLOUD_RUN_SERVICE_PORTFOLIO="portfolio" \
CLOUD_RUN_SERVICE_SALMON="maestros-del-salmon" \
GCP_WIF_PROVIDER="projects/123456789/locations/global/workloadIdentityPools/pool/providers/provider" \
GCP_WIF_SERVICE_ACCOUNT="deployer@<project-id>.iam.gserviceaccount.com" \
DOMAIN_APEX="hstrejoluna.com" \
DOMAIN_WWW="www.hstrejoluna.com" \
bash scripts/verify-gcp-remote.sh
```

## Mapping to pending tasks

- **4.2** CI required checks fail/pass behavior:
  - Covered by `act` CI runs (normal + forced failure mode).
- **4.3** Keyless deploy auth/deploy path:
  - Partially simulated in `act`.
  - Must be confirmed remotely with `gcloud` + a real GitHub Actions run on `master`.
- **4.4** DNS + TLS for apex and `www`:
  - Verified remotely by `scripts/verify-gcp-remote.sh`.

## Important limitation

`act` does not replace a final real GitHub-hosted CD run for OIDC trust validation.  
Use `act` to shift-left failures, then confirm one real run in GitHub + GCP before marking rollout complete.
