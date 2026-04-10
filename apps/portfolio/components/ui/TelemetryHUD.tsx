"use client";

import React from "react";
import { Project, Experience } from "@/types/sanity";

interface TelemetryHUDProps {
  data: Project | Experience;
  className?: string;
}

/**
 * TelemetryHUD Component
 * Displays technical metadata in a HUD-style layout for Projects and Experiences.
 */
export const TelemetryHUD = ({ data, className = "" }: TelemetryHUDProps) => {
  // Type guard to check if data is a Project
  const isProject = (item: any): item is Project => 'slug' in item || 'techStack' in item;
  
  const formatDate = (dateStr: string) => {
    return dateStr.replace(/-/g, ".");
  };

  return (
    <div className={`font-mono text-[10px] sm:text-xs tracking-[0.2em] text-white/40 uppercase space-y-1 sm:space-y-2 ${className}`}>
      {/* Identifier Line */}
      <div className="flex items-center gap-2">
        <span className="text-ember shrink-0 font-bold">[ID_REF]</span>
        <span className="truncate border-b border-white/5 pb-0.5">
          {isProject(data) ? (data.slug?.current || "PROJECT_UNDEFINED") : (data.company || "ENTITY_UNDEFINED")}
        </span>
      </div>

      {/* Conditional Stack or Date Line */}
      {isProject(data) ? (
        <div className="flex items-center gap-2">
          <span className="text-ember shrink-0 font-bold">[STK_VAL]</span>
          <span className="truncate border-b border-white/5 pb-0.5 w-full max-w-[200px]">
             {data.techStack && data.techStack.length > 0 
                ? data.techStack.filter(Boolean).map(s => s.name).join(" / ")
                : "N/A_STACK_PENDING"
             }
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-ember shrink-0 font-bold">[T-MINUS]</span>
          <span className="truncate border-b border-white/5 pb-0.5">
            {formatDate(data.startDate)} // {data.isCurrent ? "PRESENT" : (data.endDate ? formatDate(data.endDate) : "STABLE")}
          </span>
        </div>
      )}

      {/* System Status Line */}
      <div className="flex items-center gap-2">
        <span className="text-ember shrink-0 font-bold">[STATUS]</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ember rounded-full animate-pulse shadow-[0_0_8px_rgba(255,42,0,0.8)]" />
          {isProject(data) ? "PROD_LIVE" : "ACTIVE_OPS"}
        </span>
      </div>
    </div>
  );
};
