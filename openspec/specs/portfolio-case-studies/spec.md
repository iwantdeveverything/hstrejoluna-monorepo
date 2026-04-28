# Spec: Portfolio Case Studies (Individual Project Pages)

## Overview
Individual, SEO-optimized pages for each project in the portfolio, allowing for detailed technical case studies and better semantic structure.

## Requirements

### R1: Dynamic Internal Routing
- Projects MUST be reachable via `/[locale]/projects/[slug]`.
- Routes MUST be statically generated at build time using `generateStaticParams`.
- Params in Next.js 16 MUST be handled as Promises.

### R2: Semantic Navigation & Breadcrumbs
- Pages MUST include a semantic breadcrumb navigation (`Home > Projects > [Title]`).
- Breadcrumbs MUST include JSON-LD `BreadcrumbList` for search engines.

### R3: Structured Data (SEO)
- Each page MUST inject JSON-LD structured data using `SoftwareSourceCode` and `CreativeWork` types.
- Metadata MUST be localized using `next-intl`.

### R4: Sanity Integration
- The `project` schema MUST include `content` (Portable Text), `year`, `role`, and `gallery`.
- Images MUST include hotspot support and localized ALT text.

## Architecture Decisions
- **SSG by Default**: All project pages are pre-rendered for maximum performance.
- **Hybrid Link Logic**: `getProjectUrl` prioritizes internal slugs but falls back to microsites or external links if a slug is missing.
- **Shared Components**: Uses `TelemetryHUD` from `@hstrejoluna/ui` for technical metadata consistency.
