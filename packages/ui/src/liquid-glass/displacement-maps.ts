/**
 * Inline displacement-map data URLs for the <feDisplacementMap> reference
 * image of each LiquidGlass variant. Each map is a tiny SVG that paints a
 * red/green normal-map gradient (R = x-displacement, G = y-displacement)
 * over the variant's geometry profile.
 *
 * Runtime cost: zero extra HTTP — these are inlined as `data:` URLs.
 * Animation cost: zero per-frame — the map is mounted once and the only
 * mutated attribute is `<feDisplacementMap scale>` (REQ-6, S6.1, S6.2).
 *
 * Profiles per design §3:
 *  - panel:  gentle convex squircle
 *  - pill:   strong horizontal lens
 *  - dock:   wide convex bar
 *  - circle: radial sphere
 *  - dialog: gentle convex (same family as panel, larger feather)
 */
import type { LiquidGlassVariant } from "./types";

const encode = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

const panelSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="rgb(128,128,0)" />
      <stop offset="100%" stop-color="rgb(255,0,0)" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)" />
</svg>
`;

const pillSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="rgb(255,128,0)" />
      <stop offset="50%" stop-color="rgb(128,128,0)" />
      <stop offset="100%" stop-color="rgb(0,128,0)" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)" />
</svg>
`;

const dockSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(128,255,0)" />
      <stop offset="50%" stop-color="rgb(128,128,0)" />
      <stop offset="100%" stop-color="rgb(128,0,0)" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)" />
</svg>
`;

const circleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgb(128,128,0)" />
      <stop offset="80%" stop-color="rgb(255,0,0)" />
      <stop offset="100%" stop-color="rgb(255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)" />
</svg>
`;

const dialogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="rgb(128,128,0)" />
      <stop offset="100%" stop-color="rgb(200,40,40)" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)" />
</svg>
`;

export const LG_DISPLACEMENT_MAPS: Readonly<
  Record<LiquidGlassVariant, string>
> = Object.freeze({
  panel: encode(panelSvg),
  pill: encode(pillSvg),
  dock: encode(dockSvg),
  circle: encode(circleSvg),
  dialog: encode(dialogSvg),
});
