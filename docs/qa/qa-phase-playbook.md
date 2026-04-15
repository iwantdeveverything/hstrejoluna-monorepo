# Professional QA Phase Playbook

## Objective

Define a repeatable, evidence-based QA process for portfolio releases with explicit quality gates, entry/exit criteria, and traceability to specs.

## Scope

- Workspace: `apps/portfolio`
- Functional focus: navigation, section tracking, dynamic socials, grid expansion
- Non-functional focus: accessibility (WCAG 2.2 AA), SEO, performance, reliability

## Quality Gates

### Gate 1 — Static Safety

- `npm run lint --workspace=apps/portfolio`
- `npm run test --workspace=apps/portfolio`
- Exit criteria:
  - No type/lint errors
  - Unit/integration tests pass

### Gate 2 — E2E Behavior

- `npm run qa:e2e --workspace=apps/portfolio`
- Browser matrix:
  - Desktop Chrome, Firefox, Safari
  - Mobile Chrome, Mobile Safari
- Local note:
  - On Linux distros without full WebKit deps, run local matrix on Chromium/Firefox.
  - Full Safari/WebKit coverage remains enforced in CI.
- Exit criteria:
  - 100% E2E pass
  - No flaky retries in CI final run

### Gate 3 — Accessibility

- Included in Playwright suite via `@axe-core/playwright`
- Manual keyboard and focus walkthrough required for sign-off
- Exit criteria:
  - 0 critical automated violations
  - Keyboard traversal and focus checks completed

### Gate 4 — SEO & Performance Budgets

- `npm run qa:lighthouse --workspace=apps/portfolio`
- Assertions (`apps/portfolio/lighthouserc.cjs`):
  - performance >= 0.85
  - accessibility >= 0.95
  - seo >= 0.95
- Exit criteria:
  - Lighthouse assertions pass

## Manual QA Checklist (Release Sign-off)

- [ ] Smooth section navigation verified on mobile and desktop
- [ ] Active section marker verified for all sections (including certificates)
- [ ] Auto-hide nav verified (hide on downscroll, show on upscroll)
- [ ] Keyboard-only navigation verified (tab order, visible focus)
- [ ] External links and `mailto` behaviors verified

## CI Workflow

- Workflow: `.github/workflows/qa-professional.yml`
- Artifacts:
  - Playwright HTML report
  - Playwright traces/screenshots/videos
  - Lighthouse CI output

## Entry / Exit Criteria

### Entry criteria

- Specs and design are approved
- Environment variables configured for app startup
- Test data available in Sanity for navigation sections

### Exit criteria

- All automated gates pass
- No open Critical/High defects
- Manual QA checklist completed
- Verification report updated with runtime evidence
