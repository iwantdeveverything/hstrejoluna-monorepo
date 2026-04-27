# Change Proposal: Initialize Dynamic CMS and Portfolio Hub
**Status:** PROPOSED
**Author:** hstrejoluna
**Date:** 2026-04-04

## 1. Context & Rationale
The user wants to build a developer portfolio hub (`hstrejoluna.com`) that acts as a central repository for their resume and projects. They also need to host specialized microsites (like `maestros-del-salmon`) at sub-paths. To manage this data dynamically, a Headless CMS is required to avoid hardcoding resume and project details.

## 2. Proposed Architecture
- **CMS:** Sanity.io (selected for its schema-first approach and ease of integration into monorepos).
- **Monorepo Structure:**
  - `apps/portfolio`: Hub (Next.js).
  - `apps/maestros-del-salmon`: Microsite (Next.js).
  - `apps/studio`: Sanity CMS Dashboard (embedded).
  - `packages/ui-kit`: Shared design system.

## 3. LinkedIn-Based Content Model (Resume)
We will model the CMS to match the LinkedIn profile data:
- **Profile:** Bio, Headshot, Socials.
- **Experience:** Company, Role, Dates, Key Achievements.
- **Projects:** Title, Description, Tech Stack, Links, Microsite Path (e.g., `/maestros-del-salmon`).
- **Skills:** Categorized (Frontend, Backend, Tracking/Analytics).

## 4. UX/UI Design Trends & Principles
To ensure the portfolio and its microsites feel modern, premium, and highly engaging, we will adhere to the following top UX/UI trends:
- **Bento Box Grids:** Use clean, compartmentalized grid layouts (Bento design) to present skills, projects, and experience data in easily digestible blocks.
- **Micro-interactions & Framer Motion:** Add subtle scroll animations, hover states, and smooth page transitions to make the site feel "alive" without overwhelming the user.
- **Dark Mode by Default (with Toggle):** A sleek, high-contrast dark theme using the brand colors (marine, sand, salmon), providing a premium developer aesthetic.
- **Glassmorphism:** Use subtle frosted glass effects on navigation bars, modal overlays, and project cards to create depth.
- **Typography-Driven Hierarchy:** Bold, oversized typography for headings (e.g., using Inter or a specialized sans-serif) to make clear, confident statements.
- **Minimalist Data Visualization:** For skills and analytics, use clean charts or progress bars instead of raw text.

## 5. Implementation Strategy (Phase 1)
1. **Initialize `apps/studio`:** Set up Sanity.io.
2. **Define Schema:** Create schemas for `profile`, `experience`, `project`.
3. **Connect Portfolio:** Fetch data from Sanity to `apps/portfolio`.
4. **Deploy:** Configure sub-path routing for the CMS and microsites.

## 6. Rollback Plan
If CMS integration fails, we will fallback to local JSON data in each app until the connection is resolved.
