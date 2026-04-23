# domain-routing-and-tls Specification

## Purpose

Definir el comportamiento esperado para enrutar `hstrejoluna.com` y `www.hstrejoluna.com` hacia servicios en GCP con TLS administrado y corte controlado.

## Requirements

### Requirement: Canonical Domain Routing

The system MUST route apex/www hostnames to the production entrypoint and handle localized sub-paths consistently with SEO best practices.

#### Scenario: Successful hostname resolution

- GIVEN DNS records are configured in Name.com
- WHEN users resolve \`hstrejoluna.com\` or \`www.hstrejoluna.com\`
- THEN both hostnames MUST resolve to the intended GCP endpoint
- AND requests MUST reach the active production service

#### Scenario: Localized sub-path resolution

- GIVEN a user requests \`hstrejoluna.com/es\`
- WHEN the request reaches the GCP endpoint
- THEN the application MUST serve the Spanish entry point with correct locale headers.

### Requirement: Managed TLS Availability

The system MUST provide valid TLS certificates managed by Google for all public hostnames in scope.

#### Scenario: Valid HTTPS handshake

- GIVEN certificate provisioning has completed
- WHEN a client initiates HTTPS to apex or `www`
- THEN TLS negotiation MUST succeed with a valid certificate chain

#### Scenario: Certificate renewal continuity

- GIVEN certificates approach expiration
- WHEN Google-managed renewal runs
- THEN certificate rotation SHALL occur without manual downtime

### Requirement: Safe DNS Cutover and Rollback

The system MUST define an operational procedure for cutover verification and rollback to prior DNS targets.

#### Scenario: Controlled cutover verification

- GIVEN new DNS targets are prepared
- WHEN cutover is executed
- THEN verification steps MUST confirm routing and HTTPS before finalizing

#### Scenario: Rollback on incident

- GIVEN post-cutover service degradation is detected
- WHEN rollback is triggered
- THEN prior DNS records MUST be restorable with documented steps
- AND recovery time SHOULD be measurable in the runbook
