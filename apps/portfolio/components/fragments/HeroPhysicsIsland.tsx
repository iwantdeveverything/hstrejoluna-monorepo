'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { LazyMotion, domAnimation, m, useSpring, useMotionValueEvent } from 'framer-motion';
import { useHeroCapabilityGate } from '../../lib/use-liquid-glass-gates';
import { setupHeroCursorField } from '../../lib/hero-cursor-field';
import { HeroRefractionFilter } from '../filter-defs';

// The WebGL scene is dynamically imported, client-only.
const HeroRefractionScene = dynamic(
  () => import('./HeroRefractionScene').then((mod) => mod.default),
  { ssr: false }
);

export function HeroPhysicsIsland() {
  const canRender = true;
  const islandRef = useRef<HTMLDivElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  // Entrance burst
  const burstSpring = useSpring(100, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (canRender) {
      // Trigger burst down to normal (0 or low value)
      burstSpring.set(0);
    }
  }, [canRender, burstSpring]);

  useMotionValueEvent(burstSpring, 'change', (v) => {
    if (displacementRef.current) {
      displacementRef.current.setAttribute('scale', String(v));
    }
  });

  useEffect(() => {
    if (canRender && islandRef.current) {
      return setupHeroCursorField(islandRef.current);
    }
  }, [canRender]);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        ref={islandRef}
        className="absolute inset-0 z-[1] overflow-hidden pointer-events-none"
        data-webgl="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <HeroRefractionFilter ref={displacementRef} />
        {canRender && <HeroRefractionScene />}
      </m.div>
    </LazyMotion>
  );
}
