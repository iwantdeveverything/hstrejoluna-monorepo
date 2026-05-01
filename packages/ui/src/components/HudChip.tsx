import React from 'react';
import { LiquidGlass } from '../liquid-glass';

interface HudChipProps {
  children: React.ReactNode;
  className?: string;
}

export const HudChip = ({ children, className = '' }: HudChipProps) => {
  return (
    <LiquidGlass
      as="span"
      variant="pill"
      intensity="low"
      className={`inline-flex items-center border-l-2 border-primary px-3 py-1.5 text-label-sm font-mono uppercase tracking-widest text-on_surface_variant rounded-none ${className}`}
    >
      {children}
    </LiquidGlass>
  );
};
