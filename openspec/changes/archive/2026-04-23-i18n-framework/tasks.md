# Tasks: i18n Framework (Issue #22)

## Phase 1: Shared Infrastructure & Types
- [x] 1.1 Centralize Sanity types in `@hstrejoluna/types-sanity`.
- [x] 1.2 Setup `packages/i18n` to export dictionaries and shared config.
- [x] 1.3 Implement `getRequestConfig` in `apps/portfolio` and `apps/maestros-del-salmon`.

## Phase 2: Middleware & Routing
- [x] 2.1 Implement `next-intl` middleware in both apps for locale detection.
- [x] 2.2 Configure browser-header and cookie-based detection logic.
- [x] 2.3 Migrate `apps/portfolio/app/*` to `apps/portfolio/app/[locale]/*`.

## Phase 3: CMS Alignment (Field-level translations)
- [x] 3.1 Extract `localizedString` and `localizedBlock` to a shared schema file.
- [x] 3.2 Update `skill.ts` schema to support localized fields.
- [x] 3.3 Updated `project.ts`, `experience.ts`, `certificate.ts` and `profile.ts` schemas.
- [ ] 3.4 Migrate existing Sanity data to the new translation structure (Data Migration).
- [x] 3.5 Use `localizeQuery` helper in `apps/portfolio/app/[locale]/page.tsx`.

## Phase 4: UI Integration
- [x] 4.1 Implement `LocaleSwitcher` in navigation components.
- [x] 4.2 Update internal links using `next-intl/navigation` helpers.

## Phase 5: Verification & QA
- [ ] 5.1 Verify SEO metadata (hreflang tags) in both languages.
- [ ] 5.2 Validate that `maestros-del-salmon` keeps its Spanish-first default.
