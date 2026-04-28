# Project Case Studies Specification

## Purpose

Define the requirements for dedicated, SEO-optimized case study pages for portfolio projects, including structured data and localized content.

## Requirements

### Requirement: Case Study Page Accessibility

The system MUST provide a reachable URL at `/[locale]/projects/[slug]` for every project defined in Sanity with a valid slug.

#### Scenario: Navigating to a project page
- GIVEN a project with slug "obsidian-command"
- WHEN the user visits `/en/projects/obsidian-command`
- THEN the system MUST render the project detail page in English
- AND the status code MUST be 200

### Requirement: Case Study Breadcrumbs

Each project page MUST display a breadcrumb navigation showing the path from Home to the current Project.

#### Scenario: Breadcrumb hierarchy
- GIVEN the user is on the "Obsidian Command" project page
- WHEN the breadcrumbs are rendered
- THEN they MUST display "Home > Projects > Obsidian Command" (or localized equivalents)
- AND "Home" MUST link to the root page

### Requirement: Semantic SEO Metadata

The system MUST generate Schema.org `SoftwareSourceCode` or `CreativeWork` JSON-LD for each project page to improve search engine visibility.

#### Scenario: Validating Schema.org metadata
- GIVEN a project with title "My Project" and description "A cool app"
- WHEN the project page is crawled
- THEN the HTML MUST contain a `ld+json` script
- AND the `@type` MUST be `SoftwareSourceCode`
- AND the `name` MUST be "My Project"

### Requirement: Case Study Long-form Content

The system MUST render the `content` field from Sanity using Portable Text on the project detail page.

#### Scenario: Rendering case study content
- GIVEN a project has rich text in its `content` field
- WHEN the project page is rendered
- THEN the system MUST display the formatted content
- AND it MUST preserve links, lists, and headings from the Portable Text

### Requirement: Project Metadata Display

The project page MUST display additional metadata such as Year, Role, and the full Tech Stack.

#### Scenario: Viewing project details
- GIVEN a project with year "2026" and role "Lead Architect"
- WHEN the project page is rendered
- THEN it MUST explicitly show "2026" and "Lead Architect"
- AND it MUST list all associated skills from the `techStack`
