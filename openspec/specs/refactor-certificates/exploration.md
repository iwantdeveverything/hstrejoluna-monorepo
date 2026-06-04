## Exploration: refactor-certificates

### Current State
Currently, the portfolio application displays certificates fetched from Sanity CMS (`apps/portfolio/app/[locale]/page.tsx`). However, there is a complex, active subsystem built to synchronize certificates from LinkedIn via Apify. This sync subsystem involves an API route (`api/admin/sync-certificates`), an Apify scraper, data normalizers, and a Sanity upsert mechanism, all located in `apps/portfolio/lib/certificates`. Furthermore, both the Sanity schema (`apps/studio/schemaTypes/certificate.ts`) and the UI component (`packages/ui/src/components/CertificatesPanel.tsx`) strictly mandate a `source` field, which defaults to or expects the value `"linkedin"`, with UI fallback text implicitly tying the feature to "LinkedIn credentials". Because certificates are not displaying properly in production and the sync logic is overly complex or failing, the goal is to decouple entirely from LinkedIn and simply treat certificates as pure Sanity CMS documents.

### Affected Areas
- `apps/portfolio/lib/certificates/*` — Contains all the Apify fetching, LinkedIn normalization, and Sanity syncing logic. Entire directory should be deleted.
- `apps/portfolio/app/api/admin/sync-certificates/route.ts` & `.test.ts` — The API endpoint that triggers the synchronization. Directory should be deleted.
- `apps/studio/schemaTypes/certificate.ts` — Sanity schema defines `source` explicitly as a list containing only "linkedin". This field must be removed or simplified.
- `apps/portfolio/types/sanity.ts` — TypeScript types define `source: "linkedin"` for the `Certificate` type and include a `SyncCertificatesResult` interface which will no longer be needed.
- `packages/ui/src/components/CertificatesPanel.tsx` — Displays the `source` text on each certificate and has a default empty state referencing "LinkedIn credentials".
- `packages/ui/src/components/CertificatesPanel.test.tsx` — Test mocks include `source` fields that will need to be updated.
- `apps/portfolio/components/fragments/CertificatesOverview.stories.tsx` & `.test.tsx` — Mocks include `source` fields that will need to be updated.
- `apps/portfolio/package.json` — Apify package or token env vars might no longer be needed, though optional for this direct clean-up.

### Approaches
1. **Remove Sync Subsystem & Deprecate `source` Field (Recommended)** — Completely delete `lib/certificates` and `api/admin/sync-certificates`. Remove the `source` attribute from Sanity schemas, TypeScript interfaces, UI component props, and test/storybook mocks. Update the `noCertificates` UI label to a generic empty state string.
   - Pros: Drastically simplifies the architecture. Fully severs ties with LinkedIn logic, fulfilling the requirement. Makes the UI more generic and reusable.
   - Cons: Existing documents in Sanity will still have the `source` key, but it will simply be ignored by the frontend.
   - Effort: Low

2. **Remove Sync but keep `source` Field open** — Delete the sync logic and API, but change the `source` field in Sanity to an open string field (e.g. allowing "Coursera", "AWS", etc) instead of hardcoded "linkedin". Update UI fallback texts.
   - Pros: Allows the UI to continue displaying where a certificate came from.
   - Cons: Still maintains extra logic not strictly requested, violating "borrar toda la logica que no tenga nada que ver con sanity". The user asked for maximum simplification.
   - Effort: Low

### Recommendation
**Approach 1** is highly recommended. It perfectly matches the requirement of simplifying the logic and deleting everything unrelated to Sanity. Removing the `source` field entirely makes the app easier to maintain and ensures that certificates are purely driven by standard CMS data entry without implicit dependencies on LinkedIn.

### Risks
- **Data mismatch:** Existing certificate documents in Sanity currently have the `source` field. By removing it from the GraphQL/GROQ queries and UI, we won't crash anything (Sanity is schemaless), but we must ensure we don't accidentally break the type checker.
- **Environment variables:** Obsolete environment variables (`APIFY_TOKEN`, `LINKEDIN_PROFILE_URL`, `SYNC_CERTIFICATES_SECRET`, `SANITY_API_WRITE_TOKEN`) will be left over in `.env` or deployment platforms.

### Ready for Proposal
Yes — The orchestrator should proceed to the proposal phase with **Approach 1**, noting that we will delete the sync directory, the API route, and remove the `source` field from the UI and types.
