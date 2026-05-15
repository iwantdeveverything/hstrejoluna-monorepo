# security-headers Specification

## Purpose

Define the HTTP security headers applied globally to the portfolio application via Next.js `headers()` in `next.config.ts`, covering CSP, HSTS, COOP, frame control, content-type enforcement, and referrer policy.

## Requirements

### Requirement: Security Headers on All Routes

The application SHALL include the following response headers on every route matching `/(.*)`:

| Header                       | Value                                          |
| ---------------------------- | ---------------------------------------------- |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload` |
| `Cross-Origin-Opener-Policy` | `same-origin`                                  |
| `X-Frame-Options`            | `DENY`                                         |
| `X-Content-Type-Options`     | `nosniff`                                      |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`              |

The `Content-Security-Policy` header SHALL be deployed in report-only mode (`Content-Security-Policy-Report-Only`) during initial rollout and SHALL be switched to enforced (`Content-Security-Policy`) after verifying no production violations.

#### Scenario: all portfolio routes carry security headers

- **Given** a request to any path under `/en` or `/es`
- **When** the server responds
- **Then** the response SHALL include `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` headers
- **And** the response SHALL include either `Content-Security-Policy-Report-Only` (rollout phase) or `Content-Security-Policy` (enforced phase)

#### Scenario: HSTS preload-ready

- **Given** the portfolio app is served over HTTPS
- **When** the browser receives the response
- **Then** `Strict-Transport-Security` SHALL have `max-age=63072000` (2 years) and include the `preload` directive
- **And** the `includeSubDomains` directive SHALL be present

#### Scenario: frame embedding is blocked

- **Given** an external site attempts to embed the portfolio in an iframe
- **When** the browser enforces the headers
- **Then** `X-Frame-Options: DENY` SHALL prevent rendering in any frame
- **And** `frame-ancestors 'none'` in CSP SHALL provide an additional defense-in-depth layer

### Requirement: Content-Security-Policy Directives

The CSP SHALL allow the application's legitimate resource origins while blocking everything else:

| Directive         | Value                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `default-src`     | `'self'`                                                                                     |
| `script-src`      | `'self' 'unsafe-inline' https://www.googletagmanager.com`                                    |
| `style-src`       | `'self' 'unsafe-inline'`                                                                     |
| `img-src`         | `'self' https://cdn.sanity.io data:`                                                         |
| `font-src`        | `'self'`                                                                                     |
| `connect-src`     | `'self' https://www.google-analytics.com https://*.google-analytics.com https://*.sanity.io` |
| `frame-src`       | `https://www.googletagmanager.com`                                                           |
| `frame-ancestors` | `'none'`                                                                                     |
| `form-action`     | `'self'`                                                                                     |
| `base-uri`        | `'self'`                                                                                     |
| `object-src`      | `'none'`                                                                                     |

`'unsafe-inline'` on `script-src` and `style-src` SHALL be required for JSON-LD `dangerouslySetInnerHTML` scripts and Tailwind/Next.js CSS injection respectively.

#### Scenario: Sanity CDN images are allowed

- **Given** the page renders images sourced from `cdn.sanity.io`
- **When** the browser applies the CSP
- **Then** images from `https://cdn.sanity.io` SHALL load without CSP violation reports

#### Scenario: GTM scripts and analytics connections are allowed

- **Given** the page includes GTM `<script>` and GA `<noscript>` iframe
- **When** the browser evaluates the CSP
- **Then** scripts from `googletagmanager.com` SHALL execute
- **And** connections to `google-analytics.com` SHALL be permitted
- **And** GTM's noscript iframe SHALL load

#### Scenario: inline JSON-LD scripts are allowed

- **Given** the page includes JSON-LD structured data via `dangerouslySetInnerHTML`
- **When** the browser evaluates inline scripts
- **Then** `'unsafe-inline'` on `script-src` SHALL permit their execution

### Requirement: CSP Report-Only Rollout

The initial deployment SHALL use `Content-Security-Policy-Report-Only` to collect violation reports without blocking content. After at least 1 week of clean reports in production, the header SHALL be switched to enforced `Content-Security-Policy`.

#### Scenario: report-only mode does not block

- **Given** the header is `Content-Security-Policy-Report-Only`
- **When** a resource violates the policy
- **Then** the browser SHALL report the violation but SHALL NOT block the resource

#### Scenario: enforced mode blocks violations

- **Given** the header is switched to `Content-Security-Policy` (post-rollout)
- **When** a resource violates the policy
- **Then** the browser SHALL block the resource
- **And** a CSP violation SHALL appear in browser DevTools console
