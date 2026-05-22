/**
 * Public barrel for the Liquid Glass primitive (REQ-1, REQ-2, REQ-6).
 *
 * Apps import the primitive from `@hstrejoluna/ui/liquid-glass` (or via the
 * package root re-export). The CSS contract is shipped as a side-effect
 * import from `@hstrejoluna/ui/styles/liquid-glass.css` — apps must include
 * it once (typically alongside `@hstrejoluna/ui/styles/tokens.css`).
 */
export { LiquidGlass } from "./LiquidGlass";
export { LiquidGlassFilters } from "./LiquidGlassFilters";
export {
  LG_VARIANTS,
  LG_FILTER_IDS,
} from "./filter-defs";
export {
  useLiquidGlassGates,
  LIQUID_GLASS_SSR_DEFAULTS,
  type LiquidGlassGates,
} from "./use-liquid-glass-gates";
export type {
  LiquidGlassVariant,
  LiquidGlassIntensity,
  LiquidGlassOwnProps,
  LiquidGlassProps,
} from "./types";
