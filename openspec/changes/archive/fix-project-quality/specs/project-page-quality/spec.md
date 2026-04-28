# Project Page Quality Specification

## Purpose

Ensure project detail pages are statically generated, rendered as server components where possible, and follow Next.js image optimization and React reconciliation best practices.

## Requirements

### Requirement: Static Params Generation

The project detail page (`app/[locale]/projects/[slug]/page.tsx`) MUST export a `generateStaticParams` function that returns all valid `{ locale, slug }` combinations by querying Sanity for project slugs and crossing them with `routing.locales`.

#### Scenario: All projects pre-rendered at build time

- GIVEN Sanity contains projects with slugs `["alpha", "beta"]` and locales are `["en", "es"]`
- WHEN `generateStaticParams()` executes
- THEN it MUST return `[{locale:"en",slug:"alpha"},{locale:"en",slug:"beta"},{locale:"es",slug:"alpha"},{locale:"es",slug:"beta"}]`

#### Scenario: Sanity query fails during build

- GIVEN the Sanity client throws an error during the `generateStaticParams` query
- WHEN `generateStaticParams()` executes
- THEN it MUST return an empty array (graceful degradation to dynamic rendering)
- AND it MUST NOT throw, preventing build failure

#### Scenario: No projects exist in Sanity

- GIVEN Sanity returns an empty array of projects
- WHEN `generateStaticParams()` executes
- THEN it MUST return an empty array

### Requirement: Breadcrumbs Server Component

The Breadcrumbs component (`components/Breadcrumbs.tsx`) MUST NOT include a `"use client"` directive. It SHOULD render as a React Server Component since it contains no client-side interactivity (no hooks, no event handlers, no browser APIs).

#### Scenario: Server-side rendering

- GIVEN the Breadcrumbs component source file
- WHEN inspected for directives
- THEN it MUST NOT contain `"use client"` at the top of the file

### Requirement: Image Sizing for Fill Images

Every `<Image>` component using the `fill` prop on the project detail page MUST include an explicit `sizes` prop with a responsive value appropriate to its layout container.

#### Scenario: Hero image sizes

- GIVEN the main project image inside an 8-column grid area
- WHEN rendered with `fill`
- THEN it MUST include a `sizes` prop reflecting its responsive breakpoints

#### Scenario: Gallery image sizes

- GIVEN a gallery image inside a 2-column grid within the 8-column area
- WHEN rendered with `fill`
- THEN it MUST include a `sizes` prop reflecting its responsive breakpoints

### Requirement: Stable Gallery Keys

The gallery image `.map()` MUST use a stable, content-derived key instead of the array index. The key SHOULD be `img.asset._ref`. If `img.asset._ref` is unavailable, the system MUST fall back to the array index.

#### Scenario: All images have asset refs

- GIVEN a gallery array where every image has `asset._ref`
- WHEN the gallery renders
- THEN each element's React key MUST be the corresponding `asset._ref` value

#### Scenario: An image is missing asset._ref

- GIVEN a gallery array where one image has no `asset._ref`
- WHEN the gallery renders
- THEN that element's React key MUST fall back to its array index
- AND other elements MUST still use their `asset._ref`
