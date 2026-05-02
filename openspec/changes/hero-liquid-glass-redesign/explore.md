# Exploration: hero-liquid-glass-redesign

## User Intent
> "Quiero que te olvides de la actual primera sección de presentación y quiero que te vueles la cabeza pensando en una primera sección totalmente diferente y renovada en donde uno diga 'hay wey este cabrón sí sabe', todo basado en liquid glass y sus físicas como prioridad y bien pensado para SEO."

Translation: throw away the current hero. Build a "wow, this guy knows his stuff" hero with **liquid glass + real physics** as the design priority, AND engineered for SEO.

Non-negotiables:
1. Liquid-glass aesthetic with believable physics (refraction, distortion, fluid motion, parallax/cursor reactivity).
2. SEO-clean: SSR semantic content, single h1, JSON-LD compatible, LCP/INP healthy.

## Current State

### Files
- `apps/portfolio/components/fragments/HeroFragment.tsx` (240 lines, "use client") — current hero.
- `apps/portfolio/components/fragments/HeroFragment.test.tsx` — only asserts decorative `aria-hidden` isolation.
- `apps/portfolio/components/ObsidianStream.tsx:155-158` — wraps hero in `<section id="hero" class="stream-section">` inside `<main id="main-content">`.
- `apps/portfolio/app/[locale]/page.tsx:86-95` — emits `Person` JSON-LD with name, jobTitle (=headline), description (=bio), url, sameAs, knowsAbout.
- `apps/portfolio/app/[locale]/layout.tsx` — emits `Metadata` (title, description, OG, Twitter) at locale layout.
- `apps/portfolio/app/globals.css` — Tailwind v4 `@theme`, ember/void tokens, fluid type scale, body noise overlay, `stream-section` utility.
- `apps/portfolio/messages/en.json` (and `es.json`) — `hero.*` namespace.

### Component Tree (current)
```
section.stream-fragment (no h1, no header, just <section>)
├── div (radial mouse spotlight, hidden md:block)
├── div (grid overlay, aria-hidden)
├── motion.div (container, animated stagger)
│   ├── motion.div ("[SYSTEM_READY]: INITIALIZING_NEURAL_UPLINK" badge)
│   ├── motion.div (titleLines[] → GlitchText, NOT inside any h1)
│   └── motion.div (headline+subheadline glass card + CTA button)
├── TelemetryPanel (aria-hidden)
├── div COORDS readout (aria-hidden)
└── ScrollIndicator
```

### Critical SEO finding
**There is NO `<h1>` anywhere in `apps/portfolio`.** Confirmed via repo-wide grep. The hero displays "SYSTEM / ARCHITECT" via GlitchText spans inside divs. The page leans on `<title>` + JSON-LD only. This redesign MUST introduce a single semantic `<h1>` as the LCP candidate. This is an SEO regression that the redesign turns into an opportunity.

### i18n keys consumed
- `hero.titleLine1`, `hero.titleLine2`, `hero.headline`, `hero.subheadline`, `hero.cta`, `hero.telemetryLatency`, `hero.telemetryFramework`
- `brand.systemReady`, `brand.uplink`, `brand.descent`
- `profile.headline` (Sanity, falls back to `hero.headline`)

### SEO/metadata currently emitted
- Per-locale `<title>` and `<description>` via `generateMetadata` (page.tsx:28-67).
- OpenGraph + Twitter card.
- Canonical + hreflang alternates `/en`, `/es`.
- JSON-LD `Person` (page.tsx:86-102).
- `<header class="sr-only">` skip-content + nav landmarks.

### Dependencies / shared UI in use
- `framer-motion ^12.38.0` (LazyMotion+domAnimation).
- `next-intl ^4.9.1`.
- `@hstrejoluna/ui`: `GlitchText`, `BootSequence`, `useReducedMotion`, `GlassNav`, `HudChip`, `MicroInteraction`, `TelemetryHUD`, `CommandSurface`, etc.
- `@hstrejoluna/compliance` — consent-driven scripts.
- NO three.js, no @react-three/fiber, no ogl, no pixi, no canvas anywhere today.

## Design Tokens Available

### Color (globals.css + packages/ui/src/styles/tokens.css)
- Base: `--color-background #131313`, `--color-void #131313`.
- Surfaces ladder: `surface-container-lowest #0e0e0e` → `surface-bright #393939`.
- Brand: `--color-primary #ffb4a5` (= `--color-ember`), `--color-primary-container #ff5637`, `--color-tertiary #ffb693`.
- On-color: `--color-on-background #e2e2e2`, `--color-on-surface-variant #e9bcb3`.

### Typography
- Sans: Inter; Display: Space Grotesk; Mono: JetBrains Mono.
- Fluid scale: `--text-fluid-hero clamp(3.5rem, 15vw, 13rem)`, `-h2`, `-h3`, `-h4`, `--text-label-sm`.

### Existing glass / motion utilities
- `backdrop-blur-xl` already used.
- Body noise overlay (SVG turbulence, soft-light blend).
- `.grid-with-life` animated gradient utility.
- Glitch keyframes, scanlines, grid-pulse.
- `prefers-reduced-motion` already wired.
- NO SVG `<filter>` defs, NO Houdini paint, NO canvas/WebGL today.

## Liquid Glass Physics — Option Comparison

| Approach | Bundle (gz) | LCP risk | INP risk | A11y | SEO | Verdict |
|----------|-------------|----------|----------|------|-----|---------|
| **A. CSS-only**: SVG `feTurbulence`+`feDisplacementMap`+`feGaussianBlur`+`feColorMatrix` (gooey) under `backdrop-filter: blur()`, `mask-image`, conic gradients, CSS custom props for cursor (`--mx`, `--my`) | ~0 KB JS extra | None | Low | Excellent | Excellent | **Strong default**. Apple liquid-glass look reproducible at zero JS. |
| **B. WebGL via r3f** + `MeshTransmissionMaterial` for refraction + raymarched SDF blobs | +180–250 KB gz | High if canvas is LCP | Medium | Reduced-motion fallback needed | Neutral if behind SSR text | Heavy. Reserve for hover/idle, not above-fold paint. |
| **C. Hybrid (RECOMMENDED)**: SSR semantic markup paints first (h1, p, CTA, JSON-LD). Below text: layered SVG goo + CSS glass + cursor-reactive blobs (option A) ALWAYS visible. Optional WebGL refraction lazy-mounted via `requestIdleCallback` + IntersectionObserver, gated by `prefers-reduced-motion: no-preference` AND `hardwareConcurrency >= 4` AND `(min-width: 1024px)`. | +0 KB initial / +180 KB lazy on capable devices | None | Low | Reduced-motion gets static A; no-WebGL gets A | Excellent | **Recommended**. |
| **D. OGL** (~12 KB gz) + custom GLSL fragment shader (refraction + Voronoi + noise) | +12–20 KB gz | Low if lazy | Low | Same as B | Same as B | Lighter alt to B. Plan-B inside hybrid. |
| **E. Canvas 2D metaballs** (marching squares or `globalCompositeOperation: 'difference'`) | +5 KB gz | Low | Medium (CPU) | Same | Same | Skip — option A dominates. |

### Why CSS goo + backdrop-filter rivals WebGL
Apple's "Liquid Glass" (iOS 18 / visionOS) is mostly:
- Translucent volumes with `backdrop-filter: blur()` + saturation + brightness.
- Edge highlights via animated conic gradients.
- Subtle refraction approximated via SVG `feDisplacementMap` driven by `feTurbulence`.
- Specular sheen via animated radial gradient masked to glass shape.
- Composited over a slowly-drifting backdrop (radial blobs).

This stack reproduces ~90% of the perceptual effect at 0 KB JS, runs at 60–120 fps on mid-range mobile, and never blocks LCP. WebGL refraction adds the last 10%, worthwhile only on capable hardware.

### Library candidates (proposal phase decides; DO NOT install yet)
- **Already in repo**: `framer-motion` (entrance + stagger only).
- **CSS-only stack**: zero new deps. SVG `<filter>` defs inline, CSS custom props for cursor.
- **Optional WebGL**: `@react-three/fiber` + `@react-three/drei` (MeshTransmissionMaterial) OR `ogl` (~12 KB) + hand-written fragment shader. `lygia` shader chunks (`refract`, `fbm`, `voronoi`).
- **Per-character text physics** (optional): Splitting via `Intl.Segmenter` + `motion.span` per grapheme.

## SEO Constraints (mandatory)

### MUST
1. **Single `<h1>`** in the hero, plain text (NOT inside canvas, NOT inside SVG `<text>`). Currently absent — fixing it is part of this change.
2. **Semantic landmark**: `<section aria-labelledby="hero-title">`. The hero must have `aria-labelledby` pointing at the h1.
3. **First meaningful paragraph** in SSR HTML — describes role, value prop, primary keyword cluster ("Senior Software Architect", "frontend engineer", "scalable ecosystems").
4. **CTA with descriptive anchor text** — pair with meaningful `aria-label`.
5. **LCP candidate must be the h1 text**, not a canvas. Canvas mounts after first paint via `useEffect` + `requestIdleCallback`.
6. **JSON-LD compatibility**: `Person` schema already in page.tsx — extend with `image`, `jobTitle`, `mainEntityOfPage` as needed.
7. **next-intl translatable**: every visible string in the hero MUST come from `messages/{locale}.json`.
8. **Reduced-motion fallback**: `useReducedMotion()` available from `@hstrejoluna/ui`. Static gradient + frozen blobs when `true`.
9. **Hreflang + canonical** already set at page level.
10. **Heading order**: hero h1 → next sections start at h2.

### MUST NOT
- No text rendered inside `<canvas>` or `<svg><text>` for SEO copy.
- No CSS `display: none` on the h1.
- No 100vh hero image as LCP at the cost of TBT.
- No hydration-suspended hero — must be in initial SSR HTML.

## Recommended Direction

**Hybrid architecture (option C)**:

1. **Server Component shell** (`HeroSection.tsx`, RSC, no `"use client"`):
   - `<section id="hero" aria-labelledby="hero-title">`
   - `<p>` overline (eyebrow text, mono badge, translatable)
   - `<h1 id="hero-title">` with two visible spans (one solid, one outlined/ghosted), no `aria-hidden` on visible text
   - `<p class="lead">` headline + subheadline (LCP candidate)
   - `<a href="#projects">` primary CTA + descriptive `aria-label`
   - `<a>` secondary CTA (LinkedIn/GitHub) — boosts E-E-A-T
   - JSON-LD remains at page level.
2. **Liquid-glass backdrop layer** (`LiquidGlassCanvas.tsx`, client, `aria-hidden`):
   - SSR-safe CSS-only base: 3 animated radial-gradient blobs drifting via CSS keyframes, modulated by cursor via `--mx/--my` (rAF-throttled).
   - SVG `<filter>` def with `feTurbulence` + `feDisplacementMap` applied as `filter: url(#liquid-goo)` for gooey edges.
   - Foreground glass card uses `backdrop-filter: blur(24px) saturate(180%) brightness(1.1)`, conic-gradient highlight border, animated specular sweep on hover.
3. **Progressive WebGL layer** (`LiquidGlassWebGL.tsx`, lazy `next/dynamic` `{ ssr: false }`):
   - Mounted only when ALL: `useReducedMotion() === false`, `(min-width: 1024px)`, `hardwareConcurrency >= 4`, in viewport.
   - Fragment shader: refraction (sample pre-rendered gradient texture) + chromatic aberration on edges + Voronoi cells + slow noise.
   - Uses `ogl` (~12 KB) over r3f for tight budget. r3f acceptable if team prefers ergonomics (~150 KB extra).
   - Hidden BEHIND the glass card (z-index discipline) so text never sits over noisy WebGL.
4. **Cursor-reactive physics**: single `pointermove` listener at section level updates CSS vars `--mx`, `--my`, `--vx`, `--vy` on rAF. Zero React rerenders.
5. **Entrance choreography**: `framer-motion` `LazyMotion`+`domAnimation` staggers eyebrow → h1 char-by-char → lead → CTAs. Reduced-motion → fade-in only.

### Fallback (if WebGL ships nothing)
The CSS-only base IS the production hero. WebGL is purely additive. Phase 1 (CSS) ships, Phase 2 (WebGL) follows behind a flag.

## Open Questions for the User (≤ 3)

1. **Bundle budget**: OK with +180 KB gz for r3f WebGL (gated to capable desktops only), or strictly cap and use `ogl` ~12 KB hand-written shader?
2. **Copy direction**: keep "SYSTEM / ARCHITECT" + "INITIATE SEQUENCE" cyberpunk voice, or pivot to SEO-friendly h1 like "Héctor Trejo Luna — Senior Frontend Architect" with kinetic vibe in visuals only? (Recommendation: pivot — SEO needs name + keyword in h1.)
3. **Scope of "physics"**: cursor-reactive blobs + refraction is in scope. Add scroll-driven distortion (parallax warp) and entrance-burst splash, or keep idle-elegant?

## Risks
- **Bundle weight** — only if option B/D ship; mitigated by lazy + capability gate.
- **Hydration mismatch** — backdrop CSS vars must initialize inside `useEffect`. Strict client/server boundary documented in proposal.
- **Mobile GPU heat / battery** — WebGL disabled on mobile. CSS layer uses `transform`/`opacity` only.
- **`backdrop-filter` browser support** — Safari/Chrome/Firefox 103+ OK; need fallback `background: rgba(...)` for older browsers.
- **Contrast over fluid background** — WCAG 2.2 AA 4.5:1. Glass card needs sufficiently opaque tinted backdrop layer behind h1+p. Verify with axe + manual contrast.
- **SEO regression** — currently NO h1 exists; this redesign FIXES it. Risk reversed: SEO win.
- **Motion sickness** — `prefers-reduced-motion` strictly honored. Parallax ≤ ±5 px when reduced.
- **Test churn** — `HeroFragment.test.tsx` will break. New name (`HeroSection`?) needs fresh suite. Vitest + Storybook + Playwright a11y in scope.
- **i18n coverage** — new copy in en.json AND es.json simultaneously. `messages/en.test.ts` enforces parity.
- **Sanity profile dependency** — keep `profile?.headline` fallback so CMS edits flow.

## Affected Modules
- `apps/portfolio/components/fragments/HeroFragment.tsx` — REPLACE (or rename to `HeroSection.tsx`).
- `apps/portfolio/components/fragments/HeroFragment.test.tsx` — REWRITE.
- `apps/portfolio/components/ObsidianStream.tsx` — update import + `<section id="hero">` wrapper.
- `apps/portfolio/messages/en.json`, `messages/es.json` — new `hero.*` keys; deprecate old after migration.
- `apps/portfolio/messages/en.test.ts`, `es.test.ts` — parity assertions.
- `apps/portfolio/app/globals.css` — `@layer utilities` for `.liquid-glass`, `.glass-card`, SVG goo filter rule.
- `apps/portfolio/app/[locale]/page.tsx` — extend `Person` JSON-LD with `image` and `mainEntityOfPage` if proposal decides.
- `packages/ui/src/components/LiquidGlassCanvas.tsx` (NEW) — shared backdrop primitive.
- `packages/ui/src/components/LiquidGlassWebGL.tsx` (NEW, optional Phase 2).
- `packages/ui/src/index.ts` — re-export.
- `apps/portfolio/e2e/` — new Playwright spec asserting h1, `aria-labelledby`, reduced-motion, Lighthouse SEO ≥ 95.
- `apps/portfolio/lighthouserc.cjs` — verify thresholds.
- Storybook: stories for new components.

## Skill Resolution
context7-strict was injected. No library-specific code written here. If proposal commits to r3f/drei/ogl/lygia, the proposal phase MUST resolve library IDs and query Context7 for current API before any apply phase touches code.
