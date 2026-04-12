# Proposal: Fix Typography Scale (SDD)

## 1. Intent
Restore the cinematic typography scale of the portfolio by correctly applying Tailwind CSS v4 font-size utilities. This will ensure titles are significantly larger than body text as intended by the Dark Kinetic Design System.

## 2. Scope
Refactor 7 components to use idiomatic Tailwind v4 classes for theme-defined typography:
- Replace `text-[var(--text-fluid-hero)]` -> `text-fluid-hero`
- Replace `text-[var(--text-fluid-h2)]` -> `text-fluid-h2`
- Replace `text-[var(--text-fluid-h3)]` -> `text-fluid-h3`
- Replace `text-[var(--text-fluid-h4)]` -> `text-fluid-h4`
- Replace `text-[var(--text-label-sm)]` -> `text-label-sm`

## 3. Approach
1. **Surgical Replacement:** Iterate through the identified components and perform literal string replacements of the incorrect arbitrary value syntax.
2. **Global Verification:** Run a project-wide search to ensure no straggling `[var(...)]` typography classes remain.
3. **Type Check:** Ensure no JSX/TSX syntax was broken during the string replacements.

## 4. Risks & Mitigations
- **Risk:** Unintentional replacement of legitimate arbitrary values (e.g., specific pixel offsets).
- **Mitigation:** Only target variables prefixed with `--text-fluid` or `--text-label`, which are strictly for typography in this theme.
- **Risk:** Elements becoming "too big" and breaking mobile layouts.
- **Mitigation:** The `clamp()` functions in `globals.css` are already responsive; restoring them to the `font-size` property (via the correct utility) will simply activate the responsiveness already defined by the designer.
