# GCP Cloud Run + Name.com Deployment Runbook

## Scope

This runbook covers CI/CD for:
- `apps/portfolio` -> Cloud Run service `portfolio`
- `apps/maestros-del-salmon` -> Cloud Run service `maestros-del-salmon`

`apps/studio` is out of this phase and SHOULD remain managed separately until CMS deploy requirements are finalized.

## Required GitHub Configuration

### Repository Variables

- `GCP_PROJECT_ID`
- `GCP_REGION` (example: `us-central1`)
- `GAR_REPOSITORY` (example: `apps`)
- `CLOUD_RUN_SERVICE_PORTFOLIO` (example: `portfolio`)
- `CLOUD_RUN_SERVICE_SALMON` (example: `maestros-del-salmon`)
- `CLOUD_RUN_MIN_INSTANCES` (recommended: `0` for cost-first)
- `CLOUD_RUN_MAX_INSTANCES` (recommended: `2` to cap burst cost)
- `CLOUD_RUN_CONCURRENCY` (recommended: `80`)
- `CLOUD_RUN_CPU` (recommended: `1`)
- `CLOUD_RUN_MEMORY` (recommended: `512Mi`)
- `CLOUD_RUN_TIMEOUT` (recommended: `60`)

### Repository Secrets

- `GCP_WIF_PROVIDER` (full provider resource name)
- `GCP_WIF_SERVICE_ACCOUNT` (deployer service account email)

### Runtime Variable

- `SALMON_ORIGIN` (set on portfolio Cloud Run service, example: `https://maestros-del-salmon-xxxxx-uc.a.run.app`)

## GCP Bootstrap Checklist

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  secretmanager.googleapis.com

gcloud artifacts repositories create apps \
  --repository-format=docker \
  --location=us-central1
```

Create deploy service account and grant minimum roles:
- `roles/run.admin`
- `roles/artifactregistry.writer`
- `roles/iam.serviceAccountUser`

Create Workload Identity Federation pool/provider bound to this GitHub repository and map `assertion.repository` + branch constraints for `master`.

## CI/CD Behavior

- PRs to `master`: `.github/workflows/ci.yml` runs lint, typecheck, build, and portfolio tests.
- Push to `master`: `.github/workflows/cd-cloudrun.yml` builds images, pushes to Artifact Registry, deploys by digest, and runs smoke checks.

## DNS and TLS (Name.com -> GCP)

### Cost-optimized entrypoint (default)

To maximize free-tier fit and avoid fixed LB cost:
1. Use **Cloud Run domain mappings** directly (no HTTPS Load Balancer).
2. Map both `www.hstrejoluna.com` and `hstrejoluna.com` to the `portfolio` service.
3. Keep `www` as canonical host and redirect apex to `www` at app level.

Example commands:

```bash
gcloud run domain-mappings create \
  --service=portfolio \
  --domain=www.hstrejoluna.com \
  --region=us-central1 \
  --project=hstrejoluna

gcloud run domain-mappings create \
  --service=portfolio \
  --domain=hstrejoluna.com \
  --region=us-central1 \
  --project=hstrejoluna
```

### Optional scale-up entrypoint (future)

Adopt external HTTPS Load Balancer only when you need advanced edge features (CDN, WAF, complex routing) and traffic justifies fixed monthly cost.

Cutover order:
1. `www` record first.
2. Validate HTTPS and routing.
3. Apex record (`hstrejoluna.com`) second.

## Verification Checklist

- `gh run list` shows CI passing on latest PR.
- CD run publishes both service images tagged by commit SHA.
- Cloud Run revisions use image digests (not mutable tags only).
- `curl -I https://www.hstrejoluna.com` returns `200`/`301` with valid TLS.
- `curl -I https://hstrejoluna.com` returns `200`/`301` with valid TLS.
- Cloud Run deploys show `min-instances=0` and capped `max-instances` in service config.

For repeatable local+remote verification, see `docs/deploy/act-gcp-validation.md`.

## Rollback

1. Re-route DNS records in Name.com to previous known-good target.
2. Redeploy previous Cloud Run image digest:
   ```bash
   gcloud run deploy <service> \
     --image <previous-digest> \
     --region <region> \
     --project <project-id>
   ```
3. Confirm recovery with HTTPS smoke checks on apex and `www`.
