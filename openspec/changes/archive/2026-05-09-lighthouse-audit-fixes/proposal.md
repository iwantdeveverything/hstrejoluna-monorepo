# Proposal: Lighthouse Audit Fixes — Performance + A11Y Overhaul

## Intent

Fix all Lighthouse audit failures blocking a perfect score on the portfolio: missing security headers, NO_LCP (no LCP candidate detected), blocked BFCache, 13KB legacy JS polyfills, color contrast violations, heading hierarchy gaps, and identical-link a11y issues. Remove the boot sequence animation which delays first paint.

## Scope

### In Scope

- Security headers: CSP, HSTS (max-age=63072000), COOP (same-origin), X-Frame-Options (DENY) via `headers()` in `next.config.ts`
- Override `Cache-Control` for BFCache: replace `export const dynamic = "force-dynamic"` with `revalidate = 60` in page.tsx
- Remove boot sequence animation from `ObsidianStream.tsx` (delays first paint)
- Bump tsconfig `target` from ES2017 to ES2020 + add `.browserslistrc` (drops ~13KB polyfills)
- Color contrast: LocaleSwitcher `text-gray-500`→`text-gray-300`, SkillsOverview `opacity-50`→`opacity-70`
- Heading hierarchy: `<h4>` in SkillsOverview→`<span>` (inside button, parent is `<h2>`)
- CTA aria-label: append visible text "Explore My Work" to match accessible name
- Certificate links: add `aria-label` with certificate name for differentiated link text
- Audit JS bundle splitting; consider `next/dynamic` for heavy components (non-critical improvement, opportunistic)

### Out of Scope

- New features or visual redesign
- Bumping tsconfig to ES2022+ (ES2020 is the next stable milestone)
- Full bundle-splitting overhaul (deferred to separate change if needed)

## Capabilities

### New Capabilities

- `security-headers`: CSP, HSTS, COOP, X-Frame-Options response headers for portfolio app

### Modified Capabilities

- `liquid-glass-hero`: Remove boot sequence (changes first-paint behavior), ensure LCP candidate per existing spec requirement (h1 as LCP), fix CTA aria-label match
- `portfolio-certificates-section`: Differentiate identical "View Credential" links via certificate-name aria-labels

## Approach

**Security**: Add `headers()` async function to `next.config.ts` returning `source: "/(.*)", headers: [...]` with CSP (`default-src 'self'` + Sanity CDN exceptions), HSTS, COOP, X-Frame-Options, and `Cache-Control: public, max-age=0, must-revalidate` override for BFCache.

**Performance**: Change `page.tsx` from `force-dynamic` to `revalidate = 60`. Bump tsconfig target and add `.browserslistrc` targeting modern browsers (Chrome 90+, Firefox 90+, Safari 15+). Remove boot sequence `<BootSequence>` wrapper from `ObsidianStream.tsx` and render content immediately. Audit bundle splitting during implementation — apply `next/dynamic` if clear wins.

**Accessibility**: Token replacements in `LocaleSwitcher.tsx` and `SkillsOverview.tsx`. Replace `<h4>` with `<span>` in SkillsOverview button. Update hero CTA `aria-label` and CertificatesPanel link `aria-label`s to resolve mismatches.

## Affected Areas

| Area                                                     | Impact   | Description                                  |
| -------------------------------------------------------- | -------- | -------------------------------------------- |
| `apps/portfolio/next.config.ts`                          | Modified | Add `headers()` for security + cache-control |
| `apps/portfolio/app/[locale]/page.tsx`                   | Modified | `force-dynamic`→`revalidate = 60`            |
| `apps/portfolio/tsconfig.json`                           | Modified | `target: "ES2020"`                           |
| `.browserslistrc` (root)                                 | New      | Modern browser targets                       |
| `apps/portfolio/components/ObsidianStream.tsx`           | Modified | Remove BootSequence wrapper                  |
| `apps/portfolio/components/ui/LocaleSwitcher.tsx`        | Modified | `text-gray-500`→`text-gray-300`              |
| `apps/portfolio/components/fragments/SkillsOverview.tsx` | Modified | `<h4>`→`<span>`, opacity-50→opacity-70       |
| `apps/portfolio/components/fragments/HeroSection.tsx`    | Modified | CTA aria-label match                         |
| `packages/ui/src/components/CertificatesPanel.tsx`       | Modified | Differentiated link aria-labels              |

## Risks

| Risk                                                              | Likelihood | Mitigation                                                                                |
| ----------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| CSP too strict, blocks Sanity CDN assets                          | Low        | Start with report-only via `Content-Security-Policy-Report-Only`, verify in dev/staging   |
| `revalidate` causes stale Sanity data for 60s                     | Low        | Sanity webhooks trigger on-demand revalidation already; 60s is conservative               |
| `.browserslistrc` changes Next.js compilation targets             | Low        | Run `npm run build` and compare bundle sizes pre/post                                     |
| Boot sequence removal changes first visual impression             | Low        | Hero still renders liquid-glass SSR shell immediately; just without the loading animation |
| ES2020 target drops support for very old browsers (<0.5% traffic) | Low        | Browsers that require ES2017 have <0.3% global usage                                      |

## Rollback Plan

1. Revert `next.config.ts` headers (remove `headers()` function)
2. Restore `export const dynamic = "force-dynamic"` in page.tsx
3. Restore boot sequence in `ObsidianStream.tsx`
4. Revert tsconfig target to ES2017, delete `.browserslistrc`
5. Revert token/aria-label changes in affected components
   All changes are per-file, no database migrations, no infrastructure changes.

## Success Criteria

- [ ] Lighthouse Performance ≥ 90 (currently 62–72 due to NO_LCP)
- [ ] Lighthouse Accessibility = 100 (currently 0.95)
- [ ] Lighthouse Best Practices ≥ 95
- [ ] No `Cache-Control: no-store` on portfolio page responses
- [ ] Security headers present on all portfolio routes
- [ ] Bundle size reduced by ≥10KB (from dropped polyfills)
- [ ] All existing tests pass (`npm test`, `npm run typecheck`)
- [ ] Playwright e2e + axe-core accessibility scan passes
