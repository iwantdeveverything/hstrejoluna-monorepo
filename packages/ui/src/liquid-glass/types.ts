/**
 * Public types for the LiquidGlass primitive.
 *
 * Phase 3 introduces the polymorphic `LiquidGlassProps<T>` per design §4 /
 * ADR-7. Styling stays data-attribute driven: most variant×intensity
 * branching collapses into 5 + 3 selectors instead of an N×M class matrix.
 */
import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
  Ref,
} from "react";

export type LiquidGlassVariant =
  | "panel"
  | "pill"
  | "dock"
  | "circle"
  | "dialog";

export type LiquidGlassIntensity = "low" | "med" | "high";

export interface LiquidGlassOwnProps {
  /** Required surface variant — drives geometry, radius, and filter id. */
  variant: LiquidGlassVariant;
  /** Optional intensity tier. Default: 'med'. */
  intensity?: LiquidGlassIntensity;
  /** Optional extra class string — merged with internal classes via `cn`. */
  className?: string;
  /** Children. Optional for decorative `circle` overlays. */
  children?: ReactNode;
}

type AsProp<T extends ElementType> = { as?: T };

type PolymorphicRef<T extends ElementType> = Ref<
  T extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[T]
    : Element
>;

/**
 * Polymorphic props: keeps every native attribute of the resolved element
 * type-safe (S1.5). The caller picks the element via `as` (default 'div').
 */
export type LiquidGlassProps<T extends ElementType = "div"> =
  LiquidGlassOwnProps &
    AsProp<T> &
    Omit<
      ComponentPropsWithoutRef<T>,
      keyof LiquidGlassOwnProps | "as" | "ref"
    > & {
      ref?: PolymorphicRef<T>;
    };
