# Tasks: CI/CD Pipeline Optimization — Turbo-ify, DRY, and Cache

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250–320 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes — by phase |
| Suggested split | PR 1 (Phase 1) → PR 2 (Phase 2) → PR 3 (Phase 3) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: turbo.json + scripts + composite action + cache keys + lighthouse split | PR 1 → main | Rollback-safe, additive |
| 2 | Turbo-ify CI: refactor ci.yml + qa-professional.yml + remote cache | PR 2 → main | Depends on PR 1 |
| 3 | CD refactoring: matrix deploy + Docker caching + pr-governance cache | PR 3 → main | Depends on PR 2 |

## Phase 1: Foundation (additive, rollback-safe)

- [x] 1.1 [TPO-01, TPO-02] Update `turbo.json`: add `test`, `typecheck`, `qa:lighthouse` (outputs `.lighthouseci/**`), `qa:bundle` with `dependsOn: ["^build"]`; add `dependsOn: ["^build"]` to `lint`. Verify: `turbo run lint typecheck build test --dry=json` resolves. **GitHub issue required.**
- [x] 1.2 [TPO-03] Update root `package.json` scripts: replace four `npm run/workspace` chains with `turbo run --filter=./apps/*` for build, lint, typecheck, test. Verify: each script runs locally via turbo. **GitHub issue required.**
- [x] 1.3 [CSA-01] Create `.github/actions/setup-node-deps/action.yml`: composite action with inputs `node-version` (default 22) and `nextjs-cache` (default true). Steps: checkout → setup-node (npm cache) → nm ci → conditional `.next/cache` restore. Verify: `act -j quality` or local syntax check. **GitHub issue required.**
- [x] 1.4 [TPO-04] Fix Next.js cache keys in `ci.yml` and `qa-professional.yml`: remove `${{ hashFiles('**/*.[jt]s', '**/*.[jt]sx') }}` suffix; key becomes `${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}`. **GitHub issue required.**
- [x] 1.5 [LH-02] Split `apps/portfolio/package.json` `qa:lighthouse`: remove inline `npm run build &&`, keep only `lhci autorun --config=./lighthouserc.cjs`. Build is now turbo dependency. Verify: `turbo run qa:lighthouse --filter=portfolio --dry=json` shows build dependency. **GitHub issue required.**
- [x] 1.6 Verify Phase 1: run `turbo run lint typecheck build test --dry=json` locally; confirm task graph, dependency order, and no errors.

## Phase 2: Turbo-ify CI (high impact)

- [x] 2.1 [TPO-05, CSA-02] Refactor `ci.yml` quality job: replace manual checkout+setup-node+cache+ci steps with `uses: .github/actions/setup-node-deps`; replace `npm run lint/typecheck/build/test` with `turbo run lint --filter=portfolio --filter=maestros-del-salmon` (separate steps). Remove Next.js cache step (now in composite action). **GitHub issue required.**
- [x] 2.2 [LH-01, LH-03, CSA-02, E2E-01] Refactor `qa-professional.yml`: both jobs use `uses: .github/actions/setup-node-deps`; lighthouse-bundle job runs `turbo run qa:lighthouse --filter=portfolio` and `turbo run qa:bundle --filter=portfolio` instead of `npm run qa:lighthouse --workspace=...`; added `changes` job with paths-filter for conditional skip (skip on docs-only, run on workflow_dispatch). E2E job keeps existing Playwright steps with composite action for setup. **GitHub issue required.**
- [x] 2.3 [TPO-06] Add `TURBO_TOKEN` and `TURBO_TEAM` env vars to `ci.yml` and `qa-professional.yml`. Graceful fallback when secrets absent — local turbo cache still works. **GitHub issue required.**
- [ ] 2.4 Verify Phase 2: push PR; confirm `turbo run` succeeds in CI. Check logs for turbo cache hits on reruns. Verify Lighthouse runs without double build.

## Phase 3: CD Refactoring (matrix + Docker caching)

- [x] 3.1 [GCP-01] Refactor `cd-cloudrun.yml`: replace `deploy-portfolio` and `deploy-maestros-del-salmon` jobs with single matrix `deploy` job using `matrix.app`. Parameterize `SERVICE_NAME`, `IMAGE_NAME`, `SMOKE_PATH`, secrets, env vars via `${{ matrix.app.* }}`. Verify: `act --matrix app=portfolio` runs without YAML errors. **GitHub issue required.**
- [x] 3.2 [GCP-02] Add Docker buildx layer caching to `cd-cloudrun.yml` build step: `--cache-from type=gha` and `--cache-to type=gha,mode=max`. Ensure buildx is configured (`docker buildx create --use` or existing builder). **GitHub issue required.**
- [x] 3.3 [GCP-03] Update `apps/portfolio/Dockerfile` and `apps/maestros-del-salmon/Dockerfile`: replace `RUN npm run build --workspace=apps/...` with `RUN npx turbo run build --filter=...`. **GitHub issue required.**
- [x] 3.4 [CSA-03] Add develop-branch check cache to `pr-governance.yml`: wrap `gh api branches/develop` call with `actions/cache@v4` keyed on a stable ref (e.g., `develop-branch-check-${{ github.sha }}`). **GitHub issue required.**
- [ ] 3.5 Verify Phase 3: push to master; confirm both Cloud Run services deploy identically. Verify Docker cache hits on subsequent deploys. Verify pr-governance cache behavior.