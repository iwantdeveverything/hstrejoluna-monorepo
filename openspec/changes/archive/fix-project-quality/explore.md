# Exploration: fix-project-quality

**Issue**: #29
**Branch**: feat/portfolio-individual-pages
**Date**: 2026-04-28

## Findings

### 1. No `generateStaticParams` — VALID, CRITICAL

- `next.config.ts` has NO `output: 'export'` — the app uses SSR (dynamic rendering by default).
- However, `apps/portfolio/app/[locale]/layout.tsx:40` exports `generateStaticParams` for locales.
- Without `generateStaticParams` in the `[slug]` page, Next.js cannot pre-render project pages at build time. They become fully dynamic — slower TTFB, no ISR benefits.
- **Fix**: Export `generateStaticParams` that queries Sanity for all project slugs, combined with locale params from `routing.locales`.

### 2. XSS in JSON-LD — VALID, CRITICAL (systemic)

- Found 3 occurrences of the unsafe pattern:
  - `apps/portfolio/app/[locale]/projects/[slug]/page.tsx:104`
  - `apps/portfolio/components/Breadcrumbs.tsx:40`
  - `apps/portfolio/app/[locale]/page.tsx:99`
- `JSON.stringify` does NOT escape `</script>` sequences. If Sanity content contains `</script>`, it breaks out of the `<script>` tag → XSS vector.
- **Fix**: Create a shared `safeJsonLd(data)` utility that replaces `</` with `<\/` after `JSON.stringify`. This is the standard approach (used by next-seo, schema-dts, etc.). Apply to all 3 locations.

### 3. `getProjectUrl` behavior change — VALID, WARNING

- `micrositePath` exists in the type and is used in `ProjectsOverview.tsx:118` for the "Live Deployment" link.
- Storybook stories mock `micrositePath: "/projects/zero"`.
- The Sanity schema has `micrositePath` as an optional field. The `slug` field is `required`.
- Since slug is required in the schema, ALL projects will have a slug → micrositePath is NEVER reached in `getProjectUrl`.
- **Fix**: This is intentional — internal routes should be prioritized. But we should ensure `micrositePath` is still used for the "Live Deployment" link in the overview (it is — separate code path). No change needed.

### 4. Breadcrumbs `"use client"` — VALID, WARNING

- Component uses `LocalizedLink` from `@/i18n/navigation`. Need to verify if `LocalizedLink` requires client context.
- The component has NO: useState, useEffect, useRef, event handlers, browser APIs.
- `process.env.NEXT_PUBLIC_BASE_URL` works in both server and client components.
- **Fix**: Remove `"use client"` directive. If `LocalizedLink` is client-only, it can still be imported by a server component (Next.js wraps it automatically).

### 5. `<Image fill>` without `sizes` — VALID, WARNING

- Main image: inside `lg:col-span-8` in a `max-w-5xl` container → approximately `(max-width: 1024px) 100vw, 66vw`.
- Gallery images: inside `md:grid-cols-2` → `(max-width: 768px) 100vw, 50vw`.
- **Fix**: Add appropriate `sizes` props to both.

### 6. Gallery `idx` as key — VALID, WARNING

- `SanityImage` type has `asset._ref` which is unique per image → stable key.
- **Fix**: Use `img.asset._ref` as key. Fallback to idx if somehow missing.

## Scope Assessment

- 4 files to modify, 1 new utility to create
- No breaking changes expected
- All fixes are backward compatible
