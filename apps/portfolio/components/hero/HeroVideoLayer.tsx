"use client";

/**
 * HeroVideoLayer — self-hosted background `<video>` (design §2, §5, §8).
 *
 * Poster-first contract (spec: Poster-First Delivery):
 *  - `<video autoplay muted loop playsinline preload="none" poster aria-hidden>`
 *  - renders with NO `<source>` children until idle, so the browser issues
 *    ZERO video network requests before `requestIdleCallback`
 *    (fallback `setTimeout(…, 2000)`).
 *  - after idle: injects AV1/WebM first, H.264 MP4 second, then `video.load()`.
 *  - mobile rendition (720) chosen from the gate-fed `isMobile` fact (ADR-5),
 *    NOT a `<source media>` attribute.
 *  - emits `onVideoReady(videoEl)` on `canplay`.
 *
 * Same-origin only: every media path is `/`-rooted under
 * `apps/portfolio/public` (CSP `default-src 'self'`).
 */
import {
  useEffect,
  useRef,
  useState,
  type Ref,
} from "react";

const POSTER_SRC = "/hero-poster.jpg";
const IDLE_FALLBACK_MS = 2000;

interface VideoSource {
  src: string;
  type: string;
}

/** AV1/WebM first, H.264 MP4 second; rendition picked from the viewport fact. */
const renditionSources = (isMobile: boolean): VideoSource[] => {
  const size = isMobile ? "720" : "1080";
  return [
    { src: `/hero-loop-${size}.webm`, type: "video/webm" },
    { src: `/hero-loop-${size}.mp4`, type: "video/mp4" },
  ];
};

export interface HeroVideoLayerProps {
  /** Fired once on `canplay` with the live video element. */
  onVideoReady?: (el: HTMLVideoElement) => void;
  /** Forwarded ref so parent tiers (WebGL VideoTexture) can read the element. */
  videoRef?: Ref<HTMLVideoElement>;
  /** Gate-fed viewport fact — selects the 720 rendition when true (ADR-5). */
  isMobile?: boolean;
}

/** Schedule on idle; fall back to a timeout when rIC is unavailable. */
const scheduleIdle = (cb: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(cb);
    return () => window.cancelIdleCallback?.(handle);
  }
  const timer = window.setTimeout(cb, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(timer);
};

export const HeroVideoLayer = ({
  onVideoReady,
  videoRef,
  isMobile = false,
}: HeroVideoLayerProps) => {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const [sources, setSources] = useState<VideoSource[]>([]);

  useEffect(() => {
    const cancel = scheduleIdle(() => {
      setSources(renditionSources(isMobile));
    });
    return cancel;
  }, [isMobile]);

  // Attach the freshly-injected sources to the element and start loading.
  useEffect(() => {
    if (sources.length === 0) return;
    localRef.current?.load();
  }, [sources]);

  const assignRef = (el: HTMLVideoElement | null) => {
    localRef.current = el;
    if (typeof videoRef === "function") {
      videoRef(el);
    } else if (videoRef) {
      (videoRef as { current: HTMLVideoElement | null }).current = el;
    }
  };

  return (
    <video
      ref={assignRef}
      className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={POSTER_SRC}
      aria-hidden="true"
      onCanPlay={(event) => onVideoReady?.(event.currentTarget)}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
};
