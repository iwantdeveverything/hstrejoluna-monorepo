# Delta for Portfolio Grid Navigation

## MODIFIED Requirements

### Requirement: Portfolio Grid Project Links

(Previously: The system links to external projects or microsites directly from the grid.)

The system MUST link project cards in the grid to their internal case study pages at `/[locale]/projects/[slug]`.

#### Scenario: Clicking a project card
- GIVEN the user is on the home page grid
- WHEN they click the "Explore Project" or "Case Study" button of a project card
- THEN the system MUST navigate to the internal page `/projects/[slug]`
- AND the navigation MUST be handled by the internal router without full page reload

#### Scenario: Fallback for missing internal content
- GIVEN a project has no `content` but has an `externalLink`
- WHEN the user clicks the project card
- THEN the system SHOULD still navigate to the internal page to display the metadata and link the external site from there
- AND the project page MUST clearly display a link to the `externalLink` (e.g., "Visit Live Site")
