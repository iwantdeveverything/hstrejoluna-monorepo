"use client";

import React from "react";
import { motion } from "framer-motion";
import { Profile } from "@/types/sanity";
import { GlitchText } from "@/components/ui/GlitchText";

interface HeroFragmentProps {
  profile: Profile | null;
}

/**
 * HeroFragment Component
 * The high-impact cinematic entry section of the portfolio.
 */
export const HeroFragment = ({ profile }: HeroFragmentProps) => {
  const nameParts = profile?.name?.split(" ") || ["SEBASTIÁN", "TREJO"];

  return (
    <section className="stream-fragment flex flex-col justify-center px-4 sm:px-6 md:px-24 relative bg-void overflow-hidden min-h-[100svh]">
      {/* Background Decorative Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,42,0,0.05)_0%,transparent_70%)]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 relative"
      >
        {/* System Status Header */}
        <div className="font-mono text-[10px] md:text-xs tracking-[0.5em] text-ember mb-8 uppercase flex items-center gap-4">
          <span className="w-8 h-[1px] bg-ember/30" />
          [SYSTEM_READY]: INITIALIZING_INTERFACE_V2.0
        </div>

        {/* Massive Typography Name */}
        <h1 className="text-[var(--text-fluid-hero)] font-black tracking-tighter leading-[0.85] uppercase flex flex-col items-start italic">
          {nameParts.map((part, i) => (
            <GlitchText 
              key={i} 
              text={part} 
              active={i === 0} 
              className={i === 1 ? "text-white/10 -mt-2 md:-mt-8" : "text-white"}
            />
          ))}
        </h1>

        {/* Headline / Bio */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row gap-12 items-start">
          <p className="text-lg md:text-2xl text-white/50 max-w-xl font-light leading-relaxed border-l border-ember/20 pl-6">
            {profile?.headline || "Software Architect specializing in Generative AI and Scalable Ecosystems."}
          </p>
          
          {/* Main CTA */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#FF2A00", color: "#000000" }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 border border-ember text-ember font-mono tracking-[0.3em] uppercase text-[10px] md:text-xs font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,42,0,0.15)] hover:shadow-[0_0_40px_rgba(255,42,0,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember focus-visible:outline-offset-8"
          >
            INITIATE CONNECTION
          </motion.button>
        </div>
      </motion.div>

      {/* Floating System Telemetry Corners */}
      <div className="absolute top-12 right-12 hidden lg:block font-mono text-[9px] text-white/20 tracking-[0.3em] text-right uppercase">
        <div className="mb-1">UPLINK_STATUS: OPTIMAL</div>
        <div className="mb-1">LATENCY: 0.0004MS</div>
        <div>ENCRYPTION: AES_256_ACTIVE</div>
      </div>

      <div className="absolute bottom-12 right-12 hidden lg:block font-mono text-[9px] text-white/20 tracking-[0.3em] text-right uppercase">
        <div className="mb-1">COORDS: 19.4326° N, 99.1332° W</div>
        <div>OS: OBSIDIAN_KERNEL_V4</div>
      </div>
    </section>
  );
};
