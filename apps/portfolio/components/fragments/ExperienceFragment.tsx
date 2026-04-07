"use client";

import React from "react";
import { motion } from "framer-motion";
import { Experience } from "@/types/sanity";
import { GlitchText } from "@/components/ui/GlitchText";
import { TelemetryHUD } from "@/components/ui/TelemetryHUD";

interface ExperienceFragmentProps {
  experience: Experience;
}

/**
 * ExperienceFragment Component
 * Reimagines job history as a cinematic 'Chrono Log' with HUD data and code stream background.
 */
export const ExperienceFragment = ({ experience }: ExperienceFragmentProps) => {
  return (
    <section className="stream-fragment flex items-center justify-center p-6 md:p-24 relative overflow-hidden bg-void">
      {/* Background Code Stream Decoration */}
      <div className="absolute top-0 right-0 h-full w-1/2 opacity-[0.03] font-mono text-[8px] md:text-[10px] text-white overflow-hidden pointer-events-none select-none leading-none z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap mb-1">
            {Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
          </div>
        ))}
      </div>

      <div className="w-full max-w-5xl z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="border-l-4 border-ember pl-8 md:pl-20 py-16 relative"
        >
          {/* Timeline Node Glow Indicator */}
          <div className="absolute top-0 left-0 -translate-x-[10px] w-4 h-4 bg-ember rounded-none shadow-[0_0_20px_rgba(255,42,0,1)]" />
          
          {/* HUD Metadata */}
          <TelemetryHUD data={experience} className="mb-10" />
          
          {/* Main Role Title */}
          <h3 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-[0.85] italic">
            <GlitchText text={experience.role} className="text-white" />
          </h3>
          
          {/* Company Context */}
          <div className="flex items-center gap-4 mb-12">
            <span className="w-12 h-[1px] bg-ember/40" />
            <div className="text-ember font-mono text-sm md:text-base tracking-[0.4em] uppercase font-bold">
              SYS_NODE: {experience.company}
            </div>
          </div>

          {/* Description / Log Entry */}
          <div className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-3xl border-t border-white/5 pt-10">
            <span className="text-white/60 font-mono text-xs block mb-4 uppercase tracking-widest">[LOG_ENTRY_DECRYPTED]</span>
            SECTOR_ANALYSIS: Strategic implementation of high-scale architectural protocols. Orchestrated complex data streams and optimized system-wide latency for mission-critical deployments.
          </div>
        </motion.div>
      </div>

      {/* Side HUD Telemetry */}
      <div className="absolute bottom-12 left-12 hidden lg:block font-mono text-[9px] text-white/10 tracking-[0.3em] uppercase rotate-90 origin-left">
        CHRONO_LOG_SYNC_STATE: 100%_STABLE
      </div>
    </section>
  );
};
