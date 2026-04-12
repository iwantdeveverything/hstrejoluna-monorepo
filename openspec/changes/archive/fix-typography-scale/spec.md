# Specification: Fix Typography Scale (SDD)

## 1. Overview
The portfolio titles currently fail to display at their intended cinematic scale because they apply CSS variables to the `color` property instead of `font-size`. This specification outlines the correct mapping of Tailwind v4 theme variables to component classes.

## 2. Requirements

### 2.1 CSS Utility Mapping
All typography defined in `globals.css` @theme block MUST be accessed via their shorthand utility classes, not arbitrary value syntax.

| Incorrect Syntax | Correct Utility |
| :--- | :--- |
| `text-[var(--text-fluid-hero)]` | `text-fluid-hero` |
| `text-[var(--text-fluid-h2)]` | `text-fluid-h2` |
| `text-[var(--text-fluid-h3)]` | `text-fluid-h3` |
| `text-[var(--text-fluid-h4)]` | `text-fluid-h4` |
| `text-[var(--text-label-sm)]` | `text-label-sm` |

### 2.2 Component Updates
The following components must be updated to follow the mapping in 2.1:
- `HudChip.tsx`: `text-[var(--text-label-sm)]` -> `text-label-sm`
- `SkillsFragment.tsx`: `text-[var(--text-fluid-hero)]` -> `text-fluid-hero`
- `ProjectFragment.tsx`: `text-[var(--text-fluid-h2)]` -> `text-fluid-h2`
- `ExperienceFragment.tsx`: `text-[var(--text-fluid-h2)]` -> `text-fluid-h2`
- `HeroFragment.tsx`: `text-[var(--text-fluid-hero)]` -> `text-fluid-hero`
- `ObsidianStream.tsx`: `text-[var(--text-fluid-hero)]` -> `text-fluid-hero`
- `PortfolioGrid.tsx`: `text-[var(--text-label-sm)]` -> `text-label-sm`

## 3. Scenarios
- **Scenario 1:** In the Hero section, the user's name should appear massive (up to 13rem) on desktop, scaling down to 3.5rem on mobile.
- **Scenario 2:** Project titles should be noticeably larger than descriptions, using the `text-fluid-h2` scale (`clamp(2.5rem, 8vw, 7rem)`).
- **Scenario 3:** Small metadata (labels) should consistently use the `text-label-sm` (0.75rem) scale without manual `var()` injection.

## 4. Dependencies
- Tailwind CSS v4 (confirmed active in `globals.css`).
