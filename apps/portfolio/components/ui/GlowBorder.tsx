import React from "react";

interface GlowBorderProps {
  children: React.ReactNode;
  glowColor?: string;
  glowIntensity?: string;
  className?: string;
}

export const GlowBorder = ({ 
  children, 
  glowColor = "var(--color-primary)", 
  glowIntensity = "0 0 15px", 
  className = "" 
}: GlowBorderProps) => {
  return (
    <div 
      className={`group relative rounded-lg overflow-hidden ${className}`}
      style={{
        boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.1)`
      }}
    >
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `${glowIntensity} ${glowColor}`,
          zIndex: 10,
          mixBlendMode: "screen",
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};