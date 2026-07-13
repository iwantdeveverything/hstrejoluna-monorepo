"use client";

/**
 * HeroBackdrop — the single client island that owns `useHeroTier()` and mounts
 * AT MOST ONE tier's layers (design §2 / §3, §8 load sequence):
 *
 *  - `static`     → null. The poster `<img>` is already SSR'd by HeroText, so
 *                   the island renders nothing (no video network request).
 *  - `css-only`   → HeroVideoLayer wrapped in HeroGlassCss SVG refraction.
 *  - `css+webgl`  → HeroVideoLayer + HeroGlassWebGL (R3F glass refracting the
 *                   live VideoTexture), mounted only after the video is ready.
 *
 * No component hardcodes `canRender`; output is a pure function of the gate.
 *
 * Lazy chunk boundary (design §7): HeroGlassWebGL is the SOLE
 * `next/dynamic(..., { ssr: false })` import — three/R3F/drei live ONLY in that
 * chunk, so `static` and `css-only` never request it. The chunk is loaded
 * lazily here AND mounting waits for `onVideoReady` (the VideoTexture needs a
 * live `<video>` element), per the §8 load sequence (t4: canplay → bind).
 */
import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useHeroTier } from "@hstrejoluna/ui";
import { HeroGlassCss } from "./HeroGlassCss";
import { HeroVideoLayer } from "./HeroVideoLayer";
import { triggerBurst, triggerClickBurst } from "./hero-burst-store";
import { useHeroPhysics } from "./use-hero-physics";

const HeroGlassWebGL = dynamic(
  () =>
    import(
      /* webpackChunkName: "hero-webgl-chunk" */ "./HeroGlassWebGL"
    ).then((mod) => mod.HeroGlassWebGL),
  { ssr: false },
);

/**
 * Build-time refraction flag (design #765, ADR-A). DEFAULT OFF: when the flag
 * is not exactly "true", every non-`static` tier renders the RAW video with no
 * SVG/WebGL refraction. `NEXT_PUBLIC_` inlines at build so this collapses to a
 * static literal in the client bundle — no runtime cost. Read ONLY here (the
 * presentation seam), never in `useHeroTier` (which stays a pure capability
 * detector). Independent of the `NEXT_PUBLIC_HERO_LIQUID` kill switch: liquid
 * off still forces the static poster; refraction off only strips the glass.
 */
const refractionEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_HERO_REFRACTION === "true" &&
  process.env.NEXT_PUBLIC_HERO_LIQUID === "true";

/**
 * Chunk-load boundary for the lazy WebGL glass. `next/dynamic` exposes no
 * `onError`, and HeroGlassWebGL's own WebGLErrorBoundary only catches render
 * errors AFTER the component mounts — a failed chunk fetch throws BEFORE that,
 * which would otherwise crash the whole hero tree. This parent boundary absorbs
 * the load failure, latches the gate demotion to css-only, and renders nothing
 * (the css video layer beneath it stays painted).
 */
class WebGLChunkBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export const HeroBackdrop = () => {
  const { tier, gates, reportWebglFailure } = useHeroTier();
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  // Phase 6 physics orchestrator. Motion prefs are centralized in the gate
  // (design §3): the pointer hook is disabled under reduce-motion. The hook is
  // ALWAYS called (Rules of Hooks) — the early `static` return is below it.
  // When refraction is off nothing consumes the pointer/scroll uniforms, so we
  // pass `enabled: false` to keep the listeners inert (design ADR-B); the hook
  // itself must still be invoked to preserve hook order across flag states.
  const refractionOn = refractionEnabled();
  const motionEnabled = !gates.reduceMotion;
  const physicsEnabled = motionEnabled && refractionOn;
  const { heroRef, pointerRef, scrollRef, burstRef, burst, setInView } =
    useHeroPhysics({ enabled: physicsEnabled });

  // Fire the entrance burst once on video-ready (design §4.4; the store latches
  // so remounts never replay). The burst latch stays wired even with refraction
  // off (harmless no-op — no shader consumes it — but preserves the video
  // contract). Capture the live <video> for the WebGL tier ONLY when refraction
  // is on; otherwise no WebGL glass mounts.
  const isWebgl = tier === "css+webgl" && refractionOn;
  const onVideoReady = useCallback(
    (el: HTMLVideoElement) => {
      triggerBurst();
      if (isWebgl) setVideoEl(el);
    },
    [isWebgl],
  );

  // IntersectionObserver gates scroll updates: `uScroll` SHALL NOT update while
  // the hero is off-viewport (spec). Observes the hero root via heroRef.
  useEffect(() => {
    const target = heroRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [heroRef, setInView]);

  if (tier === "static") return null;

  const videoLayer = (
    <HeroVideoLayer isMobile={gates.isMobile} onVideoReady={onVideoReady} />
  );

  return (
    <div
      ref={heroRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      // Capped click re-burst (design §4.4). pointer-events are none on this
      // layer, so the click is captured at the section level via bubbling; the
      // handler is cheap and idempotent against the latched entrance burst.
      onClick={motionEnabled ? () => triggerClickBurst() : undefined}
    >
      {tier === "css-only" && refractionOn ? (
        // css-only tier (refraction ON): the SVG feDisplacementMap refracts the
        // video element. The rAF bridge reads the physics refs each frame (refs
        // don't re-render) and drives the live scale + `--mx/--my` CSS vars.
        // `signals` seeds the rest-state scale before the first frame / when
        // disabled. When refraction is OFF this branch is skipped and the raw
        // videoLayer renders instead (no HeroGlassCss wrap, no SVG filter).
        <HeroGlassCss
          signals={{ burst }}
          refraction={{
            enabled: motionEnabled,
            pointerRef,
            scrollRef,
            burstRef,
          }}
        >
          {videoLayer}
        </HeroGlassCss>
      ) : (
        videoLayer
      )}
      {isWebgl && videoEl ? (
        <WebGLChunkBoundary onError={reportWebglFailure}>
          <HeroGlassWebGL
            videoEl={videoEl}
            reportWebglFailure={reportWebglFailure}
            pointerRef={pointerRef}
            scrollRef={scrollRef}
            burstRef={burstRef}
          />
        </WebGLChunkBoundary>
      ) : null}
    </div>
  );
};
