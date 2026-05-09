# performance-caching Specification

## Purpose

Define the performance and caching behavior for the portfolio application: ISR page revalidation, BFCache compatibility, modern JavaScript compilation target, and browser targeting via browserslist.

## Requirements

### Requirement: ISR Page Revalidation

The portfolio page SHALL use Incremental Static Regeneration (ISR) with a revalidation interval of 60 seconds. The page SHALL NOT use `force-dynamic` mode.

The response SHALL carry `Cache-Control: public, max-age=60, must-revalidate`, enabling ISR caching and BFCache.

#### Scenario: page is ISR-cached

- **Given** a request to the portfolio page
- **When** the server responds
- **Then** the `Cache-Control` header SHALL be `public, max-age=60, must-revalidate`
- **And** the page SHALL NOT return `Cache-Control: no-store` or `private, no-cache`

#### Scenario: stale content is revalidated

- **Given** Sanity content has changed and ≥ 60 seconds have elapsed since last build/deploy
- **When** the next request arrives
- **Then** the server SHALL trigger background revalidation
- **And** the next request after revalidation completes SHALL receive fresh Sanity data

#### Scenario: BFCache is enabled

- **Given** the user navigates away from the portfolio page
- **When** the user returns via browser back/forward navigation
- **Then** the page SHALL be served from BFCache (instant restore)
- **And** Lighthouse SHALL NOT report "Page prevented back/forward cache restoration"

### Requirement: Modern JavaScript Compilation Target

TypeScript compilation SHALL target `ES2020` to eliminate legacy polyfills for obsolete browser engines. The `tsconfig.json` `compilerOptions.target` SHALL be set to `"ES2020"`.

#### Scenario: ES2020 features are emitted natively

- **Given** the source uses `Array.prototype.at`, `Object.fromEntries`, or `Object.hasOwn`
- **When** the build produces the output bundle
- **Then** these features SHALL NOT be transpiled to ES2017-compatible polyfills
- **And** the bundle SHALL use native `??` (nullish coalescing) and `?.` (optional chaining) directly

#### Scenario: legacy polyfill detection

- **Given** the production build targets `ES2020`
- **When** the output JavaScript is inspected
- **Then** core-js or tslib polyfills for `Array.prototype.flat`/`flatMap` SHALL NOT be present
- **And** the main JS bundle SHALL be at least 10 KB smaller (gzipped) than the ES2017 baseline

### Requirement: Browser Targeting via Browserslist

A `.browserslistrc` file at the repository root SHALL define the supported browser matrix. The configuration SHALL target: `defaults, Chrome >= 90, Firefox >= 90, Safari >= 15`.

#### Scenario: build respects browserslist

- **Given** `.browserslistrc` exists with modern browser targets
- **When** `npm run build` executes for `apps/portfolio`
- **Then** Next.js SHALL use the browserslist configuration to determine JS/CSS compilation targets
- **And** vendor prefixes and polyfills SHALL only be emitted for browsers matching the query

#### Scenario: unsupported browsers receive usable fallback

- **Given** a browser older than the targets visits the site
- **When** the page loads
- **Then** the browser SHALL either render the page (with possible degraded styling) or display a browser-upgrade message
- **And** the page SHALL NOT crash with uncaught syntax errors

### Requirement: Build Verification

CI SHALL verify that the bundle size reduction from dropped polyfills meets the ≥10 KB gzipped threshold and that Lighthouse Performance scores ≥ 90 after all changes.

#### Scenario: bundle size regression gate

- **Given** a PR modifies the compilation target or dependencies
- **When** CI runs `qa:gate`
- **Then** if the main JS bundle delta exceeds the ES2017 baseline by more than +5 KB gz, the gate SHALL fail

#### Scenario: Lighthouse performance threshold

- **Given** all performance fixes are applied (ISR, ES2020, no boot sequence)
- **When** `qa:lighthouse` runs against the production build on a mobile profile
- **Then** the Performance score SHALL be ≥ 90
- **And** NO_LCP SHALL NOT appear as a diagnostic
