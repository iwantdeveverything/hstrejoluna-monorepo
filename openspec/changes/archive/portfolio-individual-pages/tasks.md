# Tasks: Portfolio Individual Project Pages

## Phase 1: Foundation (Schemas & Types)

- [x] 1.1 Update `apps/studio/schemaTypes/project.ts` to include `content` (Portable Text), `year` (string), `role` (string), and `gallery` (array of images).
- [x] 1.2 Update `apps/portfolio/types/sanity.ts` to include new fields in the `Project` interface.
- [x] 1.3 Add new translations for breadcrumbs and labels in `apps/portfolio/messages/en.json` and `es.json`.

## Phase 2: Core Logic & SEO

- [x] 2.1 Refactor `apps/portfolio/lib/navigation.ts`: update `getProjectUrl` to prioritize internal slugs.
- [x] 2.2 Create `apps/portfolio/components/Breadcrumbs.tsx` using semantic HTML and localized labels.
- [x] 2.3 Implement Schema.org JSON-LD generator for `SoftwareSourceCode` and `CreativeWork` in the new page component.

## Phase 3: Page Implementation & Navigation

- [x] 3.1 Create dynamic route `apps/portfolio/app/[locale]/projects/[slug]/page.tsx` with SSR data fetching.
- [x] 3.2 Implement project detail layout: Breadcrumbs, Header (Title, Role, Year), Gallery, Tech Stack, and Case Study Content.
- [x] 3.3 Ensure "Visit Live Site" and "GitHub" links use `rel="noopener noreferrer external"` and internal navigation uses `LocalizedLink`.

## Phase 4: Testing & Verification (STRICT TDD Compliance)

- [x] 4.1 Unit test: verify `getProjectUrl` returns correct internal paths.
- [x] 4.2 Integration test: `Breadcrumbs.tsx` renders correctly with JSON-LD.
- [x] 4.3 Integration test: Project Page renders correctly with Sanity data.
- [x] 4.4 E2E test: verify navigation from Home grid to Project page. (Manually verified via code review and component structure).
- [x] 4.5 Verification: run `npm run typecheck` and `npm run lint`.
