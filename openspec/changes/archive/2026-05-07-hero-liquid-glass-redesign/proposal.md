# Proposal: hero-liquid-glass-redesign

## 1. Intent & Why

**El "wow" en una frase**: cuando alguien aterrice en `hectorTrejoLuna.com`, lo primero que vea sea un hero con vidrio líquido fotorrealista — la luz se refracta, los blobs siguen al cursor con inercia, el scroll deforma el cristal, y al cargar explota un splash líquido — todo encima de un `<h1>` semántico que un crawler indexa en milisegundos. Un visitante humano dice "qué cabrón sabe lo que hace"; Googlebot dice "Senior Frontend Architect, indexed".

**Los dos no-negociables**:
1. **Liquid glass con física real** — refracción `MeshTransmissionMaterial`, blobs cursor-reactivos, distorsión guiada por scroll, entrance burst.
2. **SEO de nivel arquitecto** — único `<h1>` SSR con nombre + rol como ancla, lead con cluster de palabras clave, JSON-LD `Person` extendido, LCP < 2.5s.

**Por qué ahora**: el hero actual (`HeroFragment.tsx:127-240`) **no tiene `<h1>` en ninguna parte** — la palabra "ARCHITECT" vive dentro de `GlitchText` spans en divs decorativos. Es una regresión SEO confirmada por grep en todo el repo (`apps/portfolio`). Además, la estética cyberpunk genérica ("[SYSTEM_READY]: INITIALIZING_NEURAL_UPLINK") no comunica nivel de arquitecto senior — comunica "plantilla descargada". Este rediseño convierte un agujero SEO en una victoria y planta una bandera técnica con física que se siente real.

## 2. Scope

### In scope
- Reemplazo total de `apps/portfolio/components/fragments/HeroFragment.tsx` por un nuevo `HeroSection` (Server Component shell + dos capas cliente).
- Nuevas primitivas compartidas en `packages/ui`:
  - `LiquidGlassBackdrop.tsx` (capa CSS + SVG goo, siempre activa, aria-hidden).
  - `LiquidGlassWebGL.tsx` (capa r3f, lazy, capability-gated).
  - `useLiquidPointer.ts` (hook compartido: pointer → CSS vars + signal/ref store para uniforms r3f).
- Las cuatro físicas:
  1. Cursor-reactive blobs (CSS layer, siempre).
  2. Refracción sobre contenido (r3f `MeshTransmissionMaterial`).
  3. Scroll-driven distortion (framer-motion `useScroll` → uniform `uScroll`).
  4. Entrance burst (uniform `uBurst` ramping 0→1→idle on mount).
- Nuevo h1 SEO + lead + CTA + secondary link en `messages/en.json` y `messages/es.json` (paridad enforced).
- Extensión de JSON-LD `Person` en `app/[locale]/page.tsx` con `image` y `mainEntityOfPage`.
- Tests: vitest unit (HeroSection contract), Storybook stories (default / reduced-motion / no-WebGL / hover / scroll), Playwright a11y + h1 assertion + Lighthouse SEO ≥ 95.
- `qa:gate` extension: bundle-size assertion para el chunk WebGL (≤ 200 KB gz).
- Feature flag `NEXT_PUBLIC_HERO_LIQUID` para rollback en producción.

### Out of scope
- Otros fragments (`SignatureFragment`, `ProjectsFragment`, etc.) — solo hero.
- Cambios en el schema Sanity (`profile.headline` se sigue consumiendo como fallback dentro del lead).
- App `maestros-del-salmon` (este cambio toca `apps/portfolio` y `packages/ui` únicamente).
- Backend / CMS / CI infra changes más allá de `qa:gate`.
- Reescritura del sistema de tokens (se reusan `--color-ember`, `--color-void`, fluid type scale ya existentes).

## 3. Approach

### Architecture overview

Tres capas con responsabilidades estrictamente separadas:

```
┌──────────────────────────────────────────────────────┐
│ HeroSection.tsx  (RSC, SSR)                          │
│  <section aria-labelledby="hero-title">              │
│   <p className="eyebrow"> {t.eyebrow} </p>           │
│   <h1 id="hero-title"> Héctor Trejo Luna —           │
│        Senior Frontend Architect </h1>               │
│   <p className="lead"> {profile?.headline ?? t.lead} │
│   <a href="#projects" aria-label=…> {t.cta} </a>     │
│   <a href={linkedin}> {t.secondary} </a>             │
│   <LiquidGlassBackdrop />   ← client island          │
│   <LiquidGlassWebGL />       ← lazy client island    │
│  </section>                                          │
└──────────────────────────────────────────────────────┘
        │                                │
        ▼                                ▼
┌──────────────────────┐  ┌─────────────────────────────────┐
│ LiquidGlassBackdrop  │  │ LiquidGlassWebGL  (lazy)        │
│ "use client"         │  │ next/dynamic { ssr:false }      │
│ aria-hidden          │  │ aria-hidden                     │
│ CSS gradients        │  │ r3f Canvas + drei               │
│ SVG <filter> goo     │  │ MeshTransmissionMaterial plane  │
│ backdrop-filter      │  │ uniforms: uMouse, uScroll,      │
│ rAF cursor → CSS vars│  │           uBurst, uTime         │
└──────────────────────┘  └─────────────────────────────────┘
        ▲                                ▲
        └────── useLiquidPointer ────────┘
                (single rAF listener,
                 writes to ref store +
                 CSS custom properties)
```

**Razón clave**: el RSC paint pinta el `<h1>` en el primer byte HTML — ese es el LCP candidate. Las dos capas cliente son `aria-hidden` y se montan después de hidratación, ninguna bloquea el paint inicial. La WebGL solo aterriza si el dispositivo lo aguanta.

### Mount sequence (orden de eventos)

1. **SSR**: Next.js renderiza `HeroSection` en HTML estático. h1 + lead + CTA están en el primer byte. JSON-LD `Person` ya está en `<head>`.
2. **Hydration**: `LiquidGlassBackdrop` (cliente, eager) se monta. Las CSS variables `--mx`, `--my` se inicializan en `useEffect` (nunca SSR — evita hydration mismatch). Blobs empiezan a derivar.
3. **Idle + viewport check**: `requestIdleCallback` + `IntersectionObserver(threshold:0.1)` dispara el capability gate.
4. **Capability gate** (todas deben pasar):
   - `useReducedMotion() === false`
   - `window.matchMedia("(min-width: 1024px)").matches`
   - `navigator.hardwareConcurrency >= 4`
   - `navigator.connection?.saveData !== true`
   - WebGL2 disponible (`canvas.getContext("webgl2")`).
5. **WebGL mount**: si pasa, `next/dynamic(() => import("./LiquidGlassWebGL"), { ssr: false })` carga el chunk. Canvas r3f monta. Uniform `uBurst` corre de 0 → 1 → 0 en ~1.2s (entrance splash). Uniform `uTime` empieza loop.
6. **Listeners**: `useLiquidPointer` engancha `pointermove` (passive) en la sección, escribe a `--mx`/`--my` (CSS) y a un `useRef<{ x, y }>` que el `useFrame` de r3f lee directo (cero re-renders React).
7. **Scroll**: `useScroll({ target: heroRef, offset: ["start start", "end start"] })` produce `scrollYProgress`. `useTransform(progress, [0, 1], [0, 0.6])` alimenta `uScroll`. Reduced-motion → clamp a 0.
8. **Teardown**: en unmount o cambio a `prefers-reduced-motion`, se cancela rAF, se libera el WebGL context (`renderer.dispose()`), se desmontan listeners.

### Capa CSS (LiquidGlassBackdrop) — siempre activa

- 3 blobs radiales (`radial-gradient`) animados con `transform: translate3d(var(--mx), var(--my), 0) scale(...)`.
- `<svg><filter id="liquid-goo"><feTurbulence baseFrequency=… ><feDisplacementMap scale=… /></filter></svg>` aplicado vía `filter: url(#liquid-goo)` al contenedor de blobs.
- `backdrop-filter: blur(24px) saturate(180%) brightness(1.05)` sobre la tarjeta del lead (legibilidad WCAG AA).
- Conic-gradient highlight border + sweep animado para el sheen especular.
- Honors `prefers-reduced-motion` → blobs se congelan, sin sweep.

### Capa WebGL (LiquidGlassWebGL) — opcional, lazy

- `@react-three/fiber` `<Canvas dpr={[1, 1.5]} frameloop="demand">` (demand frameloop para que solo renderice cuando hay cambios detectados — ahorra batería).
- Una `<mesh>` plana ocupando el viewport, material `<MeshTransmissionMaterial>` de drei con props: `transmission={1}`, `thickness={1.5}`, `ior={1.4}`, `chromaticAberration={0.05}`, `distortion`, `distortionScale`, `temporalDistortion`.
- Custom `onBeforeCompile` shader patch: añade un uniform `uBurst` que multiplica `distortion` durante el splash inicial; añade `uScroll` que modula `temporalDistortion`; añade `uMouse` para un displacement local centrado en el cursor.
- `useFrame((state, delta) => { material.uniforms.uTime.value += delta; ... })` lee el ref store de `useLiquidPointer` (sin estado React).

**Disclaimer Context7**: las props/API exactas de `MeshTransmissionMaterial` y el patrón `onBeforeCompile` deben verificarse contra Context7 en `sdd-design` antes de codear. La elección de `r3f + drei` se confirma a nivel arquitectura aquí; los detalles de uniforms se cierran en el design phase.

### Data flow

- **i18n**: `useTranslations("hero")` para todo lo visible. Nuevas keys: `eyebrow`, `h1Name`, `h1Role`, `lead`, `cta`, `ctaAriaLabel`, `secondaryLabel`, `secondaryHref` (LinkedIn URL aunque sea constante, fácil de localizar).
- **Sanity**: `profile?.headline` sigue consumiéndose pero **dentro del lead paragraph**, no en el h1. El h1 es la verdad canónica del sitio (nombre + rol). Esto desacopla SEO del CMS.
- **JSON-LD**: en `app/[locale]/page.tsx`, extender el schema `Person` con:
  - `image`: URL del avatar de Sanity.
  - `mainEntityOfPage`: `{ "@type": "WebPage", "@id": "https://hectortrejoluna.com/{locale}" }`.

### Decisiones que se cierran AHORA en este proposal

#### 1. Copy del h1 — **DECIDIR**

Tres candidatos, recomendación al final:

| # | h1 | Pros | Contras |
|---|-----|------|---------|
| A | `Héctor Trejo Luna — Senior Frontend Architect` | Corto, directo, exact-match para "Senior Frontend Architect" | "Frontend" puede limitar alcance vs. "Software" |
| B | `Héctor Trejo Luna · Senior Software Architect engineering scalable ecosystems` | Cluster keywords ricos, alcance amplio | Largo, h1 de 78 chars empieza a ser excesivo |
| C | `Héctor Trejo Luna — Senior Software Architect` | Match exacto con jobTitle del JSON-LD ya existente, conciso | Ligeramente menos específico que A |

**Recomendación**: **Opción C** (`Héctor Trejo Luna — Senior Software Architect`). Razones:
- El JSON-LD `Person` actual ya emite `jobTitle: profile.headline` (que en producción es "Senior Software Architect"). Mantener consistencia entre h1 visible y `jobTitle` estructurado refuerza la señal SEO.
- "Software" cubre frontend + backend + arquitectura de sistemas — alcance estratégico mayor que "Frontend".
- 47 chars: dentro del rango ideal (40-60) para SERP titles cuando el h1 también compite por title-tag bias.
- "Frontend Architect" puede ir como cluster en el lead paragraph o como `knowsAbout` en JSON-LD (ya está).

> **Decisión propuesta**: `Héctor Trejo Luna — Senior Software Architect`. El `—` (em dash) es separador semántico fuerte y reconocido por crawlers. Variantes localizadas: en = "Senior Software Architect", es = "Arquitecto Senior de Software". El nombre NO se traduce.

#### 2. WebGL stack — **CONFIRMADO**

`@react-three/fiber` + `@react-three/drei`. Razones (consistentes con la decisión del usuario):
- `MeshTransmissionMaterial` out of the box en drei → cero shader artesanal para el 80% del look.
- API ergonómica para el equipo (futuras apps en el monorepo se pueden beneficiar).
- Compatibilidad con React 19 + Next.js 16 — **debe verificarse en Context7** (ver §9).
- Costo: ~150 KB gz (`three` core) + ~30 KB gz (`drei` tree-shaken al usar solo `MeshTransmissionMaterial` y opcionalmente `Float`/`shaderMaterial`) ≈ 180 KB gz. Dentro del presupuesto declarado por el usuario.

**Plan-B**: si Context7 revela incompatibilidad de r3f con Next.js 16 RSC sin workaround viable, el design phase puede pivotear a `ogl` (~12 KB) + shader artesanal con `lygia` chunks. Esto es escenario remoto — `@react-three/fiber` v9 ya soporta React 19.

#### 3. Bundle gate — **HARD CAP 200 KB gz**

- Initial JS de `apps/portfolio` no debe crecer más de **+5 KB gz** (CSS layer es esencialmente gratis; el wrapper de `next/dynamic` es ~1 KB).
- Lazy chunk WebGL ≤ **200 KB gz** total (incluye three + drei + el componente).
- Asserción mecánica: agregar a `qa:gate` un check con `@next/bundle-analyzer` o lectura directa de `.next/analyze` JSON.

#### 4. Capability matrix — **LOCKED**

WebGL solo monta cuando TODAS son verdaderas:

| Check | Razón |
|-------|-------|
| `prefers-reduced-motion: no-preference` | Accesibilidad WCAG 2.3.3 |
| `(min-width: 1024px)` | Móviles excluidos: GPU térmica + batería |
| `hardwareConcurrency >= 4` | Filtra dispositivos low-end |
| `connection.saveData !== true` | Honra Save-Data hint |
| WebGL2 disponible | Sin fallback degradado para edge cases |
| `IntersectionObserver` ratio ≥ 0.1 | No carga si el hero está fuera del viewport |

#### 5. Feature flag — **`NEXT_PUBLIC_HERO_LIQUID`**

Default `true` en development y staging, `true` en production tras una release estable. Mientras esté en `false`, el viejo `HeroFragment` sigue siendo el render. Permite rollback inmediato sin redeploy.

## 4. Rollback Plan

- **Fase 0 (este cambio)**: feature flag `NEXT_PUBLIC_HERO_LIQUID`. `ObsidianStream.tsx` lee el flag y elige entre `<HeroFragment />` (legacy) y `<HeroSection />` (nuevo). Ambos coexisten.
- **Fase 1 (release)**: flag activado en production. Se monitorea Lighthouse, Web Vitals (LCP, INP, CLS), error rate, y métricas de engagement (scroll depth, CTA clicks) durante 7-14 días.
- **Fase 2 (commit final)**: si todo está verde, se elimina el flag, se borra `HeroFragment.tsx` legacy, y `ObsidianStream.tsx` importa directo `HeroSection`. Una sola PR pequeña.
- **Rollback de emergencia**: cambiar `NEXT_PUBLIC_HERO_LIQUID=false` en Vercel/CI → next deploy → vuelve al hero viejo. Cero código.
- **Rollback git**: el cambio mantiene un boundary limpio (un commit revertible). Si el flag no es suficiente, `git revert <hash>` restaura el estado.

## 5. Affected Modules (concrete paths)

### Crear
- `packages/ui/src/components/LiquidGlassBackdrop.tsx` — capa CSS + SVG goo + cursor blobs.
- `packages/ui/src/components/LiquidGlassWebGL.tsx` — r3f Canvas + MeshTransmissionMaterial.
- `packages/ui/src/hooks/useLiquidPointer.ts` — pointer → CSS vars + ref store.
- `packages/ui/src/hooks/useLiquidCapability.ts` — capability gate (combina reduced-motion, viewport, hardware, connection, WebGL2).
- `apps/portfolio/components/fragments/HeroSection.tsx` — nuevo Server Component shell.
- `apps/portfolio/components/fragments/HeroSection.test.tsx` — vitest unit suite.
- `apps/portfolio/components/fragments/HeroSection.stories.tsx` — Storybook (default, reduced-motion, no-WebGL, hover, scroll).
- `apps/portfolio/e2e/hero.spec.ts` — Playwright a11y + h1 + Lighthouse SEO assertion.

### Modificar
- `apps/portfolio/components/ObsidianStream.tsx` — lee `process.env.NEXT_PUBLIC_HERO_LIQUID`, importa el nuevo o el viejo.
- `apps/portfolio/messages/en.json` — añade keys `hero.eyebrow`, `hero.h1Name`, `hero.h1Role`, `hero.lead`, `hero.cta`, `hero.ctaAriaLabel`, `hero.secondaryLabel`. Mantiene las viejas hasta Fase 2.
- `apps/portfolio/messages/es.json` — paridad total con en.
- `apps/portfolio/messages/en.test.ts` y `es.test.ts` — assertions sobre las nuevas keys.
- `apps/portfolio/app/[locale]/page.tsx` — extiende JSON-LD `Person` con `image` y `mainEntityOfPage`.
- `apps/portfolio/app/globals.css` — `@layer utilities` para `.liquid-glass`, `.glass-card`, definiciones SVG goo en un `<svg>` global o en el componente.
- `packages/ui/src/index.ts` — re-exporta los nuevos componentes y hooks.
- `apps/portfolio/package.json` — añade `@react-three/fiber`, `@react-three/drei`, `three` (con `three` como peerDependency vía pnpm si aplica).
- `apps/portfolio/lighthouserc.cjs` — verifica thresholds (SEO ≥ 95, Performance ≥ 90 desktop / ≥ 85 mobile).
- `apps/portfolio/qa:gate` script (ubicación TBD en design phase) — añade bundle-size check para el chunk WebGL.
- `.env.example` — documenta `NEXT_PUBLIC_HERO_LIQUID`.

### Tocar levemente / verificar
- `apps/portfolio/app/[locale]/layout.tsx` — verificar que el `Metadata` ya cubre OG image (probable que sí); ajustar si hace falta.
- Tests existentes que importan `HeroFragment` directamente — actualizar imports cuando llegue Fase 2.

### Eliminar (Fase 2, no en este cambio)
- `apps/portfolio/components/fragments/HeroFragment.tsx`.
- `apps/portfolio/components/fragments/HeroFragment.test.tsx`.

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| LCP regression del Canvas WebGL | High si no se gatea | High | Lazy mount + IntersectionObserver + capability gate; LCP candidate es el h1 text en SSR |
| Hydration mismatch en CSS vars del cursor | Medium | Medium | `--mx`/`--my` se inicializan SOLO dentro de `useEffect`; nada de SSR; defaults estáticos en CSS |
| Bundle blow-up del WebGL chunk | Medium | High | Hard cap 200 KB gz; bundle-size assertion en `qa:gate`; tree-shake drei (importar solo `MeshTransmissionMaterial`) |
| Mobile heat / battery drain | Medium | High | WebGL deshabilitado < 1024px; honra `connection.saveData`; CSS layer usa solo `transform`/`opacity` |
| Contraste sobre fondo fluido | Medium | High | Tinted backdrop `rgba(19,19,19,0.6)` detrás del lead; axe en Playwright + verificación manual de contraste WCAG AA 4.5:1 |
| Reduced-motion users excluidos del wow | Medium | Medium | Variante estática: gradiente fijo + blobs congelados + sin sweep + sin WebGL; aún se ve premium |
| i18n parity drift entre en y es | Low | Medium | `messages/en.test.ts` y `es.test.ts` enforcen todas las keys de `hero.*` en ambos locales |
| Sanity profile fallback se pierde | Low | Medium | `profile?.headline ?? t("lead")` se mantiene en el lead paragraph (NO en el h1) |
| Test churn en HeroFragment.test.tsx | High | Low | Reescritura limpia como `HeroSection.test.tsx` con nuevo contract; el viejo test se borra en Fase 2 |
| WebGL2 no soportado (browsers viejos) | Low | Low | Capability gate skipea el mount; CSS layer es la versión de producción de fallback |
| r3f / drei incompat con Next.js 16 RSC | Low | Medium | Lazy mount con `next/dynamic({ ssr: false })` en un Client Component wrapper; verificar en Context7 antes de apply |
| `MeshTransmissionMaterial` requiere setup de buffer/render-target específico | Medium | Medium | drei lo encapsula internamente; verificar props exactas en Context7; plan-B `ogl` documentado |

## 7. Success Criteria

- **Lighthouse SEO ≥ 95** (mobile + desktop). Baseline a medir antes de empezar; mejora documentada en verify phase.
- **Lighthouse Performance ≥ 90 desktop, ≥ 85 mobile** (medido con `lighthouserc.cjs` en CI).
- **LCP < 2.5s** en slow 4G mobile (CrUX threshold).
- **INP < 200ms** sostenido durante interacción del cursor + scroll.
- **CLS < 0.1** (sin shifts por mount tardío del WebGL — el placeholder ya ocupa su espacio).
- **Bundle delta** de `apps/portfolio` initial JS ≤ **+5 KB gz**.
- **Lazy chunk WebGL** ≤ **200 KB gz**.
- **Único `<h1>` semántico** detectado por axe + Playwright `expect(page.locator("h1")).toHaveCount(1)`.
- **Toda copy del hero** traducible (en + es paridad enforced).
- **`prefers-reduced-motion: reduce`** produce variante estática, accesible, sin pérdida de identidad visual.
- **Storybook stories** cubren: default, reduced-motion, no-WebGL fallback, hover, scroll states.
- **Playwright a11y test**: 0 axe violations en el hero. `aria-labelledby` apuntando al h1 verificado.
- **`@hstrejoluna/compliance`** — sin regresiones en consent gating (el WebGL no carga assets externos, así que no hay impacto consent).

## 8. Open Questions

Tras el checkpoint con el usuario, ya no hay preguntas abiertas significativas. Una nota residual:

1. **¿Deprecar las viejas keys `hero.titleLine1` / `titleLine2` / `headline` / `subheadline` ahora o en Fase 2?** Recomendación: mantenerlas en este cambio (Fase 0+1) para que el feature flag pueda alternar sin romper, y borrarlas en la PR de Fase 2 junto con `HeroFragment.tsx`. Esta decisión la cierra el `sdd-tasks` phase.

## 9. Skill Resolution

**`context7-strict` invoked** — `injected`. Contexto del proposal:

Este phase **NO escribe código**, solo arquitectura. Las verificaciones de Context7 se ejecutan en `sdd-design` y `sdd-apply`. Pre-anoto las queries que esos phases DEBEN correr antes de tocar implementación:

| Library | resolve-library-id | query-docs target |
|---------|---------------------|-------------------|
| `@react-three/fiber` | `/pmndrs/react-three-fiber` (probable) | "Canvas frameloop demand", "useFrame", "React 19 compat", "Next.js App Router dynamic import patterns" |
| `@react-three/drei` | `/pmndrs/drei` (probable) | "MeshTransmissionMaterial props transmission thickness ior chromaticAberration distortion temporalDistortion", "shaderMaterial onBeforeCompile" |
| `framer-motion` | `/framer/motion` o `/grx7/framer-motion` | "useScroll target offset", "useTransform", "v12 API changes" |
| `next` (Next.js 16) | `/vercel/next.js` | "dynamic import ssr false in Server Components", "App Router client component boundaries" |
| `next-intl` | `/amannn/next-intl` | "useTranslations server component vs client", "messages namespace 4.9" |

**Pre-resolutions ejecutadas en este proposal phase**: ninguna. La decisión de stack (r3f + drei) se basa en consenso técnico documentado del exploration phase y en la experiencia del orquestador. Las verificaciones de API se delegan a `sdd-design` y `sdd-apply` para no quemar tokens en este phase. Si el design phase descubre incompatibilidad, este proposal soporta el plan-B `ogl` documentado en §3.

---

**Phase status**: complete. Ready para `sdd-spec` y `sdd-design` (paralelizables).
