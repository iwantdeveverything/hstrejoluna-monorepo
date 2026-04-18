"use client";

import { useEffect, useState } from "react";

/**
 * useReducedMotion Hook
 * Detects if the user has enabled 'prefers-reduced-motion' in their system settings.
 * Useful for disabling heavy animations, glitches, and parallax for accessibility.
 */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    // Listen for changes
    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return reducedMotion;
}
