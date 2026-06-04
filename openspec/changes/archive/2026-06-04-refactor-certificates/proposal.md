# Proposal: Refactor Certificates

## Intent
Simplify the certificates feature by removing the overly complex, broken LinkedIn sync logic (Apify) and the hardcoded `source` field requirement. This technical debt is currently blocking certificates from being displayed in production.

## Scope

### In Scope
- Delete the `linkedin-certificates-ingestion` subsystem (`apps/portfolio/lib/certificates` and `api/admin/sync-certificates`).
- Remove the `source` field from the Sanity certificate schema.
- Strip out `source` references from frontend TypeScript interfaces, components, and mock data.

### Out of Scope
- Creating new backend API integrations for certificates.
- Modifying other sections of the portfolio stream or other Sanity schemas.

## Capabilities
### New Capabilities
- None

### Modified Capabilities
- `portfolio-certificates-section`: Remove the data requirements around external syncing and the internal `source` field logic.
- `linkedin-certificates-ingestion`: Complete deprecation and removal.

## Approach
Completely remove the sync subsystem to reduce infrastructure complexity. The approach is to surgically delete the sync library and API route, then trace and eliminate all instances of the `source` field across Sanity schemas and the Next.js frontend (UI and types) so that certificates correctly render directly from standard Sanity data.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `apps/portfolio/lib/certificates/` | Removed | Delete Apify LinkedIn sync logic |
| `apps/portfolio/pages/api/admin/sync-certificates.ts` | Removed | Delete sync API route |
| `apps/portfolio/schemas/` | Modified | Remove `source` field from certificate schema |
| `apps/portfolio/types/` | Modified | Update TypeScript interfaces to omit `source` |
| `apps/portfolio/components/` | Modified | Update stream UI components to render without `source` |
| `apps/portfolio/mocks/` | Modified | Remove `source` from local dev mock data |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| UI Rendering Errors | Low | Perform a thorough codebase search to ensure no React component depends on the `source` field. |
| Sanity Studio Warnings | Low | Removing a field in schema is safe; existing drafts may need resaving if any validation relies on it. |

## Rollback Plan
Revert the commit for this change, which will restore the sync logic files and re-introduce the `source` field to Sanity schemas and frontend types.

## Dependencies
- Sanity Studio deployment to update the active schema.

## Success Criteria
- [ ] The `lib/certificates` directory and `sync-certificates` API route are deleted.
- [ ] The `source` field is removed from Sanity, TS types, and React components.
- [ ] Certificates successfully display in the production/local environment.
- [ ] The project builds successfully with no TypeScript errors.
