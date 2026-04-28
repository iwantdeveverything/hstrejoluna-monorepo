# Design: Portfolio Individual Project Pages

## Technical Approach

We will extend the Sanity `project` schema to support rich-text content and additional metadata. In the Next.js frontend, we will implement a new dynamic route `/[locale]/projects/[slug]` that fetches this data and renders a semantic, accessible page using Tailwind CSS (following the project's existing UI patterns). Navigation logic will be updated to link project cards in the home grid to these new internal pages.

## Architecture Decisions

### Decision: Semantic SEO and Schema.org Integration

**Choice**: Use `JSON-LD` with `SoftwareSourceCode` and `CreativeWork` types.
**Alternatives considered**: Microdata attributes or no structured data.
**Rationale**: `JSON-LD` is the recommended format by Google and schema.org for structured data. It's cleaner to manage in React than microdata and provides explicit signals to search engines about the nature of the portfolio work.

### Decision: Breadcrumb Implementation

**Choice**: Server-side breadcrumb generation using `next-intl` for translations.
**Alternatives considered**: Client-side breadcrumbs using `usePathname`.
**Rationale**: Server-side generation is better for SEO as it ensures the breadcrumbs are present in the initial HTML and follow schema.org's `BreadcrumbList` standard immediately.

### Decision: Navigation Logic Refactoring

**Choice**: Update `getProjectUrl` in `lib/navigation.ts` to return internal slugs by default.
**Alternatives considered**: Add a new `isCaseStudy` toggle in Sanity.
**Rationale**: Automating the link to internal pages provides a more consistent user experience. If a project lacks content, the internal page will serve as a technical summary and provide the link to the external source/demo.

## Data Flow

    Sanity (CMS) ──→ Next.js SSR (fetching by slug) ──→ Project Detail Component
                                                        │
                                                        ├── Breadcrumbs (Semantic HTML)
                                                        ├── Content (Portable Text)
                                                        └── JSON-LD (Script tag)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/studio/schemaTypes/project.ts` | Modify | Add `content`, `year`, `role`, and `media` (optional) fields. |
| `apps/portfolio/types/sanity.ts` | Modify | Extend `Project` interface with new fields. |
| `apps/portfolio/lib/navigation.ts` | Modify | Update `getProjectUrl` to prioritize `/projects/${slug.current}`. |
| `apps/portfolio/app/[locale]/projects/[slug]/page.tsx` | Create | New SSR page for project details. |
| `apps/portfolio/components/Breadcrumbs.tsx` | Create | New semantic breadcrumb component. |
| `apps/portfolio/messages/en.json` | Modify | Add translations for "Home", "Projects", "Visit Site", "Role", "Year". |
| `apps/portfolio/messages/es.json` | Modify | Add translations for "Inicio", "Proyectos", "Visitar Sitio", "Rol", "Año". |

## Interfaces / Contracts

```typescript
// Updated Project interface in apps/portfolio/types/sanity.ts
export interface Project {
  _id: string;
  title: string;
  slug?: { current: string };
  description: string | PortableTextBlock[]; // Summary
  content?: PortableTextBlock[]; // Detailed Case Study
  year?: string;
  role?: string;
  image?: SanityImage;
  techStack?: Skill[];
  micrositePath?: string;
  externalLink?: string;
  isFeatured?: boolean;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getProjectUrl` logic | Vitest: ensure it returns correct internal paths. |
| Integration | Page Rendering | Vitest + React Testing Library: check if breadcrumbs and content render correctly. |
| E2E | Navigation & SEO | Playwright: verify navigation from grid to project page and presence of `ld+json`. |

## Migration / Rollout

No data migration required as the new fields in Sanity are optional. Existing projects will simply have a "technical summary" page until long-form content is added.

## Open Questions

- [ ] Should we support a gallery of images/videos within the `content` or as a separate `media` array field in Sanity?
- [ ] Should the "external link" open in a new tab by default from the project page? (Assuming Yes).
