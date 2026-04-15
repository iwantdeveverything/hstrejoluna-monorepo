"use client";

import { useEffect, useRef, useState } from "react";

export const useAutoHideNavigation = (
  enabled: boolean,
  deltaThreshold: number = 8
) => {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsHidden(false);
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;

        if (Math.abs(delta) >= deltaThreshold) {
          if (currentY <= 48) {
            setIsHidden(false);
          } else {
            setIsHidden(delta > 0);
          }

          lastScrollYRef.current = currentY;
        }

        frameRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [deltaThreshold, enabled]);

  return isHidden;
};
