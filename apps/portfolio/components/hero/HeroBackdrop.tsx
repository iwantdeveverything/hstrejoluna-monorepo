"use client";

/**
 * HeroBackdrop — the single client island that owns `useHeroTier()` and mounts
 * AT MOST ONE tier's layers (design §2 / §3, §8 load sequence):
 *
 *  - `static`     → null. The poster `<img>` is already SSR'd by HeroText, so
 *                   the island renders nothing (no video network request).
 *  - `css-only`   → HeroVideoLayer + CSS glass refraction (slice 4 seam).
 *  - `css+webgl`  → HeroVideoLayer + WebGL glass refraction (slice 5 seam).
 *
 * No component hardcodes `canRender`; output is a pure function of the gate.
 * The glass layers (css/webgl) land in slices 4–5 — this slice locks the
 * tier→layer mapping and the `null` static branch only.
 */
import { useHeroTier } from "@hstrejoluna/ui";
import { HeroVideoLayer } from "./HeroVideoLayer";

export const HeroBackdrop = () => {
  const { tier, gates } = useHeroTier();

  if (tier === "static") return null;

  // Both non-static tiers share the video layer. The glass refraction layer
  // (css `feDisplacementMap` in slice 4, R3F canvas in slice 5) wraps/overlays
  // this region — left as a clearly-marked seam so tests don't pin fake glass.
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <HeroVideoLayer isMobile={gates.isMobile} />
      {/* slice 4 seam: <HeroGlassCss />  (tier === "css-only") */}
      {/* slice 5 seam: <HeroGlassWebGL /> (tier === "css+webgl", next/dynamic ssr:false) */}
    </div>
  );
};
