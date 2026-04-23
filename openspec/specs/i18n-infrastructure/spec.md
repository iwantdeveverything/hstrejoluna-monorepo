# i18n-infrastructure Specification

## Purpose
Define the core routing, middleware, and dictionary management for multi-language support (ES/EN) across the ecosystem.

## Requirements

### Requirement: Localized Routing and Redirection
The system MUST handle dynamic locale segments in the URL and redirect non-localized requests based on user preferences.

#### Scenario: Direct localized access
- GIVEN the user navigates to `/es/projects`
- WHEN the request is processed
- THEN the system MUST render the Spanish version of the projects page.

#### Scenario: Automatic redirection from root
- GIVEN the user navigates to `/` (root)
- WHEN no locale cookie is present and browser header is Spanish
- THEN the system MUST redirect to `/es`.

### Requirement: Strongly-Typed Shared Dictionaries
The system MUST provide a central repository of translation keys available to all apps in the monorepo.

#### Scenario: Translation retrieval in RSC
- GIVEN a React Server Component in `apps/portfolio`
- WHEN it requests the `home.hero.title` key for locale `en`
- THEN it MUST receive the correct English string from the shared package.
