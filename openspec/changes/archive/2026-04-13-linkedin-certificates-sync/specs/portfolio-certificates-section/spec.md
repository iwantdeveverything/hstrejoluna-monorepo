# portfolio-certificates-section Specification

## Purpose

Definir la visualizacion de certificados dentro del portfolio stream y su integracion con navegacion por secciones.

## Requirements

### Requirement: Certificates Data Query

The system MUST fetch certificate documents from Sanity in the portfolio page data pipeline and provide them to the stream renderer.

#### Scenario: Certificates are available

- GIVEN certificate documents exist in Sanity
- WHEN the portfolio page server data loader executes
- THEN the system MUST include certificates in the page data payload
- AND the stream renderer SHALL receive certificates as a dedicated prop

#### Scenario: Certificates query returns no items

- GIVEN no certificate documents exist in Sanity
- WHEN the portfolio page loads
- THEN the system MUST render successfully without runtime errors
- AND the stream renderer SHALL receive an empty certificate list

### Requirement: Certificates Section Rendering

The system MUST render a `certificates` section in the stream and SHALL expose each certificate with title, issuer, issue metadata, and source link when available.

#### Scenario: Standard certificate card display

- GIVEN one or more certificates with display fields
- WHEN the certificates section is rendered
- THEN the system MUST show a card/list item per certificate
- AND each item MUST include a primary label and issuer context

#### Scenario: Missing link field on certificate

- GIVEN a certificate has no credential/source URL
- WHEN the certificate item is rendered
- THEN the system SHOULD display the item without link affordance
- AND the layout MUST remain visually consistent with linked items

### Requirement: Navigation and Active Section Integration

The system MUST include `certificates` in section tracking and section navigation elements used by the stream UX.

#### Scenario: Section navigation includes certificates

- GIVEN the stream navigation controls are rendered
- WHEN users inspect section links
- THEN the system MUST include a `#certificates` target in supported navigation components
- AND the active section indicator SHALL resolve correctly when certificates enters viewport

#### Scenario: Empty certificates state with navigability

- GIVEN certificates list is empty
- WHEN users navigate to `#certificates`
- THEN the system MUST render an empty-state block in that section
- AND navigation state MUST remain stable without broken anchors
