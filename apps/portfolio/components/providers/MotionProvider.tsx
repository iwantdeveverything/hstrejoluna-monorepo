"use client";

/**
 * <MotionProvider />
 *
 * Thin client boundary around Framer Motion's `LazyMotion`. Wrapping the
 * locale layout subtree once with `LazyMotion features={domAnimation} strict`
 * keeps the bundle on the small `domAnimation` feature pack (REQ-6 S6.3).
 * `strict` causes Framer Motion to throw if a `motion.*` component requires
 * a feature that has not been loaded — surfacing accidental regressions to
 * `domMax` early in development.
 *
 * Mounted from `app/[locale]/layout.tsx` exactly once per locale tree.
 */
import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

interface MotionProviderProps {
  readonly children: ReactNode;
}

export const MotionProvider = ({ children }: MotionProviderProps) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);

export default MotionProvider;
