import React from 'react';

interface HudChipProps {
  children: React.ReactNode;
  className?: string;
}

export const HudChip = ({ children, className = '' }: HudChipProps) => {
  return (
    <span className={`inline-flex items-center bg-surface_container_highest border-l-2 border-primary px-3 py-1.5 text-label-sm font-mono uppercase tracking-widest text-on_surface_variant rounded-none ${className}`}>
      {children}
    </span>
  );
};
