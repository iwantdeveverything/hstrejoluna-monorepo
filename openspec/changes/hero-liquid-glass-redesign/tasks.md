# Tasks: hero-liquid-glass-redesign

## Strict TDD Mode
ENABLED. Test runner: `npm test` (vitest from root → apps/portfolio). E2E: `npm run qa:e2e --workspace=apps/portfolio`. Each implementation task is preceded by a failing-test task (RED) and followed by a refactor task where applicable. Every requirement in `spec.md` is traced to at least one task. Run `npm test` after each GREEN; commit at refactor green.

## Phase 1 — Infrastructure & Scaffolding (sequential)

- [ ] 1.1 Add `NEXT_PUBLIC_HERO_LIQUID` to `apps/portfolio/.env.example` (default `"false"`) and document the rollout flag in `apps/portfolio/README.md`. *(satisfies: Rollback flag)*
- [ ] 1.2 Create `scripts/check-bundle-size.mjs` reading the Turbopack build manifest, gzipping in-memory, asserting initial JS delta ≤ +5 KB gz vs baseline AND any chunk matching `chunks/hero-webgl-*.js` ≤ 200 KB gz. Persist baseline to `scripts/.bundle-baseline.json` (committed). *(satisfies: Performance budgets — bundle-size assertion fails on regression, initial JS budget is enforced)*
- [ ] 1.3 Wire `node scripts/check-bundle-size.mjs` into the existing `qa:gate` script in root `package.json`. Verify non-zero exit on threshold breach via a manual stub run.
- [ ] 1.4 Add a Playwright project named `chromium-reduced-motion` in `apps/portfolio/playwright.config.ts` (use: `{ ...devices['Desktop Chrome'], reducedMotion: 'reduce' }`). Keep existing projects intact. *(satisfies: portfolio-testing-foundation — reduced-motion path)*
- [ ] 1.5 Update `apps/portfolio/lighthouserc.cjs` assertions: `categories:seo ≥ 0.95`, `categories:performance ≥ 0.90` (desktop preset) / `≥ 0.85` (mobile preset), `largest-contentful-paint ≤ 2500ms`, `categories:accessibility ≥ 0.95`. *(satisfies: SEO surface, Performance budgets, portfolio-testing-foundation — Lighthouse SEO threshold raised to 95)*

## Phase 2 — Library Verification (Context7 — gate to Phase 3)

> Each Context7 task is a precondition to its corresponding implementation task in Phase 3/4. If any lookup contradicts the design, pause apply and route back to sdd-design.

- [ ] 2.1 Context7 resolve `@react-three/fiber` v9. Capture: `<Canvas frameloop="demand" dpr={[1,1.5]}>` signature, `useFrame` API in r3f v9, React 19 root compatibility notes.
- [ ] 2.2 Context7 resolve `@react-three/drei`. Capture: `MeshTransmissionMaterial` complete prop list (`transmission`, `thickness`, `ior`, `chromaticAberration`, `distortion`, `distortionScale`, `temporalDistortion`, `samples`, `resolution`, `backside`) AND the subpath import path (`@react-three/drei/core/MeshTransmissionMaterial`) for tree-shaking.
- [ ] 2.3 Context7 resolve `framer-motion` 12.38.0. Capture: `useScroll({ target, offset: ["start start","end start"] })` exact signature in v12, `LazyMotion + domAnimation` boundaries under Next 16 RSC.
- [ ] 2.4 Context7 resolve `next-intl` 4.9.1. Capture: `useTranslations` in async RSC vs `getTranslations({ locale })`, which to use for the new `HeroSection` server component.
- [ ] 2.5 Context7 resolve Next.js 16. Capture: `next/dynamic({ ssr: false })` placement rules under RSC + Turbopack tree-shake behavior for `@react-three/drei`. Note `experimental.optimizePackageImports` escape hatch.
- [ ] 2.6 Save findings to engram as `sdd/hero-liquid-glass-redesign/context7` (so apply phase has them cached and verify can compare against actual usage).

## Phase 3 — Shared Primitives in `packages/ui` (TDD, mostly sequential within a primitive, parallel across primitives)

> Tasks 3.1–3.4 (motion preferences + pointer store) can run in parallel with 3.5–3.7 (CSS backdrop). 3.8 onward depends on 3.1–3.4.

- [ ] 3.1 RED: Failing test `packages/ui/src/hooks/useHeroMotionPreferences.test.ts` covering 8-cell truth table → returns `{ profile: "static", ready }` under reduced-motion; `"css-only"` when any of `<1024px`, `hardwareConcurrency<4`, `connection.saveData`, no WebGL2; `"css+webgl"` otherwise. Mock `matchMedia`, `navigator`, WebGL2 probe. Returns `ready=false` during SSR. *(satisfies: WebGL refraction layer — capability gates 1–5)*
- [ ] 3.2 GREEN: Implement `packages/ui/src/hooks/useHeroMotionPreferences.ts` returning `{ profile, ready }` discriminated union; commits real profile in `useEffect`.
- [ ] 3.3 RED: Failing test `packages/ui/src/runtime/heroPointerStore.test.ts`: subscribe → updates on rAF; assert no React re-renders (use a render-counter component); teardown removes listener. *(satisfies: Liquid glass CSS layer — cursor reactivity updates CSS variables only)*
- [ ] 3.4 GREEN: Implement `packages/ui/src/runtime/heroPointerStore.ts` (vanilla module, ref-style `get/set/subscribe`, rAF-throttled writer attached via `attachHeroPointerListener(sectionEl)`).
- [ ] 3.5 RED: Failing test `packages/ui/src/components/LiquidGlassBackdrop.test.tsx`: renders `aria-hidden="true"`, mounts SVG `<filter id="liquid-goo">`, three blob divs, glass-card wrapper; under reduced-motion no `pointermove` listener attached AND blob `animation-play-state` is `paused`. *(satisfies: Liquid glass CSS layer — always-on, reduced-motion freezes)*
- [ ] 3.6 GREEN: Implement `packages/ui/src/components/LiquidGlassBackdrop.tsx` ("use client"): SVG goo defs, three CSS blob divs reading `--mx/--my/--vx/--vy`, glass card with `backdrop-filter`. Calls `attachHeroPointerListener` only when not reduced-motion.
- [ ] 3.7 REFACTOR: Extract repeated CSS-var math into `packages/ui/src/runtime/cssVarHelpers.ts`; ensure 3.5 still passes. Run `npm test` from root.
- [ ] 3.8 RED: Failing test `packages/ui/src/components/LiquidGlassWebGL.test.tsx` (mount conditions): renders `<Canvas>` only when `profile === "css+webgl"` AND `intersectionRatio ≥ 0.1`; otherwise renders `null`. Mock `IntersectionObserver` + `requestIdleCallback`. *(satisfies: WebGL refraction layer — gates 1–6)*
- [ ] 3.9 GREEN: Implement `packages/ui/src/components/LiquidGlassWebGL.tsx` skeleton: r3f `<Canvas dpr={[1,1.5]} frameloop="demand">` + `<Plane>` + `<MeshTransmissionMaterial>` (subpath import per 2.2). Uniforms placeholders: `uTime, uMx, uMy, uScroll, uBurst`. Returns `null` until gates open.
- [ ] 3.10 RED: Failing test for entrance burst: `uBurst` ramps `0 → 1 → idle` exactly once over ≤1200ms per page load (use sessionStorage flag). Verify second mount in same page load does NOT replay. *(satisfies: Entrance burst splash)*
- [ ] 3.11 GREEN: Implement burst tween inside `useFrame` using a `burstStore` singleton; gate by `sessionStorage.getItem("hero-burst-played")`.
- [ ] 3.12 RED: Failing test for scroll-driven distortion: `uScroll` updates with mocked `scrollYProgress`; clamped to `0` under reduced-motion; pauses updates when hero leaves viewport. *(satisfies: Scroll-driven distortion)*
- [ ] 3.13 GREEN: Wire `useScroll({ target: heroRef, offset: ["start start","end start"] })` + `useTransform(progress,[0,1],[0,0.6])`; read inside `useFrame` from a scroll store; pause loop when `IntersectionObserver` reports `intersectionRatio === 0`.
- [ ] 3.14 RED: Failing test for WebGL teardown: on unmount, renderer disposes resources, rAF cancelled, listeners removed. *(satisfies: WebGL teardown on unmount)*
- [ ] 3.15 GREEN: Implement teardown in `useEffect` cleanup of `LiquidGlassWebGL` (dispose materials/geometries/textures, cancel rAF, remove pointer/scroll listeners owned by the layer).
- [ ] 3.16 REFACTOR: Convert drei import to subpath form (`@react-three/drei/core/MeshTransmissionMaterial`) per 2.2. Verify with bundle-size script (1.2). Run `npm test`.
- [ ] 3.17 Add Storybook stories for `LiquidGlassBackdrop` and `LiquidGlassWebGL` under `packages/ui/src/components/*.stories.tsx`: `Default`, `ReducedMotion`, `NoWebGL`, `Hover`, `ScrollMidway`, `FlagOff`.
- [ ] 3.18 Re-export new primitives + hooks + store from `packages/ui/src/index.ts`.

## Phase 4 — `apps/portfolio` HeroSection (TDD, sequential)

- [ ] 4.1 RED: Failing Vitest test `apps/portfolio/components/sections/HeroSection.test.tsx` (jsdom): renders exactly one `<h1>` with id `hero-title` and text matching the locked en copy; lead paragraph; eyebrow `<p>`; primary CTA (`href="#projects"`); secondary CTA. Each per locale (en, es). *(satisfies: Semantic SSR shell — hero is rendered server-side; portfolio-testing-foundation — hero contains semantic h1)*
- [ ] 4.2 GREEN: Implement `apps/portfolio/components/sections/HeroSection.tsx` as RSC. Use the next-intl pattern chosen in 2.4 (likely `getTranslations({ locale })` for async RSC). Section uses `aria-labelledby="hero-title"`. Renders ONE client island: `<HeroVisualLayer/>`.
- [ ] 4.3 RED: Failing test for Sanity profile fallback: lead uses `profile?.headline` when defined; falls back to `t("lead")` when null/undefined; h1 NEVER reads from profile. *(satisfies: Sanity profile fallback)*
- [ ] 4.4 GREEN: Wire `profile` prop through `HeroSection`; lead reads `profile?.headline ?? t("lead")`.
- [ ] 4.5 RED: Failing test `apps/portfolio/components/sections/HeroVisualLayer.test.tsx`: returns `null` while `ready=false`; mounts `LiquidGlassBackdrop` always when `ready` AND profile in `{"css-only","css+webgl"}`; mounts lazy `LiquidGlassWebGL` ONLY when profile === `"css+webgl"`; renders nothing animated under `"static"`. *(satisfies: WebGL skipped on small viewports / reduced-motion / save-data / no WebGL2)*
- [ ] 4.6 GREEN: Implement `apps/portfolio/components/sections/HeroVisualLayer.tsx` ("use client") composing `LiquidGlassBackdrop` + `next/dynamic(() => import("@hstrejoluna/ui").then(m => m.LiquidGlassWebGL), { ssr: false })`. Owns section ref, capability gate via `useHeroMotionPreferences`, scroll wiring.
- [ ] 4.7 Update `apps/portfolio/components/streams/ObsidianStream.tsx` to import `HeroSection` instead of `HeroFragment` when `process.env.NEXT_PUBLIC_HERO_LIQUID === "true"`. Keep legacy import otherwise. Add a Vitest test asserting both branches render their respective tree. *(satisfies: Rollback flag — flag enabled / disabled / build-time tree-shake)*
- [ ] 4.8 Add new i18n keys to `apps/portfolio/messages/en.json` under `hero.*`: `eyebrow`, `h1Name`, `h1Role`, `lead`, `ctaPrimary`, `ctaPrimaryAriaLabel`, `ctaSecondary`, `ctaSecondaryAriaLabel`, `secondaryHref`. Mirror in `apps/portfolio/messages/es.json`. Use locked copy (en `Héctor Trejo Luna — Senior Software Architect`, es `Héctor Trejo Luna — Arquitecto Senior de Software`; eyebrow en `Building digital experiences`, es `Construyendo experiencias digitales`). *(satisfies: hero copy is translatable)*
- [ ] 4.9 Update `apps/portfolio/messages/en.test.ts` and `apps/portfolio/messages/es.test.ts` parity assertions to require all new `hero.*` keys. *(satisfies: portfolio-testing-foundation — i18n parity tests cover hero keys)*
- [ ] 4.10 RED: Failing test for JSON-LD `Person` block in `app/[locale]/page.tsx` test (`apps/portfolio/app/[locale]/page.test.tsx`): emits valid JSON-LD with `name`, `jobTitle`, `image` (Sanity URL via `urlForImage(profile.avatar).width(1200).height(630).url()` with `/og-default.png` fallback), `mainEntityOfPage`. *(satisfies: SEO surface — JSON-LD Person valid)*
- [ ] 4.11 GREEN: Update `apps/portfolio/app/[locale]/page.tsx` to add `image` and `mainEntityOfPage` to the JSON-LD `Person` block.

## Phase 5 — Styles & SEO

- [ ] 5.1 Add `@layer utilities` rules in `apps/portfolio/app/globals.css` for `.liquid-glass`, `.glass-card`, blob keyframes, default `--mx:50%; --my:50%`. Add tinted backdrop tokens behind h1 + lead for contrast. *(satisfies: Accessibility — contrast over fluid background)*
- [ ] 5.2 Add Vitest snapshot or unit test for the resolved tinted backdrop CSS-var values; document chosen tint (e.g. `rgba(0,0,0,0.45)` over blobs) in `apps/portfolio/app/globals.css` comment.
- [ ] 5.3 Verify h1 is the LCP candidate using `PerformanceObserver` in a Playwright spec (lives in Phase 6). Note: this is the wiring task; the actual assertion task is 6.11.

## Phase 6 — End-to-End Tests (TDD, sequential within a viewport, parallel across viewports)

> Each spec lives under `apps/portfolio/e2e/hero-liquid-glass.spec.ts` (or split per concern). Use the `chromium-desktop`, `chromium-mobile`, `chromium-reduced-motion` projects.

- [ ] 6.1 RED: Failing Playwright spec — `chromium-desktop` (1440×900): `<canvas>` mounts inside hero section within 5 s of viewport intersection. *(satisfies: portfolio-testing-foundation — desktop capable path)*
- [ ] 6.2 GREEN: Verify capability gate causes Canvas to mount on the desktop project; adjust gate timing if necessary.
- [ ] 6.3 RED: Failing Playwright spec — `chromium-mobile` (375×812): NO `<canvas>` in hero section AND no WebGL chunk requested in network log. *(satisfies: WebGL skipped on small viewports)*
- [ ] 6.4 GREEN: Verify mobile path; ensure `useHeroMotionPreferences` returns `"css-only"`.
- [ ] 6.5 RED: Failing Playwright spec — `chromium-reduced-motion` project: no canvas, no `pointermove` listener (assert via `page.evaluate` or render-count proxy), blobs static. *(satisfies: reduced-motion freezes the CSS layer; WebGL skipped under reduced-motion)*
- [ ] 6.6 GREEN: Verify reduced-motion path.
- [ ] 6.7 RED: Failing axe a11y test on hero section (all three projects). *(satisfies: Accessibility — a11y test passes; portfolio-testing-foundation)*
- [ ] 6.8 GREEN: Resolve any axe violations until count is zero across all three projects.
- [ ] 6.9 RED: Failing pixel-contrast spec at h1 region across cursor positions (idle, left edge, right edge, scroll 50%). *(satisfies: Accessibility — contrast over fluid background)*
- [ ] 6.10 GREEN: Tune backdrop tint in `globals.css` until contrast ≥ 4.5:1 in all measured states.
- [ ] 6.11 RED: Failing Playwright spec asserting LCP element id is `hero-title` via `PerformanceObserver` script. *(satisfies: Lighthouse LCP threshold; SEO surface — single h1 per page)*
- [ ] 6.12 GREEN: Verify h1 wins LCP; if not, audit deferred CSS / image preloads.
- [ ] 6.13 RED: Failing memory-leak stress test: 100 mount/unmount cycles, heap delta within ±5% baseline. Document threshold + sampling method. *(satisfies: WebGL teardown on unmount)*
- [ ] 6.14 GREEN: Implement complete WebGL teardown to satisfy stress test (refines 3.15 with any newly discovered leaks).
- [ ] 6.15 RED: Failing keyboard-focus spec: tab through CTAs; assert each focused CTA has a visible non-color-only indicator over the glass card. *(satisfies: Accessibility — keyboard focus visibility)*
- [ ] 6.16 GREEN: Add focus styles in `globals.css` (outline + offset shadow) until 6.15 passes.

## Phase 7 — Lighthouse + Bundle Validation

- [ ] 7.1 Run `npm run qa:lighthouse --workspace=apps/portfolio`. Verify SEO ≥ 95, Performance ≥ 90 desktop / ≥ 85 mobile, LCP ≤ 2.5 s, A11y ≥ 95. *(satisfies: SEO surface; Performance budgets — Lighthouse LCP threshold)*
- [ ] 7.2 Run `node scripts/check-bundle-size.mjs`. Verify lazy WebGL chunk ≤ 200 KB gz AND initial JS delta ≤ +5 KB gz vs `scripts/.bundle-baseline.json`. *(satisfies: Performance budgets)*
- [ ] 7.3 If over budget: enable `experimental.optimizePackageImports = ["@react-three/drei"]` in `apps/portfolio/next.config.*`; re-run. If still over budget, fall back to plan-B `ogl` + custom shader (proposal-documented), pause apply, route back to design.

## Phase 8 — Rollout

- [ ] 8.1 Land PR with `NEXT_PUBLIC_HERO_LIQUID="false"` default. Reviewers verify legacy hero unchanged on staging.
- [ ] 8.2 Enable flag in preview deployment. Manual QA + Lighthouse comparison vs baseline.
- [ ] 8.3 Flip flag in production. Monitor RUM (LCP/INP/CLS) for 48h.
- [ ] 8.4 Cleanup PR: remove `HeroFragment` + flag + legacy i18n keys (Phase 4 of design migration). Out of scope for THIS change but tracked here for traceability.

## Parallelism map

- **Sequential boundary**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8.
- **Parallelizable within Phase 3**: 3.1–3.2 ↔ 3.3–3.4 ↔ 3.5–3.7 (different files, different test suites).
- **Parallelizable within Phase 6**: 6.1/6.2 ↔ 6.3/6.4 ↔ 6.5/6.6 (different Playwright projects). 6.7–6.16 must serialize after 6.1–6.6 land.
- **Parallelizable within Phase 4**: 4.8 (i18n keys) and 4.9 (parity tests) can pair. 4.10–4.11 (JSON-LD) independent of 4.1–4.7.

## Decisions to lock during apply

- Final h1 wording (locked: en `Héctor Trejo Luna — Senior Software Architect`; es `Héctor Trejo Luna — Arquitecto Senior de Software`).
- Final eyebrow microcopy (locked: en `Building digital experiences`; es `Construyendo experiencias digitales`).
- Image asset for OG / JSON-LD (Sanity `profile.avatar` via `urlForImage(...).width(1200).height(630).url()`, fallback `/og-default.png`).
- `LiquidGlassBackdrop` lives in `packages/ui` from day 1 (locked).
- drei subpath import path (verify in 2.2 + 3.16).

## Risks (carried into apply)

1. drei subpath path may differ between drei versions → mitigated by 2.2 Context7 lookup BEFORE 3.16.
2. `next/dynamic({ ssr:false })` placement under Next 16 RSC — must be inside a `"use client"` boundary (`HeroVisualLayer`) per 2.5; if Context7 contradicts, route back to design.
3. Bundle cap (200 KB gz) is tight; if drei + three exceeds, plan-B `ogl` shader required (7.3).

## Skill Resolution

context7-strict baked into Phase 2 as preconditions; findings persisted to `sdd/hero-liquid-glass-redesign/context7` for apply + verify reuse.

## Artifacts
- engram_topic_key: `sdd/hero-liquid-glass-redesign/tasks`
- openspec_path: `/home/hstrejoluna/Projects/hstrejoluna/openspec/changes/hero-liquid-glass-redesign/tasks.md`
