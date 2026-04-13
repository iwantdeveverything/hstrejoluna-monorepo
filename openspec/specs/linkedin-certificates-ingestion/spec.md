# linkedin-certificates-ingestion Specification

## Purpose

Definir el comportamiento para extraer certificados desde LinkedIn via Apify y persistirlos en Sanity de forma idempotente.

## Requirements

### Requirement: Apify Certificate Extraction

The system MUST execute the Apify actor `dev_fusion/linkedin-profile-scraper` with configured profile URLs and consume only `certifications` data for certificate ingestion.

#### Scenario: Successful extraction from actor output

- GIVEN valid `APIFY_TOKEN` and `LINKEDIN_PROFILE_URL` configuration
- WHEN the ingestion flow runs and the actor returns a successful dataset item
- THEN the system MUST parse `certifications[]` from the first profile result
- AND the system SHALL ignore unrelated actor fields (for example contact enrichment data)

#### Scenario: Missing or empty certifications

- GIVEN the actor run succeeds but `certifications` is missing or empty
- WHEN ingestion mapping executes
- THEN the system MUST return an empty normalized certificate collection
- AND the system MUST NOT fail the run solely due to missing certifications

### Requirement: Certificate Normalization and Upsert

The system MUST normalize raw certification payloads to a stable certificate model and SHALL upsert records in Sanity without creating duplicates.

#### Scenario: Upsert by stable identity key

- GIVEN normalized certificate entries with identity candidates (for example `credentialId` or normalized `name+issuer`)
- WHEN persistence executes
- THEN the system MUST upsert existing documents by identity key
- AND the system SHALL create new documents only when no matching key exists

#### Scenario: Partial certificate data

- GIVEN a certificate without optional fields (for example missing expiry date or credential URL)
- WHEN normalization runs
- THEN the system MUST persist required fields when present
- AND the system SHOULD default optional missing fields to null-safe values

### Requirement: Fault Tolerance and Observability

The system SHOULD handle actor failures and malformed entries defensively while preserving operational visibility.

#### Scenario: Actor/API failure

- GIVEN Apify returns timeout, auth, or non-success run status
- WHEN ingestion is triggered
- THEN the system MUST fail with a structured error result
- AND the system SHALL avoid writing partial or inconsistent certificate documents

#### Scenario: Mixed valid and invalid certificate entries

- GIVEN actor output contains some malformed certificate objects
- WHEN normalization validates each entry
- THEN the system SHOULD skip invalid entries with warning metadata
- AND the system MUST continue processing valid certificate entries
