# Proposal: Portfolio Individual Project Pages

## Intent

Implement dedicated, SEO-optimized individual pages for each project in the portfolio. This allows for detailed technical case studies, better semantic structure (Schema.org), and improved user engagement by showcasing the "how" and "why" behind each project.

## Scope

### In Scope
- **Sanity Schema Update**: Enhance `project` model with a `content` field for long-form case studies and additional metadata.
- **Internal Routing**: Implement `/[locale]/projects/[slug]` dynamic routes in Next.js.
- **Semantic Components**: Create a Layout with Breadcrumbs and Schema.org (`CreativeWork`/`SoftwareSourceCode`) integration.
- **UI Updates**: Update `PortfolioGrid` cards to link to these internal pages.
- **Localization**: Ensure all new content and UI labels are fully localized.

### Out of Scope
- Migrating existing external microsites (like Maestros del Salmon) into the portfolio app (they remain as external links within the internal project page).
- A comment system or interactive blog features beyond static content.

## Capabilities

### New Capabilities
- `project-case-studies`: Dedicated pages for in-depth project documentation with breadcrumbs and SEO metadata.

### Modified Capabilities
- `portfolio-grid-navigation`: Update project cards to navigate to internal case studies instead of direct external links.

## Approach

1.  **Sanity**: Add `content` (Portable Text) to `project.ts`.
2.  **Frontend Types**: Update `types/sanity.ts` to include the new fields.
3.  **Routing**: Create `app/[locale]/projects/[slug]/page.tsx`.
4.  **Navigation**: Modify `lib/navigation.ts` to prioritize internal slugs while still allowing links to external repositories/live demos within the project page.
5.  **SEO**: Implement `JSON-LD` for each project page following `SoftwareSourceCode` schema.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/studio/schemaTypes/project.ts` | Modified | Added `content`, `year`, and `role` fields. |
| `apps/portfolio/types/sanity.ts` | Modified | Updated `Project` interface. |
| `apps/portfolio/lib/navigation.ts` | Modified | Updated `getProjectUrl` logic. |
| `apps/portfolio/app/[locale]/projects/[slug]/page.tsx` | New | Main project detail page. |
| `apps/portfolio/messages/` | Modified | New translations for breadcrumbs and UI. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing content for old projects | High | Add a "Coming Soon" or fallback to the short description if `content` is empty. |
| SEO overlap | Low | Use canonical tags and clear breadcrumb hierarchy. |

## Rollback Plan

Revert `lib/navigation.ts` to its previous state and delete the `/[slug]` route folder. The Sanity schema additions are non-breaking.

## Dependencies

- `next-sanity` (existing)
- `next-intl` (existing)

## Success Criteria

- [ ] Each project has a reachable `/projects/[slug]` URL.
- [ ] Breadcrumbs correctly reflect the path (Home > Projects > [Title]).
- [ ] Schema.org validator passes for `SoftwareSourceCode` on project pages.
- [ ] Metadata is correctly generated for Social Media previews.
