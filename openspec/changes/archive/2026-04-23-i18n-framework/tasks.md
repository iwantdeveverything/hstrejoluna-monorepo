# Tasks: i18n Framework (Issue #22) - STATUS: PENDING CI/MERGE

## Phase 1: Shared Infrastructure & Types
- [x] 1.1 Centralize Sanity types in `@hstrejoluna/types-sanity`.
- [x] 1.2 Setup `packages/i18n` to export dictionaries and shared config.
- [x] 1.3 Implement `getRequestConfig` in `apps/portfolio` and `apps/maestros-del-salmon`.

## Phase 2: Middleware & Routing
- [x] 2.1 Implement `next-intl` middleware (Proxy) in both apps.
- [x] 2.2 Configure browser-header and cookie-based detection logic.
- [x] 2.3 Migrate `apps/portfolio/app/*` to `apps/portfolio/app/[locale]/*`.

## Phase 3: CMS Alignment (Field-level translations)
- [x] 3.1 Extract `localizedString` and `localizedBlock` to a shared schema file.
- [x] 3.2 Update `skill.ts` schema to support localized fields.
- [x] 3.3 Updated all entity schemas.
- [ ] 3.4 Migrate existing Sanity data (Data Migration script created in scripts/i18n-migration.mjs).
- [x] 3.5 Use explicit GROQ projections in `page.tsx` (Regex helper removed after Judgment Day).

## Phase 4: UI Integration
- [x] 4.1 Implement `LocaleSwitcher` in navigation components.
- [x] 4.2 Update internal links using `next-intl/navigation` helpers.

## Phase 5: Technical Excellence (The "Mess" cleanup)
- [x] 5.1 Resolve a11y gaps (aria-labels, watermarks).
- [x] 5.2 Implement safe type guards (isValidLocale, isSanityBlock).
- [x] 5.3 Standardize Framer Motion to `m` (LazyMotion).
- [x] 5.4 Centralize external link properties.
- [x] 5.5 Fix Next.js 16 Proxy static analysis matcher.
- [x] 5.6 Resolve TSConfig deprecation loop.

## Phase 6: Delivery
- [ ] 6.1 Monitor CI for last push (0ccaf19).
- [ ] 6.2 Squash and merge PR #23.
