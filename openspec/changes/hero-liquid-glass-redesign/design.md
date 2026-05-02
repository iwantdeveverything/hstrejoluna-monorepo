# Design: hero-liquid-glass-redesign

> Architecture phase. This document closes the HOW at structural level. Tasks (the WHAT-to-do steps) come next.
> Every external API claim that would normally require Context7 verification is marked **[CTX7-DEFERRED]** with the assumption it forces and the mitigation if it turns out wrong. See §13.

---

## 1. Architecture Overview

Three concentric layers, each with a single responsibility and a strict boundary:

```
┌────────────────────────── RSC LAYER (server) ─────────────────────────────┐
│ HeroSection.tsx                                                           │
│   <section aria-labelledby="hero-title">                                  │
│     <p class="eyebrow">{t.eyebrow}</p>                                    │
│     <h1 id="hero-title">Héctor Trejo Luna — Senior Software Architect</h1>│
│     <p class="lead">{profile.headline ?? t.lead}</p>                      │
│     <a class="cta-primary">{t.cta}</a>                                    │
│     <a class="cta-secondary">{t.secondaryLabel}</a>                       │
│     <HeroVisualLayer profile={...} flagOn={...}/>   ← single client entry │
│   </section>                                                              │
│   ▶ Zero JS shipped for the text. h1 is the LCP candidate.                │
└────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────── CLIENT BOUNDARY (eager) ───────────────────────────┐
│ HeroVisualLayer.tsx  ("use client")                                       │
│   • Calls useHeroMotionPreferences() ONCE                                 │
│   • Branches: "static" → render nothing visual                            │
│                "css-only" → <LiquidGlassBackdrop/>                        │
│                "css+webgl" → <LiquidGlassBackdrop/> + <LiquidGlassWebGL/> │
│   • Owns the section ref forwarded to useScroll + IntersectionObserver    │
│   • Mounts the cursor controller (singleton ref store)                    │
└────────────────────────────────────────────────────────────────────────────┘
                  │                                  │
                  ▼                                  ▼
┌─────────────────────────┐         ┌──────────────────────────────────────┐
│ LiquidGlassBackdrop     │         │ LiquidGlassWebGL                     │
│ "use client", aria-hidden│        │ next/dynamic({ ssr: false })          │
│ • SVG goo <defs>        │         │ aria-hidden                          │
│ • 3 animated blobs      │         │ • <Canvas dpr=[1,1.5] frameloop=demand>│
│ • backdrop-filter card  │         │   <Plane><MeshTransmissionMaterial/> │
│ • reads --mx/--my CSS   │         │ • useFrame reads ref store directly  │
│   vars                  │         │ • uniforms: uTime,uMx,uMy,uScroll,   │
│                         │         │   uBurst                             │
└─────────────────────────┘         └──────────────────────────────────────┘
                  ▲                                  ▲
                  └────────── pointer ref store ─────┘
                              (single rAF source)
```

**Boundary rules**:
- The RSC layer never imports anything from `react-three/*` or `framer-motion` (those have `"use client"` somewhere in their tree and would taint the RSC).
- `HeroVisualLayer` is the **only** client island the RSC renders. All client-only logic descends from it. This keeps the RSC tree analyzable and the bundle attribution clean.
- The WebGL chunk is only fetched after `HeroVisualLayer` decides the profile is `"css+webgl"` AND the section is in viewport (IntersectionObserver `threshold: 0.1`) AND `requestIdleCallback` fires. Three gates, in this order.

---

## 2. Component Tree (final)

```
HeroSection.tsx                     [RSC, server-only]
└── HeroVisualLayer.tsx             [client, eager]
    ├── LiquidGlassBackdrop.tsx     [client, eager, "use client"]
    │   ├── <svg><defs><filter id="liquid-goo">…</filter></defs></svg>
    │   ├── .blob.blob-1
    │   ├── .blob.blob-2
    │   ├── .blob.blob-3
    │   └── .glass-card-overlay     (backdrop-filter; sits behind RSC text via z-index)
    └── LiquidGlassWebGL.tsx        [next/dynamic ssr:false, lazy]
        └── <Canvas>
            └── <Plane>
                └── <MeshTransmissionMaterial
                       transmission={1}
                       thickness={1.5}
                       ior={1.4}
                       chromaticAberration={0.05}
                       distortion={…}
                       distortionScale={…}
                       temporalDistortion={…}
                       samples={6}
                       resolution={256}
                       backside
                     />
```

**Why a `HeroVisualLayer` wrapper instead of mounting the two children directly from the RSC?**
Next.js + RSC: a Server Component CAN import a `next/dynamic({ ssr: false })` component, but the call to `next/dynamic` itself is a client-only API in Next 16's evolving model **[CTX7-DEFERRED §13.1]**. Wrapping in a single `"use client"` boundary is the bulletproof approach: the Server Component imports `HeroVisualLayer` (a client component), and `dynamic` is invoked inside that client boundary. This is also how we co-locate the capability gate — it MUST run in the browser.

---

## 3. Data & Control Flow

### 3.1 Cursor → uniforms (zero React re-renders)

```
section.addEventListener("pointermove", onMove, { passive: true })
            │
            ▼
   rAF-throttled handler   (in HeroVisualLayer)
            │
            ├─→ section.style.setProperty("--mx", `${nx * 100}%`)
            │   section.style.setProperty("--my", `${ny * 100}%`)
            │   (consumed by LiquidGlassBackdrop blobs)
            │
            └─→ pointerStore.set({ x: nx, y: ny })
                (singleton in packages/ui/src/state/heroPointerStore.ts)
                            │
                            ▼
                useFrame in LiquidGlassWebGL reads pointerStore.value
                and writes material.uniforms.uMx.value / uMy.value
```

**Why a singleton ref store and not React state?**
`pointermove` fires up to 60×/sec. Going through React state would re-render the entire WebGL subtree at 60 Hz, defeating the demand frameloop. The singleton is a `{ value: {x, y}, set, subscribe }` triplet. `useFrame` reads `pointerStore.value` directly each frame — no subscription needed because r3f's `useFrame` already runs every frame the renderer ticks.

`useSyncExternalStore` is reserved for any React-tree consumers that ever need the value (none planned — kept as escape hatch).

### 3.2 Scroll → uScroll uniform

```
const heroRef = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ["start start", "end start"],   // [CTX7-DEFERRED §13.3]
});
const uScroll = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
```

`uScroll` is a MotionValue. We DO NOT subscribe with `useMotionValueEvent` (which would re-render). Instead, inside `LiquidGlassWebGL`'s `useFrame`, we call `uScroll.get()` and write to `material.uniforms.uScroll.value`. Reduced-motion path clamps the transform output to `[0, 0]`.

### 3.3 Burst → uBurst tween (one-shot, mount-time)

```
useEffect(() => {
  if (profile !== "css+webgl") return;
  const start = performance.now();
  const duration = 1200;        // ms, locked
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    // ease: 0 → 1 → 0 over the 1200ms window
    const eased = t < 0.5 ? easeOutCubic(t * 2) : 1 - easeInCubic((t - 0.5) * 2);
    burstStore.set(eased);
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [profile]);
```

`burstStore` is another singleton; `useFrame` reads it. After the 1200ms window, `uBurst` stays at 0 forever for that page load. No replay on re-render.

### 3.4 The motion-preferences hook (single source of truth)

```ts
// packages/ui/src/hooks/useHeroMotionPreferences.ts
type HeroProfile = "static" | "css-only" | "css+webgl";

interface HeroMotionPreferences {
  profile: HeroProfile;
  ready: boolean;            // false until the first capability check resolves
}

export function useHeroMotionPreferences(): HeroMotionPreferences;
```

Discriminated union, not a soup of booleans. Every consumer branches on `profile`. `ready=false` during SSR + first paint guarantees no client-only DOM until hydration finishes (avoids hydration mismatch).

---

## 4. Capability Gate (formal)

```ts
function detectProfile(): HeroProfile {
  // SSR-safe early return
  if (typeof window === "undefined") return "static";

  // Highest priority: user preference
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return "static";

  // Hard floors for WebGL
  const desktop      = window.matchMedia("(min-width: 1024px)").matches;
  const concurrency  = (navigator.hardwareConcurrency ?? 0) >= 4;
  const saveData     = (navigator as any).connection?.saveData === true;
  const webgl2       = (() => {
    try {
      const c = document.createElement("canvas");
      return !!c.getContext("webgl2");
    } catch { return false; }
  })();
  // Feature flag is the final OR-gate
  const flagOn = process.env.NEXT_PUBLIC_HERO_LIQUID === "true";

  if (!flagOn) return "static"; // legacy hero owns the page when flag is off
  if (!desktop || !concurrency || saveData || !webgl2) return "css-only";
  return "css+webgl";
}
```

| Check | Threshold | Why this number |
|-------|-----------|-----------------|
| `prefers-reduced-motion` | `reduce` → static | WCAG 2.3.3 (Animation from Interactions). Non-negotiable. |
| Viewport width | ≥ 1024px | Tablets and phones throttle GPU thermally; the splash blows fans. 1024 matches our `lg` breakpoint. |
| `hardwareConcurrency` | ≥ 4 cores | Filters single/dual-core ARM Chromebooks and budget Android. Empirical floor for 60fps `MeshTransmissionMaterial`. |
| `saveData` | not true | Honors NetInfo Save-Data hint. Cheap chunk respect. |
| WebGL2 | available | drei `MeshTransmissionMaterial` requires WebGL2-class precision (mediump float on mobile WebGL1 produces banding). [CTX7-DEFERRED §13.2] |
| Feature flag | `true` | Kill switch. False → static profile → legacy hero (Phase 1). |

**Where each check runs**: 100% client-side. The hook returns `{ profile: "static", ready: false }` until the first `useEffect` runs post-hydration; only then does it commit the real profile via `setState`. This is the SSR-safe pattern.

---

## 5. Bundle Strategy

### 5.1 Layout

| Chunk | Contents | Size budget |
|-------|----------|-------------|
| `app/[locale]/page` (initial) | RSC HeroSection HTML + HeroVisualLayer client island + LiquidGlassBackdrop | **+5 KB gz** delta vs. baseline |
| `chunks/hero-webgl-[hash].js` (lazy) | three core, drei `MeshTransmissionMaterial`, LiquidGlassWebGL component | **≤ 200 KB gz** hard cap |

### 5.2 Tree-shaking drei

`@react-three/drei` ships ~150+ helpers. We import ONLY what we use:

```ts
// Preferred: subpath import to shake aggressively
import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial";
// [CTX7-DEFERRED §13.2] — verify this subpath exists in installed drei version.
// If not, fall back to: import { MeshTransmissionMaterial } from "@react-three/drei"
// and rely on Webpack/Turbopack tree-shaking + sideEffects:false in drei's package.json.
```

We also import `extend` from `@react-three/fiber` only if needed for `<Plane>` substitute (probably use a literal `<mesh><planeGeometry/>…</mesh>` to avoid the helper).

### 5.3 Enforcement

A new script `scripts/check-bundle-size.mjs` runs in `qa:gate`:

```js
// Reads .next/build-manifest.json + .next/server/pages-manifest.json
// Finds the chunk whose name matches /hero-webgl/, gzips its contents in-memory,
// asserts <= 200 * 1024.
// Also asserts the page's initial bundle delta vs. a stored baseline (.bundle-baseline.json).
```

`size-limit` is the canonical tool but adding it pulls a config + dep. The custom script is ~80 LOC, no new deps, and reads Turbopack's manifests directly.

### 5.4 Compatibility verification (must run before tasks)

| Lib | Version | Concern | [CTX7] |
|-----|---------|---------|--------|
| `@react-three/fiber` | latest v9 expected | React 19 root API, Next 16 Turbopack | §13.1 |
| `@react-three/drei` | latest | `MeshTransmissionMaterial` props stable | §13.2 |
| `framer-motion` | 12.38.0 (installed) | `useScroll({target,offset})` signature | §13.3 |
| `next-intl` | 4.9.1 (installed) | `useTranslations` in async RSC | §13.4 |
| `next` | latest (16) | `dynamic({ssr:false})` boundary rules | §13.1 |

---

## 6. SSR / Hydration Discipline

| Element | Rendered | First paint | Hydration trigger |
|---------|----------|-------------|-------------------|
| `<h1>`, eyebrow, lead, CTAs | RSC HTML | yes (LCP candidate) | n/a — pure HTML |
| `<HeroVisualLayer>` mount | client | no (placeholder = empty `<div aria-hidden>`) | post-hydration |
| `LiquidGlassBackdrop` blobs | client, CSS only | no | mounts when `profile !== "static" && ready` |
| CSS vars `--mx`, `--my` | NOT set during SSR | static defaults from CSS rule | initialized in `useEffect` |
| WebGL `<Canvas>` | client, dynamic | no | mounts when `profile === "css+webgl"` AND in viewport AND idle |

**Hydration-mismatch defenses**:
1. `HeroVisualLayer` returns `null` until `ready === true`. SSR HTML and first client render match (both empty).
2. CSS declares default `--mx: 50%; --my: 50%;` on the section. JS only ever writes new values — never reads them during SSR.
3. The `<svg>` goo `<defs>` is rendered server-side as static markup (no `id` collisions because it's namespaced `liquid-goo-{instance}` if multiple instances ever exist; in practice we use a single instance).

**Next 16 RSC + dynamic({ssr:false})**: by sandwiching the dynamic call inside `HeroVisualLayer` (`"use client"`), we sidestep any RSC-vs-dynamic edge case. The Server Component only sees a regular client component import. **[CTX7-DEFERRED §13.1]**

---

## 7. Reduced-Motion Story

`profile === "static"` activates the following transformation:

| Layer | static behavior |
|-------|-----------------|
| Blob CSS animations | `animation-play-state: paused`; blobs render frozen at their `--mx:50%, --my:50%` defaults |
| Cursor listener | NOT attached (the rAF loop never starts) |
| SVG goo filter | Applied as static distortion — `<feTurbulence>` evaluates once at mount, then no `<animate>` element drives it |
| Scroll → distortion | `useScroll` not consumed; no MotionValue subscription |
| WebGL | Never imported |
| Sheen sweep | `animation-play-state: paused` |

The visual identity is preserved (frozen liquid-glass card, gradient, h1) — accessibility users get a premium static composition, not a downgraded blank section. **No fallback image needed**: the CSS layer self-renders.

A `prefers-color-scheme: dark` media query is independent and applies always.

---

## 8. SEO Story

| Asset | Source | Location |
|-------|--------|----------|
| Single `<h1>` | i18n: `hero.h1Name` + " — " + `hero.h1Role` | RSC HTML, in initial response |
| `aria-labelledby="hero-title"` | static | `<section>` element |
| Lead paragraph | `profile?.headline ?? t("hero.lead")` | RSC HTML |
| JSON-LD `Person` | `app/[locale]/page.tsx`, extended with `image` (Sanity CDN URL) + `mainEntityOfPage` | `<head>` via `<script type="application/ld+json">` |
| OG image | existing `app/[locale]/layout.tsx` `Metadata` | unchanged unless missing |
| Locale alternates | Next.js i18n routing already emits `hreflang` | unchanged |

**`useTranslations` in Server Component**: next-intl 4.9 supports `useTranslations` in async Server Components since 4.0. **[CTX7-DEFERRED §13.4]**. If the installed version requires `getTranslations({ locale })` instead, we switch — both work identically for our use case (scoped `"hero"` namespace, no formatting).

**LCP target**: the `<h1>` is the Largest Contentful Paint candidate because (a) it's text in initial HTML, (b) it sits in the viewport, (c) the WebGL canvas mounts later and is smaller in painted area than the h1 box (the canvas covers the section but most of its painted pixels are translucent; LCP measures contentful paint, and translucent layers don't displace the h1 candidate). Verified empirically in verify phase via `PerformanceObserver({ type: "largest-contentful-paint" })`.

---

## 9. Test Strategy (TDD)

> Strict TDD is enabled for this project. Every component below ships with its test written FIRST.

### 9.1 Vitest unit tests (jsdom)

| Test file | What it asserts |
|-----------|-----------------|
| `HeroSection.test.tsx` | Renders exactly one `<h1>`. Renders eyebrow, lead, primary CTA, secondary CTA. `aria-labelledby` matches h1 `id`. JSON-LD-irrelevant — that lives in the page test. |
| `HeroVisualLayer.test.tsx` | Returns `null` while `ready=false`. After ready, renders `<LiquidGlassBackdrop>` for `css-only` and `css+webgl`, nothing for `static`. Renders the `next/dynamic` placeholder for the WebGL chunk only when `css+webgl`. |
| `useHeroMotionPreferences.test.ts` | Mocks `matchMedia` + `navigator.hardwareConcurrency` + `navigator.connection.saveData` + `WebGL2RenderingContext`. Asserts every cell of the truth table (8 combinations covering each gate flipping). |
| `LiquidGlassBackdrop.test.tsx` | Attaches `pointermove` on mount, detaches on unmount. Sets `--mx`/`--my` only inside `useEffect`. Honors a passed `profile="static"` prop by not attaching. |
| `useLiquidPointer.test.ts` | rAF throttling: 100 synchetic moves in one frame collapse to one DOM write. |
| `heroPointerStore.test.ts` | Singleton across imports; `set`/`subscribe`/`value` semantics. |

### 9.2 Vitest integration

| Test | Assertion |
|------|-----------|
| `HeroSection.integration.test.tsx` | Reduced-motion path: render with `matchMedia` mock returning reduced; expect NO `<canvas>` in DOM, no `pointermove` listener attached, blobs paused. |
| `HeroSection.flag-off.test.tsx` | `NEXT_PUBLIC_HERO_LIQUID=false` → renders nothing extra; legacy `HeroFragment` is the chosen render in `ObsidianStream`. |

### 9.3 Playwright e2e

| Project (browser × viewport) | Assertion |
|------------------------------|-----------|
| chromium-desktop (1440×900) | `<canvas>` element appears within 5s of section intersection; `expect(page.locator("canvas")).toBeVisible()`. |
| chromium-mobile (375×812) | `expect(page.locator("canvas")).toHaveCount(0)` — capability gate excludes mobile. |
| chromium-reduced-motion (`reducedMotion: 'reduce'`) | No canvas; blobs do not animate (verify via computed style `animation-play-state`). |
| axe-a11y | 0 violations on the hero section. `expect(page.locator("h1")).toHaveCount(1)`. |
| contrast | Screenshot the h1 region; pixel-sample assertion that effective text-vs-background ratio ≥ 4.5:1 WCAG AA. |
| LCP | `await page.evaluate(() => new Promise(r => new PerformanceObserver((l) => r(l.getEntries().pop().element.tagName)).observe({type:'largest-contentful-paint',buffered:true})))` returns `"H1"`. |

### 9.4 Lighthouse CI

```js
// lighthouserc.cjs additions
{
  assertions: {
    "categories:performance": ["error", { minScore: 0.90 }],
    "categories:seo":         ["error", { minScore: 0.95 }],
    "categories:accessibility": ["error", { minScore: 0.95 }],
    "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
    "total-blocking-time": ["warn", { maxNumericValue: 200 }],
  }
}
```

Mobile profile uses `minScore: 0.85` for performance, the rest unchanged.

### 9.5 Storybook

Stories under `apps/portfolio/components/fragments/HeroSection.stories.tsx`:
- `Default` — `profile="css+webgl"`, flag on, full hero.
- `ReducedMotion` — overrides `matchMedia` to return reduced.
- `NoWebGL` — forces `profile="css-only"` via decorator.
- `Hover` — uses `play` function to move pointer; visual regression target.
- `Scroll` — wraps the story in a 200vh container; scrolls the canvas into distortion mode.
- `FlagOff` — verifies legacy hero appears; smoke test only.

---

## 10. Migration Plan

| Phase | Action | Done when |
|-------|--------|-----------|
| 0 (setup) | Add deps `@react-three/fiber`, `@react-three/drei`, `three`. Add `NEXT_PUBLIC_HERO_LIQUID=false` to `.env.example`. Verify Context7 lookups (§13). | `pnpm install` clean, type-check passes. |
| 1 (build) | Implement components TDD-first behind flag (default false). Land tests + storybook + e2e + lighthouse baseline in PR. `ObsidianStream` reads the flag and chooses between `HeroFragment` and `HeroSection`. | All 9.x tests green. PR merged with flag off. |
| 2 (preview) | Set `NEXT_PUBLIC_HERO_LIQUID=true` in Vercel preview. QA team validates. Lighthouse comparison vs. baseline. RUM for 48h. | LCP, INP, CLS within budget; SEO ≥ 95. |
| 3 (production) | Flip flag in production. Monitor Web Vitals 7-14 days. | No regression alarms; engagement metrics stable or up. |
| 4 (cleanup) | Delete `HeroFragment.tsx`, its tests, the legacy i18n keys, and the flag check in `ObsidianStream`. Single small PR. | Repo no longer references `HeroFragment`. |

Rollback at any phase: set flag false → next deploy → legacy hero. No code change.

---

## 11. Open Decisions for sdd-tasks

| # | Decision | Recommendation |
|---|----------|----------------|
| 1 | Final h1 wording | **`Héctor Trejo Luna — Senior Software Architect`** (en) / **`Héctor Trejo Luna — Arquitecto Senior de Software`** (es). Locked here unless tasks finds copy conflict. |
| 2 | Eyebrow microcopy | en: `"Building digital experiences"` ; es: `"Construyendo experiencias digitales"`. Tasks phase confirms with current site voice. |
| 3 | OG / JSON-LD `image` | Use existing Sanity profile avatar via `urlForImage(profile.avatar).width(1200).height(630).url()`. If absent, fall back to `/og-default.png` static asset. Tasks verifies asset exists. |
| 4 | Extract `LiquidGlassBackdrop` to `packages/ui` immediately or defer | **Extract immediately**. Proposal already places it in `packages/ui`. Cost is one re-export; benefit is reusability for future hero variants. |
| 5 | Deprecate legacy i18n keys (`hero.titleLine1`, `titleLine2`, `headline`, `subheadline`) | Keep through Phase 1, delete in Phase 4. Tasks adds a comment marker. |
| 6 | drei subpath import works? | Tasks verifies via Context7 + a build smoke-test before locking. Fallback documented in §5.2. |

---

## 12. Mermaid sequence diagram (paint timeline)

```mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Server as Next.js Server
  participant Hyd as Client Hydration
  participant Lazy as WebGL Chunk

  Browser->>Server: GET /en
  Server-->>Browser: SSR HTML (h1, lead, CTAs, JSON-LD in <head>)
  Note over Browser: First paint — h1 = LCP candidate
  Browser->>Hyd: hydrate HeroVisualLayer
  Hyd->>Hyd: useHeroMotionPreferences runs in useEffect
  alt profile === "static"
    Note over Hyd: Render nothing visual; legacy or frozen layer
  else profile === "css-only"
    Hyd->>Hyd: Mount LiquidGlassBackdrop, attach pointermove
  else profile === "css+webgl"
    Hyd->>Hyd: Mount LiquidGlassBackdrop, attach pointermove
    Hyd->>Hyd: Wait for IntersectionObserver(threshold=0.1)
    Hyd->>Hyd: Wait for requestIdleCallback
    Hyd->>Lazy: dynamic import LiquidGlassWebGL
    Lazy-->>Hyd: chunk ready
    Hyd->>Lazy: mount <Canvas>, start uBurst tween (1200ms)
    loop every animation frame
      Browser->>Lazy: pointermove → pointerStore → uMx/uMy
      Browser->>Lazy: scrollY → useScroll → uScroll
      Lazy->>Lazy: useFrame writes uniforms; renderer ticks (demand)
    end
  end
  Note over Browser: User unmounts (route change) → renderer.dispose() + listeners removed
```

---

## 13. Skill Resolution

**`context7-strict` invoked** — `injected`. This phase REQUIRES Context7 verification of every external API. The Context7 MCP tools were not available in this execution environment; all five lookups are explicitly marked **deferred to the apply phase** with the assumption each forces and the mitigation if wrong. The orchestrator MUST run these lookups in `sdd-apply` BEFORE writing the corresponding code.

| # | Library | Deferred lookup | Assumption forced | Mitigation if wrong |
|---|---------|-----------------|-------------------|---------------------|
| 13.1 | `@react-three/fiber` v9 + `next` 16 | Canvas `frameloop="demand"`, `useFrame` signature, React 19 root API, Next 16 `dynamic({ssr:false})` placement rules | r3f v9 supports React 19; `dynamic({ssr:false})` works inside a `"use client"` wrapper component; `frameloop="demand"` is still a valid Canvas prop | If `dynamic({ssr:false})` requires direct call from a Server Component, restructure to import `LiquidGlassWebGL` directly in `HeroSection.tsx` (RSC) and put the capability gate inside the dynamic component. If r3f v9 incompatible, pin r3f canary or fall back to `ogl` (~12 KB) + hand shader (proposal plan-B). |
| 13.2 | `@react-three/drei` `MeshTransmissionMaterial` | Exact prop set: `transmission`, `thickness`, `ior`, `chromaticAberration`, `distortion`, `distortionScale`, `temporalDistortion`, `samples`, `resolution`, `backside`, `backsideThickness`. Subpath import `@react-three/drei/core/MeshTransmissionMaterial` exists. | All listed props are supported in current drei; subpath works | If a prop name has changed (e.g., `chromaticAberration` → `chromaticAberrationStrength`), align with the current API. If subpath fails, use top-level import + rely on `sideEffects:false` tree-shake. If the material requires WebGL2 explicitly, our gate already covers it; if it requires render-target setup, drei encapsulates it (verified in drei source historically). |
| 13.3 | `framer-motion` 12.38.0 | `useScroll({ target, offset })` accepts `["start start", "end start"]` as valid offset tuple in v12; `useTransform` MotionValue interop with non-React consumers via `.get()` is stable | Signature unchanged from v11 | If offset format changed, update to v12's syntax. If `LazyMotion`/`m` import needed at the layer level, wrap. Already imported via `ObsidianStream`, so the bundle shape is known. |
| 13.4 | `next-intl` 4.9.1 | `useTranslations("hero")` works in async Server Components with `params` as Promise (Next 16 `params` is async); locale resolution is automatic via middleware | Works as documented | If async RSC requires `getTranslations({ locale: (await params).locale })`, switch — semantically identical for our usage. |
| 13.5 | `next` 16 | `next/dynamic` with `ssr:false` from a Client Component is supported; Turbopack tree-shakes drei via `sideEffects` field | True | If Turbopack misses the tree-shake, configure `experimental.optimizePackageImports = ["@react-three/drei"]` in `next.config.ts` (this is the documented escape hatch as of Next 14+). |

**Honest reporting**: this design phase did not perform live Context7 calls because the tooling was not exposed in this executor's tool set. The architectural choices remain valid because (a) they're consistent with widely-documented public behavior of these libraries through 2024-2025, (b) every assumption above has a concrete fallback, and (c) the apply phase has a checklist of five mandatory lookups before any code is written. If `sdd-apply` discovers a contradiction, it pauses and routes back to design.

---

**Phase status**: complete. Ready for `sdd-tasks` (consumes this design + spec).
