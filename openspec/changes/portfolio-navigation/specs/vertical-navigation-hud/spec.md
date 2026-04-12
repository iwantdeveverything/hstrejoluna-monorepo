# Vertical Navigation HUD Specification

## Purpose

Defines the requirements for the scrolling HUD navigation system, encompassing the bottom-fixed `CommandNav` and the desktop-only vertical timeline `SectionDock` powered by an `IntersectionObserver`.

## Requirements

### Requirement: Global Section Tracking

The system MUST track the active top-level section currently visible in the center fifty-percent of the viewport height.

#### Scenario: User scrolls down smoothly
- GIVEN the user is viewing the "hero" section
- WHEN the user scrolls down and the "projects" section occupies more than 50% of the viewport height
- THEN the active section state MUST update to "projects"

### Requirement: CommandNav Information Display

The system MUST display the active section title and a dynamic count of data entries specific to that section at the bottom of the screen.

#### Scenario: Displaying project counts
- GIVEN the active section is "projects" containing 4 repository objects
- WHEN the CommandNav renders
- THEN the label MUST display "PROJECTS [04]"
- AND it MUST glow with the primary kinetic style

### Requirement: SectionDock Context Timeline

The system SHOULD render a vertical dot timeline explicitly on desktop environments indicating the reading position mapping to sections.

#### Scenario: Desktop Navigation
- GIVEN a viewport width >= 1024px (lg breakpoint)
- WHEN traversing sections
- THEN the SectionDock MUST highlight the specific dot correlating to the `id` of the active section
- AND non-active dots MUST be visually diminished

#### Scenario: Mobile Visibility
- GIVEN a viewport width < 1024px
- WHEN examining the interface layout
- THEN the SectionDock MUST be hidden `hidden lg:flex` to maximize grid real-estate
