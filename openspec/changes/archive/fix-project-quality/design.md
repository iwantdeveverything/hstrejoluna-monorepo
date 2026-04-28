# Design: fix-project-quality

## Technical Approach

Five surgical fixes across 4 files in `apps/portfolio`. A new `safeJsonLd()` utility centralizes XSS-safe JSON-LD serialization, replacing 3 inline `JSON.stringify` calls. `generateStaticParams` is added to the slug page for SSG. The remaining 3 fixes are single-line edits (remove directive, add `sizes`, fix keys).

## Architecture Decisions

### Decision: Standalone utility vs inline helper for JSON-LD escaping

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Standalone `lib/safe-json-ld.ts` | Single import across 3 files; testable in isolation; matches existing `lib/utils.ts` pattern | **Chosen** |
| Inline in each file | No new file; duplicates 3 lines of logic in 3 places | Rejected |
| Generic `lib/utils.ts` export | Mixes concerns; `utils.ts` handles Portable Text, not serialization | Rejected |

**Rationale**: The portfolio already has a `lib/` directory with single-purpose modules (`sanity.ts`, `utils.ts`, `navigation.ts`, `sections.ts`). A dedicated `safe-json-ld.ts` follows that convention. Three call sites make deduplication worthwhile.

### Decision: Escape strategy for JSON-LD

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Replace `</` with `<\/` after `JSON.stringify` | Covers the only XSS vector in `<script>` tags; OWASP-recommended; minimal performance impact | **Chosen** |
| Use a library (e.g., `serialize-javascript`) | Over-engineered for structured data that only needs the `</script>` breakout prevention | Rejected |
| CSP-only mitigation | Requires infra changes; doesn't fix the source vulnerability | Rejected |

**Rationale**: The `</` replacement is the standard mitigation per HTML spec section 4.12.1.1 -- a `</script>` sequence inside a `<script>` tag closes the tag prematurely. Replacing `</` with `<\/` in JSON is semantically identical (JSON allows `\/`) and blocks injection.

### Decision: Breadcrumbs as server component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Remove `"use client"` | Renders on server; smaller JS bundle; `LocalizedLink` (client component) auto-creates its own client boundary | **Chosen** |
| Keep `"use client"` | Unnecessarily ships Breadcrumbs JS to client; no hooks or event handlers used | Rejected |

**Rationale**: Verified `next-intl`'s `BaseLink` has its own `"use client"` directive. Next.js handles the boundary automatically when a server component imports a client component. Breadcrumbs itself uses zero client APIs.

### Decision: `generateStaticParams` returns slugs only (not slug+locale)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Return `{ slug }[]` only | Parent layout already generates `{ locale }` via its own `generateStaticParams`; Next.js creates the cross-product automatically | **Chosen** |
| Return `{ locale, slug }[]` cross-product | Duplicates locale logic; parent layout already handles it | Rejected |

**Rationale**: Next.js App Router composes `generateStaticParams` hierarchically. The `[locale]/layout.tsx` already returns all locales. The `[slug]/page.tsx` only needs to supply the slug dimension.

## Data Flow

```
Build time (generateStaticParams):

  Sanity API ──→ allSlugsQuery ──→ [{ slug: "x" }, { slug: "y" }]
       │
       └─ try/catch → [] fallback (graceful degradation to dynamic)

Runtime (safeJsonLd):

  jsonLd object ──→ JSON.stringify ──→ replace "</" with "<\/" ──→ dangerouslySetInnerHTML
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/portfolio/lib/safe-json-ld.ts` | Create | `safeJsonLd(data: unknown): string` -- stringify + escape `</` |
| `apps/portfolio/app/[locale]/projects/[slug]/page.tsx` | Modify | Add `generateStaticParams` (Sanity slug query), use `safeJsonLd`, add `sizes` to both `<Image fill>`, replace `idx` key with `img.asset?._ref ?? String(idx)` |
| `apps/portfolio/components/Breadcrumbs.tsx` | Modify | Remove `"use client"`, import and use `safeJsonLd` |
| `apps/portfolio/app/[locale]/page.tsx` | Modify | Import and use `safeJsonLd` for JSON-LD script |

## Interfaces / Contracts

```typescript
// apps/portfolio/lib/safe-json-ld.ts

/**
 * Serializes a value to JSON and escapes sequences that would break
 * out of a <script> tag (replaces "</" with "<\/").
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

Note: Using `\\u003c` instead of `<\/` is an alternative that escapes ALL `<` characters. Both are valid. The `\\u003c` approach is more defensive (covers edge cases beyond `</script>`, e.g., `<!--`). Final choice: use `.replace(/</g, "\\u003c")` -- it's what Next.js's own `next/script` uses internally.

```typescript
// generateStaticParams addition in [slug]/page.tsx

const allSlugsQuery = `*[_type == "project" && defined(slug.current)].slug.current`;

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<string[]>(allSlugsQuery);
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `safeJsonLd` escapes `</script>`, `<!--`, and normal data correctly | Vitest -- input/output assertions |
| Manual | Breadcrumbs still renders correctly without `"use client"` | `next dev` -- navigate to a project page, verify breadcrumb links work |
| Manual | `generateStaticParams` produces pages at build | `next build` -- verify project routes in build output |
| Visual | `sizes` prop doesn't break image layout | `next dev` -- check project page images render correctly |

## Migration / Rollout

No migration required. All changes are backward-compatible edits on the feature branch.

## Open Questions

None -- all technical decisions are resolved.
