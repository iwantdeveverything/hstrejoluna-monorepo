# JSON-LD Safety Specification

## Purpose

Prevent XSS injection via `<script type="application/ld+json">` blocks by ensuring all JSON-LD output is sanitized before being rendered into the DOM.

## Requirements

### Requirement: Safe JSON-LD Serialization

The system MUST provide a shared `safeJsonLd()` utility that accepts a JSON-serializable value and returns a string safe for injection into `<script type="application/ld+json">`. The utility MUST escape all occurrences of `</` (closing script tag vectors) to `<\/` in the serialized output.

#### Scenario: Standard JSON-LD object

- GIVEN a JSON-LD object with no malicious content
- WHEN `safeJsonLd(object)` is called
- THEN it returns valid JSON identical in structure to `JSON.stringify(object)` with `</` sequences escaped

#### Scenario: Malicious payload in a field value

- GIVEN a JSON-LD object where a field contains `"</script><script>alert('xss')</script>"`
- WHEN `safeJsonLd(object)` is called
- THEN the output MUST NOT contain a literal `</script>` sequence
- AND the output MUST contain `<\/script>` instead

#### Scenario: Nested closing tags

- GIVEN a JSON-LD object with `</style>` or `</SCRIPT>` (case variations) in values
- WHEN `safeJsonLd(object)` is called
- THEN ALL `</` sequences MUST be escaped regardless of what follows

### Requirement: Universal JSON-LD Adoption

Every `<script type="application/ld+json">` block in the portfolio app MUST use `safeJsonLd()` for its `dangerouslySetInnerHTML.__html` value. Raw `JSON.stringify()` MUST NOT be used directly in any JSON-LD script tag.

#### Scenario: Home page JSON-LD

- GIVEN the home page at `app/[locale]/page.tsx`
- WHEN it renders JSON-LD for the Person schema
- THEN the `__html` value MUST be produced by `safeJsonLd()`

#### Scenario: Project page JSON-LD

- GIVEN the project detail page at `app/[locale]/projects/[slug]/page.tsx`
- WHEN it renders JSON-LD for the SoftwareSourceCode schema
- THEN the `__html` value MUST be produced by `safeJsonLd()`

#### Scenario: Breadcrumbs JSON-LD

- GIVEN the Breadcrumbs component
- WHEN it renders JSON-LD for the BreadcrumbList schema
- THEN the `__html` value MUST be produced by `safeJsonLd()`
