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
  () => import("./HeroGlassWebGL").then((mod) => mod.HeroGlassWebGL),
  { ssr: false },
);

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
  // always called (Rules of Hooks) — the early `static` return is below it.
  const motionEnabled = !gates.reduceMotion;
  const { heroRef, pointerRef, scrollRef, burstRef, burst, setInView } =
    useHeroPhysics({ enabled: motionEnabled });

  // Fire the entrance burst once on video-ready (design §4.4; the store latches
  // so remounts never replay). Capture the live <video> for the WebGL tier.
  const isWebgl = tier === "css+webgl";
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
      {tier === "css-only" ? (
        // css-only tier: the SVG feDisplacementMap refracts the video element.
        // The rAF bridge reads the physics refs each frame (refs don't
        // re-render) and drives the live scale + `--mx/--my` CSS vars. `signals`
        // seeds the rest-state scale before the first frame / when disabled.
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
