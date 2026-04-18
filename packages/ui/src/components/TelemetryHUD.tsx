"use client";

import React from "react";

export interface TelemetryHUDProps {
  identifier: string; // e.g., slug.current or company name
  status: "LIVE" | "ACTIVE_OPS" | string;
  techStack?: string[]; // Array of technology names
  dateRange?: string; // Formatted date string
  className?: string;
}

/**
 * TelemetryHUD Component
 * Displays technical metadata in a HUD-style layout for Projects and Experiences.
 */
export const TelemetryHUD = ({ 
  identifier,
  status,
  techStack,
  dateRange,
  className = "" 
}: TelemetryHUDProps) => {
  const isProject = techStack !== undefined;

  return (
    <div className={`font-mono text-[10px] sm:text-xs tracking-[0.2em] text-white/40 uppercase space-y-1 sm:space-y-2 ${className}`}>
      {/* Identifier Line */}
      <div className="flex items-center gap-2">
        <span className="text-ember shrink-0 font-bold">[ID_REF]</span>
        <span className="truncate border-b border-white/5 pb-0.5">
          {identifier}
        </span>
      </div>

      {/* Conditional Stack or Date Line */}
      {isProject ? (
        <div className="flex items-center gap-2">
          <span className="text-ember shrink-0 font-bold">[STK_VAL]</span>
          <span className="truncate border-b border-white/5 pb-0.5 w-full max-w-[200px]">
             {techStack && techStack.length > 0 
                ? techStack.join(" / ")
                : "N/A_STACK_PENDING"
             }
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-ember shrink-0 font-bold">[T-MINUS]</span>
          <span className="truncate border-b border-white/5 pb-0.5">
            {dateRange}
          </span>
        </div>
      )}

      {/* System Status Line */}
      <div className="flex items-center gap-2">
        <span className="text-ember shrink-0 font-bold">[STATUS]</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ember rounded-full animate-pulse shadow-[0_0_8px_rgba(255,42,0,0.8)]" />
          {status}
        </span>
      </div>
    </div>
  );
};
