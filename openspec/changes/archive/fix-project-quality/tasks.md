# Tasks: fix-project-quality

## Phase 1: Testing (TDD -- RED)

- [ ] 1.1 Create `apps/portfolio/lib/safe-json-ld.test.ts` with failing tests for `safeJsonLd()`: (a) standard object returns valid JSON, (b) payload with `</script>` escapes to `\u003c`, (c) nested `</style>` and `</SCRIPT>` all escaped, (d) handles empty object and null values. Import from `@/lib/safe-json-ld`.

## Phase 2: Infrastructure (TDD -- GREEN)

- [ ] 2.1 Create `apps/portfolio/lib/safe-json-ld.ts` exporting `safeJsonLd(data: unknown): string` -- `JSON.stringify(data).replace(/</g, "\\u003c")`. All tests from 1.1 must pass.

## Phase 3: Implementation (existing file modifications)

- [ ] 3.1 **Breadcrumbs server component**: In `apps/portfolio/components/Breadcrumbs.tsx`, remove `"use client"` directive (line 1). Import `safeJsonLd` from `@/lib/safe-json-ld`. Replace `JSON.stringify(...)` in the JSON-LD script with `safeJsonLd(...)`.
  - Deps: 2.1
  - Spec: Breadcrumbs Server Component + Breadcrumbs JSON-LD adoption

- [ ] 3.2 **Home page JSON-LD**: In `apps/portfolio/app/[locale]/page.tsx`, import `safeJsonLd` from `@/lib/safe-json-ld`. Replace `JSON.stringify(jsonLd)` (line 100) with `safeJsonLd(jsonLd)`.
  - Deps: 2.1
  - Spec: Home page JSON-LD adoption

- [ ] 3.3 **Project page JSON-LD**: In `apps/portfolio/app/[locale]/projects/[slug]/page.tsx`, import `safeJsonLd` from `@/lib/safe-json-ld`. Replace `JSON.stringify(jsonLd)` (line 105) with `safeJsonLd(jsonLd)`.
  - Deps: 2.1
  - Spec: Project page JSON-LD adoption

- [ ] 3.4 **generateStaticParams**: In `apps/portfolio/app/[locale]/projects/[slug]/page.tsx`, add `const allSlugsQuery = '*[_type == "project" && defined(slug.current)].slug.current'` and export `generateStaticParams()` that fetches slugs via `client.fetch<string[]>(allSlugsQuery)`, maps to `{ slug }[]`, with try/catch returning `[]`.
  - Deps: none
  - Spec: Static Params Generation (all 3 scenarios)

- [ ] 3.5 **Image sizes**: In `apps/portfolio/app/[locale]/projects/[slug]/page.tsx`, add `sizes="(max-width: 1024px) 100vw, 66vw"` to the hero `<Image fill>` (line 156-160). Add `sizes="(max-width: 768px) 100vw, 50vw"` to each gallery `<Image fill>` (line 174-178).
  - Deps: none
  - Spec: Image Sizing for Fill Images

- [ ] 3.6 **Gallery keys**: In `apps/portfolio/app/[locale]/projects/[slug]/page.tsx`, change gallery `.map()` key from `idx` to `img.asset?._ref ?? String(idx)` (line 173).
  - Deps: none
  - Spec: Stable Gallery Keys

## Phase 4: Verification

- [ ] 4.1 Run `npm test` -- all unit tests pass (safeJsonLd + existing tests).
- [ ] 4.2 Grep: no raw `JSON.stringify` remains inside any `application/ld+json` script in `apps/portfolio/`.
- [ ] 4.3 Grep: `"use client"` is absent from `Breadcrumbs.tsx`.

## Parallelism

- Tasks 3.1, 3.2, 3.3 are parallel (independent files, same dependency on 2.1).
- Tasks 3.4, 3.5, 3.6 are parallel (same file but independent edits, no dependency on 2.1).
- Phase 1 -> Phase 2 is sequential (TDD).
- Phase 4 runs after all Phase 3 tasks complete.
