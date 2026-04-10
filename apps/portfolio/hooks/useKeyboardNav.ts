"use client";

import { useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * useKeyboardNav Hook
 * Enables horizontal keyboard navigation via ArrowLeft and ArrowRight keys.
 * Respects 'prefers-reduced-motion'.
 */
export function useKeyboardNav(containerRef: React.RefObject<HTMLElement | null>) {
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!containerRef.current) return;

      const scrollAmount = window.innerWidth * 0.8; // Scroll almost a full screen
      const behavior = isReducedMotion ? "auto" : "smooth";

      if (e.key === "ArrowRight") {
        e.preventDefault();
        containerRef.current.scrollBy({ left: scrollAmount, behavior });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        containerRef.current.scrollBy({ left: -scrollAmount, behavior });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, isReducedMotion]);
}
