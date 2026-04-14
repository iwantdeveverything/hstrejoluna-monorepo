# Proposal: GCP CI/CD and Containerization Baseline

## Intent

Completar una linea CI/CD para desplegar `portfolio` y `maestros-del-salmon` en Cloud Run con autenticacion keyless (OIDC + WIF), alineada al repo `iwantdeveverything/hstrejoluna-monorepo`.

## Scope

### In Scope
- Estandarizar Docker multi-stage para apps Next.js publicas del monorepo.
- Mantener CI de PR (lint, typecheck, build, tests portfolio) y CD por merge a `master`.
- Configurar y operar deploy keyless con Workload Identity Federation y Artifact Registry.
- Validar flujo con `act` (local) + `gcloud` (entorno real) para CI/CD, DNS y TLS.

### Out of Scope
- Despliegue de `apps/studio` en esta fase.
- Migracion IaC completa (Terraform/Pulumi) o rediseno de arquitectura.
- Migracion a GKE/Kubernetes.

## Capabilities

### New Capabilities
- `containerized-nextjs-services`: Contrato de build/runtime Docker para apps Next.js desplegables.
- `gcp-cloudrun-cd-pipeline`: Pipeline CI/CD con deploy inmutable por digest y auth keyless.
- `domain-routing-and-tls`: Estrategia operativa para apex/`www` con TLS administrado.

### Modified Capabilities
- None.

## Approach

Mantener workflows separados (`ci.yml`, `cd-cloudrun.yml`), contrato de secretos/variables en GitHub, WIF atado al repo de organizacion y validacion en dos capas: `act` local y `gcloud`/`curl`/DNS en entorno real.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/` | New/Modified | CI y CD con soporte de simulacion local para `act`. |
| `apps/portfolio/`, `apps/maestros-del-salmon/` | Modified | Dockerfiles y consistencia de build para Cloud Run. |
| `scripts/` | New | Scripts de validacion local (`act`) y remota (`gcloud`). |
| `docs/deploy/` | New/Modified | Runbook GCP/Name.com y guia de validacion operativa. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Condicion WIF desalineada con repo/branch | Med | Restringir `assertion.repository` y `assertion.ref`. |
| Servicios Cloud Run inexistentes en primer deploy | Med | Bootstrap controlado y smoke checks post-deploy por servicio. |
| Corte parcial DNS/TLS en cutover | Med | Orden `www` -> apex, verificacion HTTPS antes de avanzar. |

## Rollback Plan

Deshabilitar CD, redeploy manual al ultimo digest estable en Cloud Run y revertir DNS en Name.com al destino previo. Si falla auth keyless, retirar binding WIF nuevo.

## Dependencies

- Proyecto GCP (`hstrejoluna`) con APIs de Run, IAM, IAMCredentials y Artifact Registry.
- Repo GitHub en organizacion `iwantdeveverything` con permisos para secretos/variables.
- Docker local + `act` + `gcloud` para validaciones previas al rollout.

## Success Criteria

- [ ] CI en PR bloquea merges cuando falla un check requerido.
- [ ] CD en `master` autentica por WIF sin JSON keys y publica imagenes por digest.
- [ ] Servicios `portfolio` y `maestros-del-salmon` quedan desplegados y accesibles.
- [ ] `hstrejoluna.com` y `www.hstrejoluna.com` responden con TLS valido y routing correcto.
