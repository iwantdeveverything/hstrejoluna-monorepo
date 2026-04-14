# Verification Report

**Change**: `gcp-cicd-containerization`  
**Mode**: Standard (strict TDD disabled via `openspec/config.yaml`)

---

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 19 |
| Tasks complete | 19 |
| Tasks incomplete | 0 |

---

### Build & Tests Execution

**Build**: ✅ Passed  
Command: `npm run lint && npm run typecheck && npm run build && npm run test --workspace=apps/portfolio`

- Lint: passed (`portfolio`, `maestros-del-salmon`)
- Typecheck: passed (`portfolio`, `maestros-del-salmon`)
- Build: passed (`next build` for both apps)
- Tests: 9 passed / 0 failed / 0 skipped (`apps/portfolio`, Vitest)

**Integration execution evidence**:
- `ACT_FAIL_REQUIRED_CHECK=true bash scripts/test-workflows-with-act.sh` -> CI fails intentionally with exit code 1 (merge-gate failure simulation).
- `bash scripts/test-workflows-with-act.sh` -> CI/CD local simulation passes.

**Production rollout evidence (5.3)**:
- CD run (failed smoke path, expected fix cycle): `24411760281`
- CD run (successful first real rollout): `24411979592`
- Deployed image digests:
  - `portfolio`: `us-central1-docker.pkg.dev/hstrejoluna/apps/portfolio@sha256:c9d10e7cd9272292266294713ddc880cb8c5aa2c950caa8331099994cac6b34d`
  - `maestros-del-salmon`: `us-central1-docker.pkg.dev/hstrejoluna/apps/maestros-del-salmon@sha256:d995e7ac3bdb859650ab6897118131e01f6d761567c18a769b5af0c8194440ff`

---

### Spec Compliance Matrix

| Requirement | Scenario | Test / Evidence | Result |
|-------------|----------|-----------------|--------|
| containerized-nextjs-services | Reproducible build output | Local `docker build` for both Dockerfiles + lockfile-based `npm ci`; repeated CI/CD builds succeeded | ✅ COMPLIANT |
| containerized-nextjs-services | Build failure on invalid dependencies | Dependency install uses lockfile-pinned `npm ci`; failure path structurally enforced by Docker build steps | ✅ COMPLIANT |
| containerized-nextjs-services | Successful service startup | Cloud Run deploy + smoke checks passed in run `24411979592` | ✅ COMPLIANT |
| containerized-nextjs-services | Non-root runtime hardening | `USER nextjs` in both runtime Docker stages | ✅ COMPLIANT |
| gcp-cloudrun-cd-pipeline | Required checks pass | `quality` CI path passes in local workflow execution | ✅ COMPLIANT |
| gcp-cloudrun-cd-pipeline | Required checks fail | Forced failure simulation (`ACT_FAIL_REQUIRED_CHECK=true`) fails with exit code 1 | ✅ COMPLIANT |
| gcp-cloudrun-cd-pipeline | Image publication on protected branch | Successful push-triggered CD run `24411979592` on `master` published and deployed digests | ✅ COMPLIANT |
| gcp-cloudrun-cd-pipeline | Publish prevention on build errors | Workflow structure gates deploy on build step success; no push on build failure path | ✅ COMPLIANT |
| gcp-cloudrun-cd-pipeline | Successful keyless deploy | `google-github-actions/auth` with WIF succeeded in run `24411979592` (no JSON key) | ✅ COMPLIANT |
| gcp-cloudrun-cd-pipeline | Unauthorized repository context | WIF provider condition restricts repository and branch (`iwantdeveverything/...`, `refs/heads/master`) | ✅ COMPLIANT |
| domain-routing-and-tls | Successful hostname resolution | Domain mappings created; public DNS records resolved and mappings `DomainRoutable=True` | ✅ COMPLIANT |
| domain-routing-and-tls | Canonical redirect behavior | Both hosts serve correctly over HTTPS; canonical redirect policy not enforced in app yet | ⚠️ PARTIAL |
| domain-routing-and-tls | Valid HTTPS handshake | `CertificateProvisioned=True` and `curl -I https://www.hstrejoluna.com` / apex return `HTTP/2 200` | ✅ COMPLIANT |
| domain-routing-and-tls | Certificate renewal continuity | Google-managed certificate provisioning active; renewal is managed platform behavior | ✅ COMPLIANT |
| domain-routing-and-tls | Controlled cutover verification | Cutover executed (`www` + apex), then validated with domain-mapping and HTTPS checks | ✅ COMPLIANT |
| domain-routing-and-tls | Rollback on incident | Runbook rollback steps documented in `docs/deploy/gcp-namecom.md` | ✅ COMPLIANT |

**Compliance summary**: 15/16 scenarios compliant, 1 partial.

---

### Correctness (Static — Structural Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| `containerized-nextjs-services` | ✅ Implemented | Dockerfiles are multi-stage, lockfile-pinned, Cloud Run-compatible. |
| `gcp-cloudrun-cd-pipeline` | ✅ Implemented | CI/CD workflows, WIF keyless auth, digest deploy, smoke checks in place. |
| `domain-routing-and-tls` | ✅ Implemented | Domain mappings + managed TLS active for apex and `www`. |

---

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Cloud Run per app | ✅ Yes | `portfolio` and `maestros-del-salmon` are separate services. |
| Keyless deploy via WIF | ✅ Yes | WIF provider + principal binding + auth action in workflow. |
| Per-app Dockerfiles | ✅ Yes | `apps/portfolio/Dockerfile`, `apps/maestros-del-salmon/Dockerfile`. |
| Hybrid validation (`act` + `gcloud`) | ✅ Yes | Both scripts executed and used for verification evidence. |
| Cost-first entrypoint | ✅ Yes | Cloud Run domain mappings used; no LB required for this phase. |

---

### Issues Found

**CRITICAL**: None  

**WARNING**:
- Canonical redirect strategy (`www` vs apex) is not yet enforced at app layer (scenario remains partial).

**SUGGESTION**:
- Add explicit redirect middleware to enforce canonical host and remove ambiguity.

---

### Verdict

**PASS WITH WARNINGS**

The change is functionally complete and production-ready for the defined scope, with one non-blocking canonical redirect refinement pending.
