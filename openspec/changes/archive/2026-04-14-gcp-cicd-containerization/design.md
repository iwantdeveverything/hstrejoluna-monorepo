# Design: GCP CI/CD and Containerization Baseline

## Technical Approach

Implementar CI/CD en dos workflows (`ci.yml`, `cd-cloudrun.yml`) para `portfolio` y `maestros-del-salmon`, con imagenes Docker multi-stage, deploy inmutable por digest en Cloud Run y autenticacion keyless por OIDC+WIF. El flujo se valida con dos capas: `act` para logica de workflow y `gcloud` para verificacion real de WIF, Cloud Run, DNS y TLS.

## Architecture Decisions

### Decision Matrix

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Runtime unico (VM/App Engine) vs servicios Cloud Run por app | Menos separacion operativa y menor aislamiento de fallos | **Cloud Run por app** (`portfolio`, `maestros-del-salmon`) |
| Credenciales JSON en GitHub vs OIDC + WIF | JSON keys son mas simples al inicio pero aumentan riesgo y rotacion manual | **OIDC + WIF** con `google-github-actions/auth@v2` |
| Un Dockerfile monolitico vs Dockerfile por app | Monolitico reduce archivos pero complica cache/debug y blast radius | **Dockerfile por app** en `apps/*/Dockerfile` |
| Validacion solo remota vs validacion hibrida | Solo remota retrasa feedback; solo local no valida trust real GCP | **Hibrida**: `act` local + `gcloud` remoto |
| WIF abierto a cualquier repo vs repo/branch restringido | Menos friccion, mayor riesgo de abuso | **Restringido** a `iwantdeveverything/hstrejoluna-monorepo` + `refs/heads/master` |
| Entrypoint con Load Balancer vs Cloud Run domain mapping | LB da edge features pero agrega costo fijo mensual | **Cloud Run domain mapping** como default cost-first |

## Data Flow

### Sequence: CI on Pull Request

```text
Developer -> GitHub PR (master)
PR event -> ci.yml/quality
quality -> npm ci -> lint -> typecheck -> build -> test(portfolio)
quality status -> required checks -> merge gate
```

### Sequence: CD on Merge

```text
Merge to master -> cd-cloudrun.yml
cd job -> OIDC token -> GCP WIF provider
cd job -> Docker build/push -> Artifact Registry
cd job -> deploy by IMAGE_DIGEST -> Cloud Run service
cd job -> smoke check service URL
```

### Sequence: Validation Loop

```text
Local: scripts/test-workflows-with-act.sh -> ci/cd simulation
Remote: scripts/verify-gcp-remote.sh -> WIF/SA/AR/Cloud Run/DNS/TLS checks
Result -> update rollout status in change tasks
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Modify | Quality gate + forced-failure step for local `act` simulation. |
| `.github/workflows/cd-cloudrun.yml` | Modify | Real deploy path + `ACT` guard for safe local simulation. |
| `apps/portfolio/Dockerfile` | Create | Multi-stage build, non-root runtime, Cloud Run startup contract. |
| `apps/maestros-del-salmon/Dockerfile` | Create | Same runtime hardening pattern as portfolio. |
| `apps/portfolio/next.config.ts` | Modify | Rewrite via `SALMON_ORIGIN` instead of fixed localhost target. |
| `package.json` | Modify | Root scripts scoped to deployable apps for CI consistency. |
| `.github/act/events/*.json` | Create/Modify | Synthetic PR/push payloads aligned to org repo. |
| `scripts/test-workflows-with-act.sh` | Create | Automated local validation of CI/CD workflow behavior. |
| `scripts/verify-gcp-remote.sh` | Create | Real environment checks for WIF, AR, Cloud Run, DNS and TLS. |
| `docs/deploy/gcp-namecom.md` | Modify | Runbook with contracts, bootstrap and rollback guidance. |
| `docs/deploy/act-gcp-validation.md` | Create | Procedure for hybrid verification (`act` + `gcloud`). |

## Interfaces / Contracts

```yaml
# GitHub repository secrets
GCP_WIF_PROVIDER: projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL>/providers/<PROVIDER>
GCP_WIF_SERVICE_ACCOUNT: <sa-name>@<project-id>.iam.gserviceaccount.com

# GitHub repository variables
GCP_PROJECT_ID: hstrejoluna
GCP_REGION: us-central1
GAR_REPOSITORY: apps
CLOUD_RUN_SERVICE_PORTFOLIO: portfolio
CLOUD_RUN_SERVICE_SALMON: maestros-del-salmon
```

```yaml
# WIF trust condition (provider)
assertion.repository == "iwantdeveverything/hstrejoluna-monorepo"
assertion.ref == "refs/heads/master"
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Container build/runtime contract | `docker build -f apps/*/Dockerfile .` + startup smoke behavior. |
| Integration | Workflow logic and required checks | `bash scripts/test-workflows-with-act.sh` + forced failure mode. |
| E2E | Keyless auth + production routing/TLS | Real GitHub run on `master` + `bash scripts/verify-gcp-remote.sh`. |

## Migration / Rollout

No data migration required. Rollout operativo:
1. Confirmar secrets/variables en repo de organizacion.
2. Ejecutar validacion local con `act`.
3. Ejecutar primer merge controlado a `master` para crear/actualizar servicios.
4. Verificar digests, smoke checks, DNS y TLS.
5. Cutover DNS: `www` primero, apex despues.

Rollback: pausar CD, redeploy al digest previo y restaurar DNS anterior.

## Open Questions

- [ ] Definir evidencia final para `5.3` (run IDs, digests y capturas de verificacion) en el cambio.
