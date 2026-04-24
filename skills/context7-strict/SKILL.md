---
name: context7-strict
description: >
  ULTRA-STRICT rule to ALWAYS query Context7 for framework features, breaking changes, and configuration before implementing.
  Trigger: When starting a task involving a framework (e.g., Next.js, next-intl, React, etc.) or encountering build/compilation errors.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- BEFORE attempting to implement or fix any framework-specific configuration (e.g., Next.js routing, Vitest, middleware).
- BEFORE assuming a file convention is correct (e.g., `middleware.ts` vs `proxy.ts`).
- When encountering mysterious build, CI, or type errors related to a third-party library.
- When an API seems to have changed or deprecated.

## Critical Patterns

1. **NEVER ASSUME**: Your training data is outdated. If you are dealing with Next.js 15+, Next-Intl 3+, React 19+, or any modern tool, **you MUST NOT write code** until you verify the current approach.
2. **RESOLVE FIRST**: Always use `mcp_context7_resolve-library-id` to find the correct library ID. Use the exact official name (e.g., "Next.js", "Next Intl").
3. **QUERY DOCS SECOND**: Use `mcp_context7_query-docs` with the resolved ID to search for the specific problem or feature (e.g., "how to test next-intl middleware with vitest", "next.js middleware deprecated proxy").
4. **READ CAREFULLY**: The documentation from Context7 supersedes any prior knowledge. Follow its code examples strictly.

## The Middleware Incident (Context)

In Next.js 16, the `middleware.ts` file convention was deprecated and renamed to `proxy.ts`. Failing to query Context7 resulted in the AI applying an outdated `middleware.ts` file which caused a `404 Not Found` across the entire application and a deprecation warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.`

This skill was created to ensure this **never happens again**.

## Commands

```bash
# None. This is an agent behavioral skill. Use the Context7 MCP tools.
```

## Resources

- **Documentation**: Use the `mcp_context7_*` tools.
