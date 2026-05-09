# Delta for liquid-glass-hero

## ADDED Requirements

### Requirement: First Paint Unblocked

The hero section SHALL render on first paint without any full-screen loading overlay that delays display of semantic content (h1, lead, CTAs). No boot sequence animation SHALL gate the hero's visibility.

The existing `<m.div>` fade-in on the content layer (opacity 0→1, ~0.5s) SHALL remain as the only entrance animation — it does not block the browser from painting the hero DOM.

#### Scenario: hero h1 is painted in first frame

- **Given** a request to `/en` or `/es`
- **When** the server response is received and the browser performs first paint
- **Then** the `<h1>` element SHALL be present in the DOM and visible (not `display:none`, not `visibility:hidden`, not `opacity:0`)
- **And** no full-screen overlay SHALL block the hero content
- **And** Lighthouse SHALL detect the h1 as the LCP candidate

#### Scenario: no overflow lock during load

- **Given** the portfolio page loads
- **When** the DOM is interactive
- **Then** `document.body.style.overflow` SHALL remain at its default value (not locked to `hidden`)
- **And** the user SHALL be able to scroll immediately

#### Scenario: env flag remains for rollback compatibility

- **Given** `NEXT_PUBLIC_SKIP_BOOT_SEQUENCE` is `"true"` at build time
- **When** the page renders
- **Then** the boot sequence SHALL NOT be rendered (no matrix rain canvas, no loading overlay)
- **And** the hero content SHALL render directly

### Requirement: CTA Accessible Name Match

The primary CTA link's computed accessible name SHALL include or match its visible text content. Lighthouse SHALL NOT flag a label/content mismatch on the hero CTA.

#### Scenario: CTA accessible name includes visible text

- **Given** the hero CTA displays "Explore my work" (en) or "Explorar mi trabajo" (es) as visible text
- **When** the accessible name is computed (via `aria-label` or text content)
- **Then** the accessible name SHALL contain the visible text string
- **And** an axe-core or Lighthouse accessibility scan SHALL report zero label/content mismatches on the CTA

#### Scenario: expanded descriptive label does not cause mismatch

- **Given** the CTA uses an `aria-label` that expands on the visible text (e.g., "Explore my work — View featured projects and case studies")
- **When** accessibility audit tools evaluate the link
- **Then** the computed accessible name SHALL still begin with or contain the visible text portion
- **And** the mismatch flag SHALL NOT fire
