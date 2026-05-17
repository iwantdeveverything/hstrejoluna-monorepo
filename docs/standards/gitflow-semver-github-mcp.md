# Gitflow, SemVer, and GitHub MCP Standard

## Purpose

Standardize delivery in this repository with:
- A Gitflow-compatible branching strategy
- Semantic Versioning (SemVer) release decisions
- MCP-first operations for issues, PRs, and workflows

## Branching Standard (Gitflow-Compatible)

### Long-lived branches

- `master`: production-ready branch; deploys from here.
- `develop`: integration branch for upcoming release work.

### Short-lived branches

Use one of these branch prefixes:
- `feat/`, `fix/`, `chore/`, `docs/`, `style/`, `refactor/`, `perf/`, `test/`, `build/`, `ci/`, `revert/`
- `feature/`, `bugfix/`, `hotfix/`, `release/`

Pattern:

```text
type/description
```

Examples:
- `feat/navigation-socials`
- `fix/certificates-active-state`
- `release/1.4.0`
- `hotfix/1.3.2-navbar-crash`

## Semantic Versioning Policy

Versioning follows SemVer `MAJOR.MINOR.PATCH`.

| Impact | When to use | Example |
|--------|-------------|---------|
| `semver:major` | Breaking API/contract behavior changes | Removing or renaming public API without backward compatibility |
| `semver:minor` | Backward-compatible new functionality | Adding new optional section, endpoint, or feature |
| `semver:patch` | Backward-compatible bug fix | Fixing behavior without changing contracts |
| `semver:none` | No runtime impact | Docs, comments, non-functional tooling-only updates |

Release tag format:

```text
vMAJOR.MINOR.PATCH
```

## GitHub MCP-First Operating Model

Preferred tool order for repository operations:

1. GitHub MCP tools (`github-create_issue`, `github-list_pull_requests`, `github-get_pull_request`, etc.)
2. `gh` CLI for operations not exposed directly in MCP
3. Direct REST calls only when needed

Minimum expected operations per change:
- PR creation and metadata management
- Workflow run visibility and status checks

## Context7 Documentation Basis

This standard aligns with Context7 documentation from:
- `/github/docs` (issue templates, PR templates, protected branches/rulesets)
- `/cli/cli` (GitHub CLI commands for issues, PRs, workflows, and API usage)

These references back:
- Issue form schema and template storage in `.github/ISSUE_TEMPLATE`
- PR template governance
- Rulesets/branch protection as enforcement mechanism
- `gh` command usage for operational workflows
