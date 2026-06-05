'use client';

import { useMemo } from 'react';

/**
 * Capability gate for Liquid Glass physics + WebGL.
 * Evaluates hardware and user preferences to determine if the heavy 
 * WebGL physics layer should mount.
 */
export function useHeroCapabilityGate() {
  const canRender = useMemo(() => {
    // 1. SSR Check
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    // 2. Feature Flag Check
    if (process.env.NEXT_PUBLIC_HERO_LIQUID === 'off') {
      return false;
    }

    // 2.5 Force Override via URL (for testing)
    if (window.location.search.includes('forceWebGL=true')) {
      return true;
    }

    // 3. WebGL2 Context Support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) return false;
    } catch (e) {
      return false;
    }

    // 4. Reduced Motion Preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    // 5. Reduced Data Preference
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) {
      return false;
    }

    // 6. Reduced Transparency Preference
    if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
      return false;
    }

    // 7. Mobile/Touch Device Check
    if (window.matchMedia('(pointer: coarse)').matches) {
      return false;
    }

    // 8. CPU Cores Capacity
    if ((navigator.hardwareConcurrency || 0) < 4) {
      return false;
    }

    // All gates passed
    return true;
  }, []);

  return { canRender };
}
