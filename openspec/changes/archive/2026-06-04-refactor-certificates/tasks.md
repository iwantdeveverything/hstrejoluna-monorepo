# Tasks: Refactor Certificates

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~400 lines (mostly deletions) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Remove Apify sync logic and `source` field | PR 1 | Single atomic PR for deletion of dead code and field clean-up |

## Phase 1: Clean Up Backend / Sync Logic

- [x] 1.1 Delete `apps/portfolio/lib/certificates/` directory entirely.
- [x] 1.2 Delete `apps/portfolio/app/api/admin/sync-certificates/` directory entirely.

## Phase 2: Update Sanity Schema & Types

- [x] 2.1 Edit `apps/studio/schemaTypes/certificate.ts` to remove the `source` field definition.
- [x] 2.2 Edit `apps/portfolio/types/sanity.ts` to remove the `source` property from the `Certificate` interface.
- [x] 2.3 Edit `apps/portfolio/types/sanity.ts` to delete the `SyncCertificatesResult` interface.

## Phase 3: Update Mocks & Tests

- [x] 3.1 Edit `apps/portfolio/components/fragments/CertificatesOverview.stories.tsx` to remove the `source: "linkedin"` property from the mocked certificates.
- [x] 3.2 Edit `apps/portfolio/components/fragments/CertificatesOverview.test.tsx` to remove the `source: "linkedin"` property from the mocked certificates in tests.
- [x] 3.3 Edit `apps/portfolio/scratch-sanity-hyphen.js` (if applicable) to remove `source: "linkedin"` properties.

## Phase 4: Verification

- [x] 4.1 Run TypeScript compiler (`tsc --noEmit`) to ensure no type errors remain across apps/portfolio.
- [x] 4.2 Run tests to ensure CertificatesOverview still renders correctly without the `source` field.
