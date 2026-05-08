# Copilot Cloud Agent Instructions

## Repo overview
- Monorepo with npm workspaces and Turborepo.
- Apps: `apps/portfolio` (Next.js + Vitest + Storybook + Playwright), `apps/maestros-del-salmon` (Next.js).
- Packages: `packages/ui`, `packages/compliance`.

## Setup
- Use npm `10.33.0` (see `package.json` `packageManager`).
- Install dependencies from repo root: `npm install`.
- Optional env: `.env.example` includes `NEXT_PUBLIC_GTM_ID`.

## Common commands (run at repo root)
- `npm run dev` (turbo dev)
- `npm run lint` (tsc in both apps)
- `npm run typecheck`
- `npm run test` (Vitest in `apps/portfolio`)
- `npm run build` (builds both apps)
- `npm run storybook` / `npm run storybook:build` (portfolio)
- `npm run format` (Prettier)

## App-specific commands
- `apps/portfolio`: `npm run test`, `npm run qa:e2e`, `npm run qa:lighthouse`, `npm run qa:bundle`
- `apps/maestros-del-salmon`: `npm run lint`, `npm run build`

## Workflow & governance
- Issue-first: create an issue from templates and ensure it has `status:approved` before opening a PR.
- Branch naming must follow `type/description` (see `docs/standards/gitflow-semver-github-mcp.md`).
- PRs must use `.github/PULL_REQUEST_TEMPLATE.md`, select exactly one `type:*` label and one `semver:*` checkbox, and use conventional commits.
- Prefer GitHub MCP tools for issues/PRs/workflows per `docs/standards/gitflow-semver-github-mcp.md`.

## Reference docs
- `AGENTS.md` for global contribution rules.
- `docs/standards/gitflow-semver-github-mcp.md` for governance.
- `docs/strategies/semantic-seo.md` for semantic/SEO/A11y expectations.

## Validation status / known issues (2026-05-08)
- `npm run lint`: ✅
- `npm run test`: ✅ (stderr warnings about `planeGeometry` casing and `layout`/`whileInView` props on DOM elements)
- `npm run build`: ❌ in `apps/portfolio` due to Next.js font downloads failing (Inter, JetBrains Mono, Space Grotesk) from `fonts.googleapis.com`.
  - Workaround attempted: none (sandbox could not reach Google Fonts).
- `npm install`: ✅ but shows deprecation warnings and `npm audit` vulnerabilities.
