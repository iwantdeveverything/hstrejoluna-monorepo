# Tasks: Portfolio Navigation Overhaul

## Phase 1: Foundation & Contracts

- [x] 1.1 Modify `apps/studio/schemaTypes/profile.ts` so `socials` keeps email as plain text when `platform` is `email`, with optional `label` and `order`.
- [x] 1.2 Modify `apps/portfolio/types/sanity.ts` to add `ProfileSocialLink` and type `Profile.socials` with the new schema contract.
- [x] 1.3 Create `apps/portfolio/lib/navigation.ts` with `normalizeSocialLinks()` and `scrollToSection()` (smooth by default, instant when reduced motion).
- [x] 1.4 Modify `apps/portfolio/lib/sections.ts` to expose section metadata (`id`, label, order) for mobile and desktop nav rendering.

## Phase 2: Core Navigation Implementation

- [x] 2.1 Modify `apps/portfolio/components/ui/CommandNav.tsx` to implement semantic mobile-first navigation (`nav`, lists, labels) and active-state rendering.
- [x] 2.2 In `apps/portfolio/components/ui/CommandNav.tsx`, map normalized socials from Sanity (GitHub, LinkedIn, email) and convert email plaintext to `mailto:` at render-time.
- [x] 2.3 Modify `apps/portfolio/components/ui/SectionDock.tsx` to consume shared section metadata, set `aria-current`, and reuse `scrollToSection()` for smooth anchor navigation.
- [x] 2.4 Modify `apps/portfolio/components/ObsidianStream.tsx` to pass `profile.socials` and section config into `CommandNav` and `SectionDock`.

## Phase 3: Integration, SEO & Accessibility Wiring

- [x] 3.1 Modify `apps/portfolio/app/page.tsx` so the primary content landmark uses `id="main-content"` and keeps JSON-LD `sameAs` from socials.
- [x] 3.2 Modify `apps/portfolio/app/globals.css` to add default smooth scrolling and `prefers-reduced-motion` override for non-animated scroll.
- [x] 3.3 Modify `apps/portfolio/app/globals.css` to add section offset behavior (`scroll-margin`) so anchored sections are not visually clipped by fixed HUD layers.
- [x] 3.4 Modify `apps/portfolio/components/ui/CommandNav.tsx` and `apps/portfolio/components/ui/SectionDock.tsx` to ensure keyboard focus visibility and icon/link accessible names.

## Phase 4: Testing & Verification

- [x] 4.1 Create `apps/portfolio/lib/navigation.test.ts` for social filtering/order and smooth-vs-reduced-motion scroll behavior (spec: smooth navigation + missing socials).
- [x] 4.2 Create `apps/portfolio/components/ui/CommandNav.test.tsx` for semantic structure, `aria-current`, and social fallback rendering (spec: semantic + dynamic socials).
- [x] 4.3 Create `apps/portfolio/components/ui/SectionDock.test.tsx` for desktop active marker and smooth section selection behavior.
- [x] 4.4 Run `npm run test --workspace=apps/portfolio`, then `npm run lint --workspace=apps/portfolio` to validate typed integration.

## Phase 5: Final QA & Cleanup

- [x] 5.1 Manual QA on mobile and desktop: selecting nav sections performs smooth scroll without abrupt jumps.
- [x] 5.2 Manual a11y/SEO QA: tab order, visible focus, valid anchor hrefs, and safe external-link relationship attributes.

Evidence:
- `npm run qa:e2e --workspace=apps/portfolio -- --project="Desktop Chrome" --project="Mobile Chrome"` (includes smooth navigation, active markers, keyboard focus flow, responsive behavior)
- `npm run qa:lighthouse --workspace=apps/portfolio` (SEO/accessibility assertions)
