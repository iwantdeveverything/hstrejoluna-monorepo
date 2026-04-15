# Design: Portfolio Navigation Overhaul

## Technical Approach

Keep the current vertical architecture (`ObsidianStream` + `useActiveSection`) and evolve navigation into a unified semantic system: a mobile-first bottom navigation menu, desktop dock parity, dynamic social links from Sanity, and smooth section transitions. The implementation stays anchor-based for crawlability while adding controlled smooth scroll behavior and accessibility states (`aria-current`, focus management, landmark labels). This maps to `vertical-navigation-hud` and keeps `in-place-expansion-grids` unchanged.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Keep plain `href="#id"` jumps only | SEO-friendly but abrupt UX | **Reject** |
| JS-only custom scroll everywhere | Smooth control, but can reduce native anchor semantics | **Reject** |
| Anchor semantics + controlled smooth scroll helper + reduced-motion fallback | Best balance of SEO, UX, and A11y | **Adopt** |

| Option | Tradeoff | Decision |
|---|---|---|
| Hardcoded social links in component | Fast but not CMS-driven | **Reject** |
| Render raw `profile.socials` without normalization | Dynamic but unsafe/inconsistent labels | **Reject** |
| Normalize Sanity socials into strict nav links (`github`, `linkedin`, `email`) | Slight mapping complexity, predictable output | **Adopt** |

| Option | Tradeoff | Decision |
|---|---|---|
| Keep non-semantic wrappers (`div`) for nav controls | Easier styling, weaker SEO/A11y | **Reject** |
| Introduce semantic landmarks (`header`, `nav`, `ul`, labeled groups) | Minor refactor, stronger accessibility and crawlability | **Adopt** |

## Data Flow

### Navigation sequence

    User tap/click
      -> CommandNav / SectionDock link
      -> scrollToSection(targetId, prefersReducedMotion)
      -> browser scroll + hash update
      -> useActiveSection (IntersectionObserver)
      -> activeId state update
      -> CommandNav / SectionDock render aria-current styles

### Social links sequence

    Sanity profile.socials
      -> page.tsx fetch profile
      -> ObsidianStream(profile)
      -> normalizeSocialLinks(profile.socials)
      -> convert email plaintext to mailto when platform=email
      -> CommandNav social group
      -> semantic anchors (https/mailto) with safe rel attributes

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/portfolio/components/ui/CommandNav.tsx` | Modify | Convert to semantic mobile-first menu, add social links from Sanity, keyboard-safe controls, smooth section navigation. |
| `apps/portfolio/components/ui/SectionDock.tsx` | Modify | Add semantic `nav` labeling, `aria-current`, and shared smooth-scroll behavior. |
| `apps/portfolio/components/ObsidianStream.tsx` | Modify | Pass profile socials into nav layer and ensure landmarks remain consistent. |
| `apps/portfolio/lib/navigation.ts` | Create | Centralize section metadata, social link normalization, and smooth-scroll helper. |
| `apps/portfolio/lib/sections.ts` | Modify | Extend section definitions for labels/ordering consumed by nav components. |
| `apps/portfolio/types/sanity.ts` | Modify | Add explicit `ProfileSocialLink` contract with optional accessible label/order. |
| `apps/studio/schemaTypes/profile.ts` | Modify | Tighten `socials` schema (platform presets + accessible label + ordering). |
| `apps/portfolio/app/page.tsx` | Modify | Ensure main content landmark id for skip-link/focus destination and preserve JSON-LD `sameAs`. |
| `apps/portfolio/app/globals.css` | Modify | Add smooth-scroll and reduced-motion CSS behavior plus section offset support. |

## Interfaces / Contracts

```typescript
export interface ProfileSocialLink {
  platform: "github" | "linkedin" | "email" | string;
  url: string;
  label?: string;
  order?: number;
}

export interface NavigationSocialLink {
  kind: "github" | "linkedin" | "email";
  href: string;
  label: string;
  external: boolean;
}

export interface ScrollToSectionOptions {
  id: string;
  reducedMotion: boolean;
}
```

`normalizeSocialLinks()` MUST return only valid links and `scrollToSection()` MUST keep smooth behavior unless reduced motion is enabled.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Social normalization and scroll helper | Add Vitest tests for filtering/ordering, `mailto` handling, and reduced-motion behavior. |
| Integration | Semantic nav rendering | RTL tests for `aria-current`, mobile menu toggle, focusable links, and missing-social fallback. |
| E2E | Mobile + desktop navigation UX | Manual responsive QA: anchor smooth scroll, keyboard tab order, screen-reader labels, and reduced-motion mode. |

## Migration / Rollout

No destructive migration required. Existing `socials` entries continue to work; for `platform=email`, Sanity stores plain email and UI normalizes it to `mailto:`. Optional fields (`label`, `order`) can be backfilled gradually.

## Open Questions

- None.
