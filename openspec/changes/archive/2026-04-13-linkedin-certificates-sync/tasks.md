# Tasks: LinkedIn Certificates Sync

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Add testing dependencies and scripts in `apps/portfolio/package.json` (`test`, `test:watch`, CI-friendly non-watch command).
- [x] 1.2 Create `apps/portfolio/vitest.config.ts` with `jsdom` environment and setup file wiring.
- [x] 1.3 Create `apps/portfolio/test/setup.ts` with shared matchers (`@testing-library/jest-dom`) and base mocks.
- [x] 1.4 Create Sanity schema `apps/studio/schemaTypes/certificate.ts` with fields from design contract.
- [x] 1.5 Register `certificate` in `apps/studio/schemaTypes/index.ts`.
- [x] 1.6 Extend `apps/portfolio/types/sanity.ts` with `Certificate` and sync result interfaces.

## Phase 2: Core Implementation (Ingestion)

- [x] 2.1 Implement Apify client adapter in `apps/portfolio/lib/certificates/apify.ts` for actor run + dataset fetch.
- [x] 2.2 Implement normalization mapper in `apps/portfolio/lib/certificates/normalize.ts` (key derivation: `credentialId` fallback `name+issuer`).
- [x] 2.3 Implement idempotent persistence in `apps/portfolio/lib/certificates/sanity-upsert.ts`.
- [x] 2.4 Implement orchestration service in `apps/portfolio/lib/certificates/sync.ts` returning `SyncCertificatesResult`.
- [x] 2.5 Create protected route `apps/portfolio/app/api/admin/sync-certificates/route.ts` validating `x-sync-secret`.
- [x] 2.6 Add env contract docs/comments for `APIFY_TOKEN`, `LINKEDIN_PROFILE_URL`, `SYNC_CERTIFICATES_SECRET`.

## Phase 3: Integration / Portfolio Wiring

- [x] 3.1 Update `apps/portfolio/app/page.tsx` to fetch certificates from Sanity in parallel with existing queries.
- [x] 3.2 Create `apps/portfolio/components/fragments/CertificatesOverview.tsx` rendering cards plus empty-state block.
- [x] 3.3 Update `apps/portfolio/components/ObsidianStream.tsx` props and add `<section id="certificates">`.
- [x] 3.4 Update `apps/portfolio/components/ui/CommandNav.tsx` labels and anchor list to include `certificates`.
- [x] 3.5 Ensure `SectionDock`/active-section flow includes `certificates` via `sectionIds` updates in stream.
- [x] 3.6 Verify anchor navigation (`#certificates`) and active state transitions remain stable.

## Phase 4: Testing (Formal)

- [x] 4.1 Add `apps/portfolio/lib/certificates/normalize.test.ts` covering spec scenario “Normalization behavior validation”.
- [x] 4.2 Add `apps/portfolio/lib/certificates/sync.test.ts` for actor failure + mixed valid/invalid entries handling.
- [x] 4.3 Add `apps/portfolio/components/fragments/CertificatesOverview.test.tsx` for linked/non-linked certificate rendering.
- [x] 4.4 Add empty-state test in `CertificatesOverview.test.tsx` for no certificates scenario.
- [x] 4.5 Add route handler tests in `apps/portfolio/app/api/admin/sync-certificates/route.test.ts` for auth + structured errors.
- [x] 4.6 Run `npm run test --workspace=apps/portfolio` and fix failing suites until green.

## Phase 5: Verification / Cleanup

- [ ] 5.1 Run `npm run lint --workspace=apps/portfolio` and resolve issues in touched files.
- [x] 5.2 Manually validate stream sections and navigation: `hero -> projects -> experience -> skills -> certificates`.
- [x] 5.3 Execute one manual sync against real env and confirm Sanity upsert behavior (no duplicates).
- [x] 5.4 Confirm rollback steps are documented in change notes before `sdd-verify`.
