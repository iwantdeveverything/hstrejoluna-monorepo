# Design: Lighthouse Audit Fixes — Performance + A11Y Overhaul

## Technical Approach

Fix all Lighthouse audit blockers by applying five targeted changes: (1) comprehensive security headers via `headers()` in `next.config.ts`, (2) enable BFCache by replacing `force-dynamic` with `revalidate = 60`, (3) remove the boot sequence animation to unblock first paint, (4) bump TS target to drop legacy polyfills, (5) fix four a11y violations (color contrast, heading hierarchy, label mismatch, identical links).

## Architecture Decisions

### Decision 1: CSP Policy

| Option                                          | Tradeoff                                                            | Decision                           |
| ----------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| Nonce-based CSP via `next/script`               | Secure but requires restructuring JSON-LD scripts and GTM           | Rejected — overkill for portfolio  |
| `'unsafe-inline'` on `script-src` + `style-src` | Simpler, compatible with existing `dangerouslySetInnerHTML` JSON-LD | **Chosen**                         |
| No CSP                                          | Zero risk of breaking content                                       | Rejected — no security improvement |

**Choice**: Report-only rollout with `Content-Security-Policy-Report-Only` for 1 week in staging, then flip to enforced `Content-Security-Policy`. Directives:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline';
img-src 'self' https://cdn.sanity.io data:;
font-src 'self';
connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.sanity.io;
frame-src https://www.googletagmanager.com;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
object-src 'none';
```

**Rationale**: `'unsafe-inline'` needed for JSON-LD `dangerouslySetInnerHTML` scripts and Tailwind/Next.js CSS style injection. Sanity CDN images served from `cdn.sanity.io`. GTM/GA origins needed for analytics scripts and noscript iframe. Applied to all routes via `source: "/(.*)"` in `next.config.ts`. No nonces needed since portfolio has no user-generated content displayed unsanitized.

### Decision 2: Revalidate Strategy

| Option                                      | Tradeoff                                | Decision                             |
| ------------------------------------------- | --------------------------------------- | ------------------------------------ |
| `revalidate = 60` (page-level ISR)          | Content stale for ≤60s, BFCache enabled | **Chosen**                           |
| `revalidate = 0` + `stale-while-revalidate` | Always fresh, more server load          | Rejected — unnecessary for portfolio |
| `force-dynamic` (current)                   | Always fresh, blocks BFCache            | Must fix                             |

**Choice**: Replace `export const dynamic = "force-dynamic"` with `export const revalidate = 60` on `page.tsx`. This sets `Cache-Control: public, max-age=60, must-revalidate` — unblocks BFCache and enables ISR caching.

**Rationale**: No webhook-based revalidation exists in codebase (verified by grep). 60s TTL is safe for portfolio content that changes infrequently. Next-intl `[locale]` routing is unaffected — `revalidate` is a page-level export compatible with dynamic params. Sanity `useCdn: false` ensures fresh data on revalidate.

### Decision 3: Boot Sequence Removal

| Option                                                | Tradeoff                                             | Decision                   |
| ----------------------------------------------------- | ---------------------------------------------------- | -------------------------- |
| Remove `BootSequence` wrapper entirely                | Simplest, fastest first paint                        | **Chosen**                 |
| Replace with CSS-only pulse animation                 | Preserves branding but still delays meaningful paint | Rejected                   |
| Keep existing gate (`NEXT_PUBLIC_SKIP_BOOT_SEQUENCE`) | Maintains existing escape hatch                      | Already exists as env flag |

**Choice**: Remove `<BootSequence>` component invocation and `AnimatePresence` gate from `ObsidianStream.tsx`. Remove `isBooted` state + `useEffect` body overflow lock. Keep `NEXT_PUBLIC_SKIP_BOOT_SEQUENCE` env var for rollback compatibility. The existing `<m.div>` fade-in animation on the content layer (opacity 0→1, 0.5s) preserves the visual entrance.

**Rationale**: The 3.5s boot animation (2.5s matrix rain + 1s fade) blocks first paint and LCP measurement entirely. Hero section renders liquid-glass SSR shell immediately — no additional loading state needed. Content fades in via existing framer-motion wrapper.

### Decision 4: Bundle Splitting

| Option                                 | Tradeoff                                 | Decision                     |
| -------------------------------------- | ---------------------------------------- | ---------------------------- |
| Add `next/dynamic` for more components | Smaller initial JS, worse UX if overused | **Deferred** — no clear wins |
| Keep existing pattern                  | HeroLiquidWebGL already lazy-loaded      | **Chosen**                   |

**Choice**: No additional `next/dynamic` usage beyond existing `HeroLiquidWebGL` (line 17 of HeroLiquidField.tsx). Boot sequence removal alone drops ~5KB of JS (BootSequence + matrix rain canvas logic). The remaining bundle split wins are marginal and better assessed in a separate change after measuring base improvement.

**Rationale**: HeroLiquidWebGL (Three.js WebGL) is already code-split. Other components are lightweight React components. Defer full bundle audit to separate change.

### Decision 5: LCP Candidate

**Choice**: The `<h1>` in `HeroSection.tsx` (line 41-48) becomes the LCP candidate. It is SSR-rendered text, styled with `next/font` (JetBrains_Mono variable font with display swap). No images on page — text is the largest paint element.

**Rationale**: With boot sequence removed, the h1 renders in the first paint. `next/font` with `display: swap` ensures text renders with fallback font immediately. The `text-[clamp(3rem,8vw,7rem)]` sizing makes it visually dominant for LCP measurement.

### Decision 6: Header Configuration

**Choice**: Single `headers()` async function in `next.config.ts` returning global headers array:

```ts
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy-Report-Only", value: "..." },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ];
}
```

**Rationale**: Global headers applied to all routes via `/(.*)` source pattern. Next.js App Router's `headers()` is the standard approach (vs middleware). No per-route differentiation needed — all pages share the same security posture. CSP-Report-Only during rollout phase, then switch to enforced `Content-Security-Policy`.

## Data Flow

```
Request → Middleware (intl routing)
       → headers() in next.config.ts → Response headers (CSP, HSTS, COOP, etc.)
       → Page (revalidate=60) → Sanity fetch (ISR cached)
       → HeroSection (SSR h1 = LCP) → HeroLiquidField (client, lazy WebGL)
       → JSON-LD scripts (inline, dangerousSetInnerHTML)
       → GTM (afterInteractive, consent-gated)
```

No data flow changes in this design. All changes are additive (headers) or removal (boot sequence).

## File Changes

| File                                                     | Action | Description                                                                      |
| -------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `apps/portfolio/next.config.ts`                          | Modify | Add `async headers()` with CSP-RO, HSTS, COOP, XFO, X-CTO, Referrer-Policy       |
| `apps/portfolio/app/[locale]/page.tsx`                   | Modify | `force-dynamic` → `revalidate = 60`                                              |
| `apps/portfolio/tsconfig.json`                           | Modify | `target: "ES2017"` → `"ES2020"`                                                  |
| `.browserslistrc`                                        | Create | `defaults, Chrome >= 90, Firefox >= 90, Safari >= 15`                            |
| `apps/portfolio/components/ObsidianStream.tsx`           | Modify | Remove BootSequence wrapper, isBooted state, overflow lock, AnimatePresence gate |
| `apps/portfolio/components/ui/LocaleSwitcher.tsx`        | Modify | `text-gray-500` → `text-gray-300` (WCAG AA contrast)                             |
| `apps/portfolio/components/fragments/SkillsOverview.tsx` | Modify | `<h4>` → `<span>`; `opacity-50` → `opacity-70`                                   |
| `apps/portfolio/components/fragments/HeroSection.tsx`    | Modify | `aria-label={ctaAriaLabel}` → append visible text for accessible name match      |
| `packages/ui/src/components/CertificatesPanel.tsx`       | Modify | Add `aria-label="View {certificate.name} credential"` to credential links        |

## Interfaces / Contracts

No new interfaces. `CertificatesPanelProps` extended with optional `name` field on items (already present — used in aria-label). `headers()` return type is built-in Next.js `Header[]`.

## Testing Strategy

| Layer       | What to Test                                             | Approach                                                            |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Unit        | JSON-LD sanitization unchanged                           | Existing `safe-json-ld.test.ts` + `json-ld.test.ts`                 |
| Unit        | CertificatesPanel aria-label differentiation             | Vitest + Testing Library: assert links have unique accessible names |
| Integration | CSP headers present on response                          | Vitest: mock Next.js request, assert `headers()` output structure   |
| E2E         | Lighthouse scores (Perf≥90, A11y=100, Best Practices≥95) | Playwright + Lighthouse CI                                          |
| E2E         | No `Cache-Control: no-store` on page                     | Playwright: assert response headers                                 |
| A11y        | axe-core scan passes                                     | Playwright + `@axe-core/playwright`                                 |
| Visual      | Color contrast WCAG AA                                   | axe-core automated; manual review for exact ratios                  |

## Migration / Rollout

1. **Phase 1 (this change)**: Deploy with `Content-Security-Policy-Report-Only`, `revalidate = 60`, boot sequence removed, a11y fixes, ES2020 target.
2. **Phase 2 (1 week later)**: Review CSP violation reports. If clean, flip `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `next.config.ts`.
3. **Rollback**: Each change is independently reversible (see proposal § Rollback Plan). No data migration.

## Open Questions

- [ ] Confirm Sanity CDN `img-src` exception covers all content (verify no other image origins in Sanity data)
- [ ] Verify GTM/GA domains are correct for the current Google Analytics property (may differ from `*.google-analytics.com`)
