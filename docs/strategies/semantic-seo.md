# Professional Semantic & SEO Strategy: The "Frontend Muscle" Initiative

**Project:** hstrejoluna-monorepo
**Document Version:** 1.0.0
**Status:** DRAFT (Architectural Proposal)
**Author:** Gemini CLI (Senior Architect)

## 1. Executive Summary
This document outlines the professional strategy for elevating the `hstrejoluna.com` portfolio hub and its microsites to world-class standards of **Semantic HTML**, **Search Engine Optimization (SEO)**, and **Web Accessibility (A11y)**. The goal is to ensure maximum discoverability, indexability, and inclusive usability by leveraging modern web standards and the Next.js/Sanity.io ecosystem.

---

## 2. Semantic Architecture (Landmarking & Hierarchy)
A professional frontend must "speak" clearly to both humans and crawlers. We will move beyond `div`-based layouts to a landmark-driven structure.

### 2.1 Structural Landmark Implementation
- **`<header>`**: Global site branding, navigation menus, and search (if applicable).
- **`<main>`**: Encapsulates the unique primary content of each page. Only one per page.
- **`<section>`**: Logical groupings within a page (e.g., "Featured Projects", "Skills Grid", "Experience Timeline").
- **`<article>`**: Used for self-contained content units like individual portfolio items, blog posts, or experience entries. This signals to crawlers that the content can be shared or indexed independently.
- **`<aside>`**: Secondary information like a personal bio sidebar or a table of contents.
- **`<footer>`**: Global footer containing copyright, social links, and privacy policy links.

### 2.2 Heading Hierarchy (`h1`-`h6`)
- Strict adherence to a non-skipping heading hierarchy.
- **`<h1>`**: Reserved for the page's primary title (e.g., "Héctor Trejo Luna | Frontend Engineer").
- **`<h2>`**: Main section headers.
- **`<h3>` - `<h6>`**: Nested subsections within articles or lists.

---

## 3. Dynamic SEO & Social Graph (Next.js Metadata API)
We will implement a data-driven SEO model where Sanity.io acts as the single source of truth for all metadata.

### 3.1 Sanity SEO Schema (`seo.ts`)
A reusable schema object to be embedded in `profile` and `project` documents:
- **`metaTitle`**: Optimized for search engine results pages (SERPs), keeping it within 50-60 characters.
- **`metaDescription`**: Compelling call-to-action description (150-160 characters).
- **`ogImage`**: Specific OpenGraph image (1200x630px) for high-impact social sharing.
- **`canonicalUrl`**: Explicitly defined canonical links to prevent duplicate content issues.
- **`keywords`**: Strategic tagging for long-tail search intent.

### 3.2 Next.js Integration
- Implementation of the `generateMetadata` function for all dynamic routes (`[slug]`).
- Comprehensive OpenGraph (`og:type`, `og:site_name`) and Twitter Card (`twitter:card: summary_large_image`) support.
- Modern Favicon set (SVG-first, with ICO fallbacks) and a valid `manifest.json` for PWA capabilities.

---

## 4. Structured Data (JSON-LD / Schema.org)
By injecting JSON-LD scripts, we provide explicit machine-readable context to search engines like Google and Bing.

- **`Person` Schema**: To be included on the primary Portfolio home page.
  - Attributes: `name`, `jobTitle`, `image`, `url`, `sameAs` (social links), `alumniOf`, `knowsAbout` (skills).
- **`SoftwareSourceCode` / `CreativeWork` Schema**: For individual projects.
  - Attributes: `name`, `description`, `codeRepository`, `programmingLanguage`, `genre` (web app, tool, etc.).
- **`BreadcrumbList`**: If the site structure deepens, ensuring clear navigation paths in SERPs.

---

## 5. Accessibility (A11y) & WCAG Compliance
Semantics and Accessibility are inseparable. Our goal is **WCAG 2.1 AA** compliance.

- **ARIA Attributes**: Proper use of `aria-label` for icon-only buttons (e.g., social links) and `aria-hidden` for decorative elements.
- **Keyboard Navigation**:
  - Focus indicators (`:focus-visible`) must be clear and high-contrast.
  - "Skip to Content" link at the top of the DOM.
- **Image Optimization**: Mandatory `alt` text for all non-decorative images; descriptive labels for project mockups.
- **Language Detection**: Dynamically setting the `lang` attribute in the `<html>` tag to match the content's primary language.

---

## 6. Technical SEO & Performance (Core Web Vitals)
Search ranking is now directly influenced by user experience metrics.

- **LCP (Largest Contentful Paint)**: Prioritizing critical images (Hero sections/Profile headshot) using the `priority` prop in `next/image`.
- **CLS (Cumulative Layout Shift)**: Ensuring the Bento Grid layout is stable during data hydration.
- **FID/INP (Interaction to Next Paint)**: Minimizing main-thread blocking during hydration.
- **Font Optimization**: Using `next/font` with `swap` display to prevent FOIT (Flash of Invisible Text).

---

## 7. Implementation Roadmap
1. **Sanity Update**: Add the `seo` schema and update existing document types.
2. **Layout Refactor**: Implement the Semantic Landmark structure in `apps/portfolio/app/layout.tsx`.
3. **Metadata Engine**: Build a centralized utility to map Sanity SEO data to Next.js Metadata objects.
4. **JSON-LD Component**: Create a reusable component to inject Schema.org scripts.
5. **Microsite Propagation**: Apply these patterns to `apps/maestros-del-salmon` to maintain consistency across the hub.

---

**Note:** This strategy is ready for implementation upon directive. All patterns are designed to be scalable and maintainable.
