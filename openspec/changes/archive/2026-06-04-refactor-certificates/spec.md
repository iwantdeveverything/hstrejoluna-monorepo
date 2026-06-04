# Delta Spec: refactor-certificates

## Target Capabilities
- **`portfolio-certificates-section`** (Modified)
- **`linkedin-certificates-ingestion`** (Deprecated/Removed)

## Changed Requirements

### `portfolio-certificates-section`

The certificates section no longer relies on an internal `source` field (previously used to identify ingested vs. manually added certificates). All certificates are considered standard Sanity documents.

#### Requirement: Certificates Data Query
- **Update**: Data querying MUST NO LONGER filter or depend on the `source` field to conditionally render certificates.
- **Scenario: Certificates are available**: The system MUST include certificates directly from Sanity without external syncing requirements. The `source` field logic is removed from queries.

#### Requirement: Certificates Section Rendering
- **Update**: The stream UI components, TypeScript interfaces, and rendering logic MUST NO LONGER require or evaluate the `source` field.
- **Scenario: Standard certificate card display**: The certificate layout continues to display title, issuer, and issue metadata, but any visual or conditional logic based on `source` (e.g., distinguishing LinkedIn vs. Sanity source) MUST be removed.

### `linkedin-certificates-ingestion`

**Status**: Deprecated and Removed.

The capability to ingest certificates from LinkedIn via Apify has been fully deprecated. The system no longer requires automated external syncing.

#### Requirement Updates
- **Apify Certificate Extraction**: Removed. The system no longer executes the Apify actor `dev_fusion/linkedin-profile-scraper` for certificates.
- **Certificate Normalization and Upsert**: Removed. The system no longer normalizes or upserts scraped LinkedIn certificates.
- **Fault Tolerance and Observability (Ingestion)**: Removed. Handling actor failures and malformed Apify entries is no longer applicable.
