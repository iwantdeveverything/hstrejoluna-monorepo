"use client";

/**
 * HeroBackdrop — the single client island that owns `useHeroTier()` and mounts
 * AT MOST ONE tier's layers (design §2 / §3, §8 load sequence):
 *
 *  - `static`     → null. The poster `<img>` is already SSR'd by HeroText, so
 *                   the island renders nothing (no video network request).
 *  - `css-only`   → HeroVideoLayer wrapped in HeroGlassCss SVG refraction.
 *  - `css+webgl`  → HeroVideoLayer + WebGL glass refraction (slice 5 seam).
 *
 * No component hardcodes `canRender`; output is a pure function of the gate.
 * The css-only glass landed in slice 4; the webgl glass lands in slice 5 —
 * this island locks the tier→layer mapping and the `null` static branch.
 */
import { useHeroTier } from "@hstrejoluna/ui";
import { HeroGlassCss } from "./HeroGlassCss";
import { HeroVideoLayer } from "./HeroVideoLayer";

export const HeroBackdrop = () => {
  const { tier, gates } = useHeroTier();

  if (tier === "static") return null;

  const videoLayer = <HeroVideoLayer isMobile={gates.isMobile} />;

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
      {/* slice 5 seam: <HeroGlassWebGL /> (tier === "css+webgl", next/dynamic ssr:false) */}
    </div>
  );
};
