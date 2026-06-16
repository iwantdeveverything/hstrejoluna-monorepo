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
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { useHeroTier } from "@hstrejoluna/ui";
import { HeroGlassCss } from "./HeroGlassCss";
import { HeroVideoLayer } from "./HeroVideoLayer";

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

  if (tier === "static") return null;

  const isWebgl = tier === "css+webgl";

  // In the webgl tier, capture the live <video> on canplay so HeroGlassWebGL
  // can build the THREE.VideoTexture from it (design §8 t4). The css-only tier
  // refracts via the SVG filter and needs no element handle.
  const videoLayer = (
    <HeroVideoLayer
      isMobile={gates.isMobile}
      onVideoReady={isWebgl ? setVideoEl : undefined}
    />
  );

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {tier === "css-only" ? (
        // css-only tier: the SVG feDisplacementMap refracts the video element.
        // Phase 6 feeds HeroGlassCss `signals` (pointer/scroll/burst) at this
        // seam; Phase 4 mounts the refraction plumbing at rest.
        <HeroGlassCss>{videoLayer}</HeroGlassCss>
      ) : (
        videoLayer
      )}
      {isWebgl && videoEl ? (
        <WebGLChunkBoundary onError={reportWebglFailure}>
          <HeroGlassWebGL
            videoEl={videoEl}
            reportWebglFailure={reportWebglFailure}
          />
        </WebGLChunkBoundary>
      ) : null}
    </div>
  );
};
