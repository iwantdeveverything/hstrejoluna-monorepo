# Spec Traceability Matrix: portfolio-navigation

## Metadata

- Change: `portfolio-navigation`
- QA owner: Codex (assistant)
- Execution date: 2026-04-15
- Evidence runs:
  - `npm run test --workspace=apps/portfolio -- --reporter=verbose`
  - `npm run qa:e2e --workspace=apps/portfolio -- --project="Desktop Chrome" --project="Mobile Chrome"`
  - `npm run qa:lighthouse --workspace=apps/portfolio`
  - `npm run lint --workspace=apps/portfolio`

## Matrix

| Requirement | Scenario | Test Layer | Automated Test ID / File | Manual Check Ref | Evidence | Status |
|-------------|----------|------------|----------------------------|------------------|----------|--------|
| Global Section Tracking | User scrolls down smoothly | E2E | `e2e/navigation.behavior.spec.ts` > `scrolling updates active section marker without clicking navigation` | M-01 | Playwright run (Desktop Chrome) | ✅ COMPLIANT |
| Mobile-First Navigation Menu | Mobile user opens the navigation menu | E2E | `e2e/navigation.behavior.spec.ts` > `mobile menu opens and navigates to target section` | M-01 | Playwright run (Mobile Chrome) | ✅ COMPLIANT |
| Mobile-First Navigation Menu | Desktop layout does not duplicate mobile controls | E2E | `e2e/navigation.behavior.spec.ts` > `desktop layout hides mobile menu toggle` | M-02 | Playwright run (Desktop Chrome) | ✅ COMPLIANT |
| Mobile-First Navigation Menu | Desktop section navigation is smooth | E2E + Integration | `e2e/navigation.behavior.spec.ts` > `desktop navigation activates certificates...` + `components/ui/SectionDock.test.tsx` > `uses shared smooth-scroll helper...` | M-01 | Playwright + Vitest | ✅ COMPLIANT |
| Dynamic Social Links from Sanity | Sanity provides all social links | Integration | `components/ui/CommandNav.test.tsx` > `renders all supported social links with safe external semantics` | M-04 | Vitest | ✅ COMPLIANT |
| Dynamic Social Links from Sanity | Sanity omits one or more social links | Integration | `components/ui/CommandNav.test.tsx` > `shows fallback text in mobile menu when socials are missing` | M-04 | Vitest | ✅ COMPLIANT |
| Semantic Navigation and Accessibility Compliance | Keyboard and screen-reader navigation | Integration + E2E | `components/ui/CommandNav.test.tsx` > semantic nav/aria checks + `e2e/navigation.a11y.spec.ts` > `desktop keyboard navigation keeps logical tab order with visible focus` | M-02 | Vitest + Playwright | ✅ COMPLIANT |
| Semantic Navigation and Accessibility Compliance | Active section semantics | Integration + E2E | `components/ui/CommandNav.test.tsx` + `components/ui/SectionDock.test.tsx` + `e2e/navigation.behavior.spec.ts` | M-03 | Vitest + Playwright | ✅ COMPLIANT |
| SEO-Friendly Link Markup | Internal section anchors | E2E | `e2e/navigation.behavior.spec.ts` > `mobile menu opens and navigates to target section` (URL hash) | M-05 | Playwright | ✅ COMPLIANT |
| SEO-Friendly Link Markup | External social anchors | Integration | `components/ui/CommandNav.test.tsx` > `renders all supported social links with safe external semantics` | M-04 | Vitest | ✅ COMPLIANT |
| Responsive Grid Construction | Mobile grid scaling | E2E | `e2e/grid-expansion.behavior.spec.ts` > `projects grid uses one column on mobile` | M-06 | Playwright (Mobile Chrome) | ✅ COMPLIANT |
| Responsive Grid Construction | Desktop grid scaling | E2E | `e2e/grid-expansion.behavior.spec.ts` > `projects grid uses three columns on desktop` | M-06 | Playwright (Desktop Chrome) | ✅ COMPLIANT |
| In-Place Expansion Unrolling | Selection expansion | E2E | `e2e/grid-expansion.behavior.spec.ts` > `project selection expands in place...` | M-07 | Playwright | ✅ COMPLIANT |
| Singular Expansion Mode | Selecting consecutive items | E2E | `e2e/grid-expansion.behavior.spec.ts` > `project selection...collapses previous` + `experience selection keeps singular expansion behavior` | M-07 | Playwright | ✅ COMPLIANT |

## Compliance Summary

- ✅ Compliant: 14
- ⚠️ Partial: 0
- ❌ Untested/Failing: 0

Result: **14/14 scenarios fully compliant**

## Manual Checklist Mapping

| Ref | Check | Result | Notes |
|-----|-------|--------|-------|
| M-01 | Smooth section navigation mobile/desktop | Completed | Verified with desktop/mobile Playwright navigation scenarios and hash/active marker assertions. |
| M-02 | Keyboard tab order and focus visibility | Completed | Verified by `navigation.a11y` keyboard traversal test (tab order + visible focus outline). |
| M-03 | Active marker across all sections | Completed | Verified by scroll-driven active section assertions and certificates activation checks. |
| M-04 | External links and `mailto` semantics | Completed | Verified by `CommandNav` integration tests for social href/rel semantics. |
| M-05 | Internal anchor behavior and URL fragments | Completed | Verified by mobile navigation hash assertion and shared anchor-based links. |
| M-06 | Responsive grid behavior | Completed | Verified by desktop/mobile column-count E2E assertions. |
| M-07 | In-place expansion and singular expansion | Completed | Verified by project/experience expansion-collapse E2E scenarios. |
