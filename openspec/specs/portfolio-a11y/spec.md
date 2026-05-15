# portfolio-a11y Specification

## Purpose

Define the accessibility fixes applied across the portfolio to resolve Lighthouse audit failures: color contrast violations, heading hierarchy gaps, and identical-link label issues.

## Requirements

### Requirement: WCAG AA Color Contrast

All text content in the portfolio SHALL meet WCAG 2.2 AA contrast ratio of at least 4.5:1 against its immediate background.

| Component                        | Current token             | Fixed token               | Expected ratio     |
| -------------------------------- | ------------------------- | ------------------------- | ------------------ |
| `LocaleSwitcher` language label  | `text-gray-500` (#6b7280) | `text-gray-300` (#d1d5db) | ≥ 4.5:1 on #17191c |
| `SkillsOverview` percentage text | `text-primary opacity-50` | `text-primary opacity-70` | ≥ 4.5:1 on #131313 |

#### Scenario: locale switcher language label passes contrast

- **Given** the locale switcher is rendered on the LiquidGlass dock background (#17191c)
- **When** contrast is measured for the language label text
- **Then** the ratio SHALL be ≥ 4.5:1
- **And** axe-core SHALL NOT report a color-contrast violation on the locale switcher

#### Scenario: skills percentage text passes contrast

- **Given** a skill card with percentage text is rendered on its background (#131313)
- **When** contrast is measured
- **Then** the ratio SHALL be ≥ 4.5:1
- **And** axe-core SHALL NOT report a color-contrast violation on skill percentages

### Requirement: Valid Heading Hierarchy

The document heading hierarchy SHALL NOT skip levels. Any text styled as a heading that is NOT semantically a section heading SHALL use a non-heading element (e.g., `<span>`).

#### Scenario: skills heading hierarchy is valid

- **Given** the Skills section has an `<h2>` section title
- **When** the heading hierarchy is inspected
- **Then** no `<h4>` element SHALL appear without an intervening `<h3>`
- **And** skill labels inside interactive elements SHALL use `<span>` (not `<h4>`)
- **And** Lighthouse SHALL NOT report "Heading elements are not in a sequentially-descending order"

#### Scenario: axe heading-order audit passes

- **Given** the full portfolio page DOM
- **When** axe-core runs the `heading-order` rule
- **Then** zero violations SHALL be reported

### Requirement: Differentiated Certificate Link Labels

Each "View Credential" link in `CertificatesPanel` SHALL have a unique accessible name that identifies the specific certificate. Identical link text pointing to different destinations SHALL NOT exist.

#### Scenario: certificate links have unique accessible names

- **Given** two or more certificates are rendered with credential URLs
- **When** the accessible names of their links are computed
- **Then** each link SHALL have a distinct accessible name (e.g., "View {certificateName} credential")
- **And** Lighthouse SHALL NOT report "Identical links go to different destinations"

#### Scenario: certificate without credential URL has no link

- **Given** a certificate has no `credentialUrl`
- **When** the certificate card is rendered
- **Then** no "View Credential" link SHALL appear for that certificate

#### Scenario: axe identical-links audit passes

- **Given** the certificates section is rendered with multiple certificates
- **When** axe-core or Lighthouse audits the page
- **Then** zero issues SHALL be reported for identical links pointing to different URLs
