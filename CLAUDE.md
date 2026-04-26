# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

npm workspaces + Turborepo. Three apps, four shared packages.

| App | Stack | Port |
|-----|-------|------|
| `apps/portfolio` | Next.js 16, React 19, Sanity, next-intl, Tailwind, Framer Motion | 3000 |
| `apps/maestros-del-salmon` | Next.js 16, React 19, Sanity, next-intl, Tailwind | 3001 |
| `apps/studio` | Sanity v3 (document-internationalization) | 3333 |

| Package | Purpose |
|---------|---------|
| `packages/i18n` | Routing, locale helpers, JSON dictionaries (en, es). Default locale: `es` |
| `packages/ui` | Shared React components (ESM, peer: React 19 + Framer Motion) |
| `packages/compliance` | Legal/compliance utilities |
| `packages/types-sanity` | Sanity schema type definitions |

Portfolio proxies `/maestros-del-salmon/*` to the salmon app via `next.config.ts` rewrites (`SALMON_ORIGIN` env var).

## Commands

```bash
# Development
npm run dev                  # turbo dev (all apps)

# Build
npm run build                # portfolio + maestros-del-salmon

# Lint (typecheck only — no ESLint configured)
npm run lint                 # both apps
npm run typecheck            # explicit tsc --noEmit for both apps

# Tests (portfolio only)
npm run test                 # vitest run
npm run test --workspace=apps/portfolio -- --run path/to/file.test.ts  # single test file
npm run test --workspace=apps/portfolio -- --watch  # watch mode

# E2E (portfolio only — requires playwright browsers)
npm run qa:e2e --workspace=apps/portfolio
npm run qa:e2e:install --workspace=apps/portfolio   # install browsers first

# Storybook (portfolio only)
npm run storybook            # dev on port 6006

# Format
npm run format               # prettier on all ts/tsx/md
```

## Architecture

### Routing & i18n

Next.js App Router with `[locale]` dynamic segment. Locales: `en`, `es` (default: `es`). Locale prefix mode: `as-needed` — Spanish URLs have no prefix, English gets `/en/`.

i18n middleware lives in `apps/portfolio/proxy.ts` (not `middleware.ts` — renamed for Next.js 16 compatibility). It re-exports `next-intl/middleware` configured from `@hstrejoluna/i18n`.

Request config: `apps/portfolio/i18n/request.ts`. Dictionaries: `packages/i18n/src/locales/{en,es}.json`.

### Content (Sanity)

Sanity Studio (`apps/studio`) manages content with document-level i18n. Portfolio reads via `next-sanity` with `SANITY_API_READ_TOKEN`. Project ID: `73v5iufs`, dataset: `production`.

### Deployment

Both Next.js apps deploy to Google Cloud Run via `.github/workflows/cd-cloudrun.yml` on push to `master`. Multi-stage Docker builds (Node 20 Alpine), port 8080.

## Git Workflow

- **Base branch:** `master` (no `develop` — feature branches merge directly)
- **Branch naming:** `type/description` (e.g., `feat/navigation-socials`, `fix/auth-bug`)
- **Conventional commits** enforced by CI
- **Issue-first governance:** every PR must reference a `status:approved` issue via `Closes #N`
- **PR labels required:** exactly one `type:*` label + one `semver:*` checkbox
- CI validates all of the above in `.github/workflows/pr-governance.yml`

## Testing Strategy

Only `apps/portfolio` has a test suite:
- **Unit/Component:** Vitest + jsdom + Testing Library + jest-dom
- **E2E:** Playwright (Chrome, Firefox, Safari) against built app on port 4173
- **Visual:** Storybook with a11y addon
- **Performance:** Lighthouse CI (`lighthouserc.cjs`)
- **Full gate:** `npm run qa:gate` (lint → test → e2e → lighthouse)

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `SALMON_ORIGIN` | portfolio runtime | URL of maestros-del-salmon for proxy rewrites |
| `SANITY_API_READ_TOKEN` | portfolio runtime | Sanity read-only token (Cloud Run secret) |
| `SANITY_STUDIO_PROJECT_ID` | studio | Sanity project (default: `73v5iufs`) |
| `SANITY_STUDIO_DATASET` | studio | Sanity dataset (default: `production`) |

## Key Conventions

- TypeScript everywhere, avoid `any`. Strict mode is OFF in tsconfig.
- Path alias: `@/*` maps to app root in both Next.js apps.
- Shared packages are consumed via npm workspaces — `transpilePackages` in next.config for `@hstrejoluna/ui`.
- Strategies documented in `docs/strategies/semantic-seo.md` (landmarking, JSON-LD, a11y) and `docs/standards/gitflow-semver-github-mcp.md`.
