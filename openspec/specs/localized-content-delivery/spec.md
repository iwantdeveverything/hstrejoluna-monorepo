# localized-content-delivery Specification

## Purpose
Ensure Sanity CMS content is retrieved and rendered according to the requested locale.

## Requirements

### Requirement: Locale-Aware GROQ Fetching
The system MUST include a `locale` parameter in all CMS queries to retrieve the correct translation for field-level localized data.

#### Scenario: Fetching project details
- GIVEN a project document in Sanity with ES and EN descriptions
- WHEN the frontend fetches data for locale `es`
- THEN the query MUST return the Spanish description field.

### Requirement: Profile Document Localization
The system MUST support document-level internationalization for the `Profile` type to allow different biographical narratives per language.

#### Scenario: Profile rendering
- GIVEN a profile exists in both English and Spanish documents
- WHEN a user visits `/en`
- THEN the system MUST fetch the English profile document specifically.
