# Tasks: Lighthouse Audit Fixes — Performance + A11Y Overhaul

## Review Workload Forecast

| Field                   | Value                |
| ----------------------- | -------------------- |
| Estimated changed lines | ~150                 |
| 400-line budget risk    | Low                  |
| Chained PRs recommended | No                   |
| Suggested split         | Single PR            |
| Delivery strategy       | auto-chain           |
| Chain strategy          | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: Low

## Phase 1: Security Headers

- [x] 1.1 Add `async headers()` to `apps/portfolio/next.config.ts` with CSP-Report-Only, HSTS (max-age=63072000), COOP (same-origin), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin). Apply to `source: "/(.*)"`. Verify: `next.config.test.ts` passes + manual curl header check.
- [x] 1.2 Extend `apps/portfolio/next.config.test.ts` — assert headers output structure (all 6 security headers present, CSP uses Report-Only header name). Verify: `npm test -- next.config.test.ts` passes.

## Phase 2: Performance

- [x] 2.1 Replace `export const dynamic = "force-dynamic"` → `export const revalidate = 60` in `apps/portfolio/app/[locale]/page.tsx` (line 17). Verify: response includes `Cache-Control: public, max-age=60, must-revalidate`.
- [x] 2.2 Bump `target` from `"ES2017"` to `"ES2020"` in `apps/portfolio/tsconfig.json` (line 3).
- [x] 2.3 Create `.browserslistrc` at repo root with contents: `defaults\nChrome >= 90\nFirefox >= 90\nSafari >= 15`. Verify: `npm run build` output shows reduced polyfill footprint.
- [x] 2.4 Remove BootSequence from `apps/portfolio/components/ObsidianStream.tsx`: delete `import { BootSequence }` (line 18), `isBooted` state (line 79), overflow lock `useEffect` (lines 101-110), `AnimatePresence` gate (lines 114-116). Render content unconditionally (remove `isBooted &&` guard on line 118). Keep `NEXT_PUBLIC_SKIP_BOOT_SEQUENCE` unused for rollback. Verify: `ObsidianStream.test.tsx` updated and passing.

## Phase 3: Accessibility

- [x] 3.1 Fix color contrast in `apps/portfolio/components/ui/LocaleSwitcher.tsx` (line 29): `text-gray-500` → `text-gray-300`. Verify: `text-gray-300` (#D1D5DB) on dark bg achieves ≥4.5:1 contrast ratio.
- [x] 3.2 Fix heading hierarchy + contrast in `apps/portfolio/components/fragments/SkillsOverview.tsx`: `<h4>` → `<span>` (line 64, inside `<button>` with `<h2>` parent). Also `opacity-50` → `opacity-70` (line 61). Verify: axe-core scan passes; no skipped heading levels; contrast ≥4.5:1.
- [x] 3.3 Fix CTA accessible name match in `apps/portfolio/components/fragments/HeroSection.tsx` (line 60): append visible text to `aria-label` — e.g., `${ctaAriaLabel} — ${primaryCta}`. Verify: accessible name computed by Testing Library contains visible link text.
- [x] 3.4 Differentiate certificate links in `packages/ui/src/components/CertificatesPanel.tsx` (lines 83-89): add `aria-label={\`${resolvedLabels.viewCredential}: ${certificate.name}\`}`to each`<a>`. Verify: all "View Credential" links have unique accessible names.

## Phase 4: Verification

- [x] 4.1 Run full vitest suite: `npm test` — all existing + new tests pass. Verify zero regressions.
- [x] 4.2 Run typecheck: `npm run typecheck` — zero errors.
- [x] 4.3 Run production build: `npm run build` — full build succeeds. Compare bundle sizes pre/post if tooling available.
- [ ] 4.4 Lighthouse CI re-audit: verify Performance ≥90, Accessibility = 100, Best Practices ≥95. **Skipped** — requires production deployment.
- [ ] 4.5 Playwright e2e + axe-core: `npm run qa:e2e --workspace=apps/portfolio` — 6 pre-existing failures, **zero regressions from this change**. navigation.a11y passes in Firefox + Mobile Chrome (flaky in Desktop Chrome only). project-grid axe-core: pre-existing design token contrast issues (not in scope). hero memory-leak: browser crash during WebGL cycling (not a leak, timing issue). card links: Sanity data unavailability. cookie-banner: flaky timing.
