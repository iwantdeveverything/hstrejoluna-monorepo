# Vertical Navigation HUD Specification

## Purpose

Defines a mobile-first portfolio navigation HUD with fluid mobile/desktop behavior, dynamic social links from Sanity, and strong semantic SEO/a11y guarantees.

## Requirements

### Requirement: Global Section Tracking

The system MUST track the active top-level section visible in the center fifty-percent of the viewport and share that state across all navigation surfaces.

#### Scenario: User scrolls down smoothly
- GIVEN the user is viewing the "hero" section
- WHEN the user scrolls down and the "projects" section occupies more than 50% of the viewport height
- THEN the active section state MUST update to "projects"
- AND all visible navigation controls MUST reflect the same active section

### Requirement: Mobile-First Navigation Menu

The system MUST provide a touch-first menu on mobile that exposes all primary section anchors and keeps one-handed interaction smooth.

#### Scenario: Mobile user opens the navigation menu
- GIVEN a viewport width < 1024px
- WHEN the user opens the primary navigation menu
- THEN the interface MUST show the complete ordered list of section links in a single vertical flow
- AND selecting one link MUST move focus and scroll smoothly to the target section

#### Scenario: Desktop layout does not duplicate mobile controls
- GIVEN a viewport width >= 1024px
- WHEN the page is rendered
- THEN mobile-only menu toggles MUST be hidden
- AND desktop navigation controls MUST remain visible and interactive

#### Scenario: Desktop section navigation is smooth
- GIVEN a viewport width >= 1024px
- WHEN the user selects a section through desktop navigation controls
- THEN the page MUST scroll smoothly to the target section
- AND the transition MUST avoid abrupt jumps

### Requirement: Dynamic Social Links from Sanity

The system MUST render social links from Sanity profile data and SHOULD support GitHub, LinkedIn, and email when configured.

#### Scenario: Sanity provides all social links
- GIVEN Sanity returns GitHub, LinkedIn, and email link records with URL and accessible label
- WHEN the navigation HUD is rendered
- THEN the three links MUST be visible as actionable anchors
- AND each link MUST open the configured destination without hardcoded fallback URLs

#### Scenario: Sanity omits one or more social links
- GIVEN one or more social records are missing or unpublished
- WHEN the navigation HUD is rendered
- THEN only available links MUST be displayed
- AND the menu MUST NOT render empty placeholders or broken actions

### Requirement: Semantic Navigation and Accessibility Compliance

The system MUST use semantic navigation landmarks and accessible link metadata so assistive technologies and crawlers can interpret structure and intent.

#### Scenario: Keyboard and screen-reader navigation
- GIVEN a keyboard-only or screen-reader user
- WHEN navigating through section links and social links
- THEN every actionable item MUST be reachable in a logical tab order with visible focus
- AND icon-only links MUST expose an accessible name

#### Scenario: Active section semantics
- GIVEN the current viewport is aligned with a section anchor
- WHEN the corresponding navigation item is rendered
- THEN that item MUST expose `aria-current` to identify the active location
- AND inactive items MUST remain distinguishable without relying on color alone

### Requirement: SEO-Friendly Link Markup

The system MUST expose section and social navigation actions as crawlable anchors with valid href targets and safe external-link semantics.

#### Scenario: Internal section anchors
- GIVEN section links target portfolio sections
- WHEN navigation is rendered
- THEN each section action MUST be an anchor with an href fragment to an existing section id
- AND each target section SHOULD remain semantically discoverable in document flow

#### Scenario: External social anchors
- GIVEN social links point to external profiles or email actions
- WHEN the user activates those links
- THEN each action MUST use an anchor with a valid absolute URL or `mailto:` scheme
- AND external HTTP links MUST declare safe relationship attributes

