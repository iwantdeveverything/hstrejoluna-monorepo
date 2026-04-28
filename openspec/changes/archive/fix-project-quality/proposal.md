# Proposal: fix-project-quality

## Intent

PR #28 (feat/portfolio-individual-pages) introduced project detail pages with 2 critical issues (XSS vector in JSON-LD, missing `generateStaticParams`) and 3 warnings (unnecessary client directive, missing `sizes` on images, unstable React keys). These MUST be fixed before merging to master to prevent security vulnerabilities and suboptimal performance.

## Scope

### In Scope
- Export `generateStaticParams` in `[slug]/page.tsx` for SSG/ISR of project pages
- Create shared `safeJsonLd()` utility and apply to all 3 JSON-LD locations
- Remove `"use client"` from Breadcrumbs component
- Add `sizes` prop to `<Image fill>` in project page
- Replace `idx` key with `img.asset._ref` in gallery map

### Out of Scope
- `getProjectUrl` behavior (finding #3 — intentional, no change needed)
- ISR `revalidate` configuration (separate concern)
- Additional Sanity query optimization

## Capabilities

### New Capabilities
- `json-ld-safety`: Shared utility for XSS-safe JSON-LD injection across all portfolio pages

### Modified Capabilities
- None (no existing spec-level behavior changes)

## Approach

1. **safeJsonLd utility**: Create `apps/portfolio/lib/safe-json-ld.ts` exporting a function that runs `JSON.stringify` then replaces `</` with `<\/`. Apply to all 3 JSON-LD locations.
2. **generateStaticParams**: Query Sanity for all project slugs, cross-product with `routing.locales`. Co-locate with the existing page component.
3. **Breadcrumbs cleanup**: Remove `"use client"` directive — component has zero client-side features.
4. **Image sizes**: Add layout-appropriate `sizes` strings to main image and gallery images.
5. **Stable keys**: Replace `idx` with `img.asset._ref` in gallery `.map()`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/portfolio/lib/safe-json-ld.ts` | New | Shared `safeJsonLd()` utility |
| `apps/portfolio/app/[locale]/projects/[slug]/page.tsx` | Modified | Add `generateStaticParams`, use `safeJsonLd`, add `sizes`, fix gallery keys |
| `apps/portfolio/components/Breadcrumbs.tsx` | Modified | Remove `"use client"`, use `safeJsonLd` |
| `apps/portfolio/app/[locale]/page.tsx` | Modified | Use `safeJsonLd` for JSON-LD |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `LocalizedLink` requires client context | Low | Next.js auto-wraps client imports in server components; test after removing directive |
| Sanity query in `generateStaticParams` fails at build | Low | Use `try/catch` with empty array fallback — pages become dynamic instead of failing build |
| `img.asset._ref` missing on some images | Low | Fallback to index: `img.asset?._ref ?? idx` |

## Rollback Plan

All changes are on the `feat/portfolio-individual-pages` branch. Revert the fix commit(s) — no schema or data changes involved. `git revert <commit>` is sufficient.

## Dependencies

- None. All changes are self-contained within `apps/portfolio`.

## Success Criteria

- [ ] No `dangerouslySetInnerHTML` + `JSON.stringify` without `safeJsonLd` in portfolio app
- [ ] `generateStaticParams` exported from `[slug]/page.tsx`
- [ ] Breadcrumbs renders as server component (no `"use client"`)
- [ ] All `<Image fill>` have explicit `sizes` prop
- [ ] No array index used as React key where stable ID is available
