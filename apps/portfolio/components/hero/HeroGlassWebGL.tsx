"use client";

/**
 * HeroGlassWebGL — the SOLE three/R3F/drei chunk boundary (design §7) and the
 * `css+webgl` tier glass (design §4 frameloop policy, ADR-2; spec: Video
 * Refraction, GPU Lifecycle).
 *
 * This module is imported ONLY via `next/dynamic(..., { ssr: false })` from
 * HeroBackdrop, so three/R3F live exclusively in this lazy chunk — the
 * `static` and `css-only` tiers never request it.
 *
 * Frameloop policy (ADR-2): `frameloop="always"` while the hero is in viewport
 * (video refraction needs a frame per video frame anyway), switching to
 * `"demand"` when an IntersectionObserver reports the hero off-screen — same
 * idle cost as demand-mode without the frozen-pointer bug class. The observer
 * is disconnected on unmount.
 *
 * Resilience: if WebGL context creation / shader compilation throws, an error
 * boundary calls `reportWebglFailure()` (the gate latches and demotes the tier
 * to css-only on the next render) and this layer renders nothing.
 */
import { Canvas } from "@react-three/fiber";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from "react";

import { HeroRefractionScene } from "./HeroRefractionScene";

export interface HeroGlassWebGLProps {
  /** The hero `<video>` — source for the THREE.VideoTexture. */
  videoEl: HTMLVideoElement;
  /** Gate callback: latch a WebGL failure → demote to css-only. */
  reportWebglFailure: () => void;
}

const canvasStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

/**
 * Error boundary around the R3F tree. A thrown WebGL context/compile error is
 * reported to the gate (demotion) and the subtree is replaced with nothing.
 */
class WebGLErrorBoundary extends Component<
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

export const HeroGlassWebGL = ({
  videoEl,
  reportWebglFailure,
}: HeroGlassWebGLProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inViewport, setInViewport] = useState(true);

  // IntersectionObserver toggles the frameloop; disconnected on unmount.
  useEffect(() => {
    const target = rootRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setInViewport(entry.isIntersecting);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      data-hero-glass-webgl=""
      style={canvasStyle}
      aria-hidden="true"
    >
      <WebGLErrorBoundary onError={reportWebglFailure}>
        <Canvas
          frameloop={inViewport ? "always" : "demand"}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          style={canvasStyle}
        >
          <HeroRefractionScene videoEl={videoEl} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};

export default HeroGlassWebGL;
