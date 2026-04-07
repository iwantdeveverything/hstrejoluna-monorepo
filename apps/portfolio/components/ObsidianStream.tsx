"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Profile, Project, Skill, Experience } from "@/types/sanity";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HeroFragment } from "./fragments/HeroFragment";
import { ProjectFragment } from "./fragments/ProjectFragment";
import { ExperienceFragment } from "./fragments/ExperienceFragment";
import { SkillsFragment } from "./fragments/SkillsFragment";

interface ObsidianStreamProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
}

/**
 * ObsidianStream Component
 * The main orchestrator for the horizontal/vertical cinematic experience.
 * Fully accessible with reduced-motion support and ARIA semantic structure.
 */
export const ObsidianStream = ({ profile, projects, skills, experiences }: ObsidianStreamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  
  // Parallax orchestration for background layers
  const { scrollXProgress } = useScroll({
    container: containerRef,
  });

  // Disable parallax if reduced motion is requested
  const backgroundX = useTransform(
    scrollXProgress, 
    [0, 1], 
    isReducedMotion ? ["0%", "0%"] : ["5%", "-30%"]
  );

  return (
    <div className="relative bg-void w-full h-screen overflow-hidden font-sans">
      {/* Cinematic Background Parallax Text Layer */}
      <motion.div 
        style={{ x: backgroundX }}
        className="fixed inset-0 z-0 flex items-center whitespace-nowrap pointer-events-none select-none will-change-transform"
        aria-hidden="true"
      >
        <span className="text-[25vw] font-black text-white/[0.02] uppercase leading-none pr-[50vw] italic text-nowrap">
          {profile?.name || "SEBASTIÁN TREJO"}
        </span>
        <span className="text-[25vw] font-black text-white/[0.02] uppercase leading-none pr-[50vw] italic text-nowrap">
          FRONTEND_ARCHITECTURE
        </span>
        <span className="text-[25vw] font-black text-white/[0.02] uppercase leading-none italic text-nowrap">
          SYSTEM_SYNCHRONIZED
        </span>
      </motion.div>

      {/* Main Panoramic/Vertical Stream Container */}
      <main 
        ref={containerRef}
        className="stream-container relative z-10"
        role="main"
        aria-label="Portfolio Stream"
      >
        {/* SECTION 01: HERO */}
        <HeroFragment profile={profile} />

        {/* SECTION 02: FEATURED PROJECTS */}
        {projects.map((project, idx) => (
          <ProjectFragment key={project._id} project={project} index={idx} />
        ))}

        {/* SECTION 03: EXPERIENCE CHRONO LOG */}
        {experiences.map((exp) => (
          <ExperienceFragment key={exp._id} experience={exp} />
        ))}

        {/* SECTION 04: NEURAL SKILL MAP */}
        <SkillsFragment skills={skills} />
        
        {/* SECTION 05: SYSTEM DISCONNECT (Footer) */}
        <section className="stream-fragment flex flex-col items-center justify-center p-6 bg-void relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,0,0.03)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="text-center z-10">
            <div className="font-mono text-[10px] md:text-xs tracking-[0.6em] text-ember mb-12 uppercase opacity-50">
              [EOF]: END_OF_STREAM_TRANSMISSION
            </div>
            <h2 className="text-6xl md:text-[12rem] font-black uppercase tracking-tighter mb-16 leading-none italic text-white/10 hover:text-white transition-colors duration-1000 cursor-default">
              EXIT_SYS
            </h2>
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <button 
                onClick={() => containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' })}
                className="px-12 py-5 border border-white/5 text-white/30 font-mono tracking-[0.3em] uppercase text-[10px] hover:border-ember hover:text-ember transition-all duration-300 bg-white/[0.01]"
                aria-label="Back to top"
              >
                [REBOOT_STREAM]
              </button>
              <a 
                href={`mailto:${profile?.socials?.find(s => s.platform.toLowerCase() === 'email')?.url || ''}`}
                className="px-12 py-5 bg-ember text-void font-mono tracking-[0.3em] uppercase text-[10px] font-bold hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(255,42,0,0.3)]"
                aria-label="Send an email to contact"
              >
                [SEND_SIGNAL]
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Persistent Global HUD Overlays */}
      <header className="fixed top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-ember animate-ping" aria-hidden="true" />
          <div className="font-mono text-[10px] text-white/60 tracking-[0.5em] uppercase border-l border-white/20 pl-4">
            ARCH_OS // V.4.0.1_STABLE
          </div>
        </div>
      </header>

      {/* Global Navigation HUD (Right Side) */}
      <nav className="fixed top-1/2 right-8 md:right-12 -translate-y-1/2 z-50 flex flex-col gap-6 items-center" aria-label="Quick Navigation">
        <div className="h-20 w-[1px] bg-white/10" aria-hidden="true" />
        <div className="font-mono text-[9px] text-white/20 tracking-[0.3em] uppercase [writing-mode:vertical-lr] rotate-180">
          SCROLL_TO_EXPLORE
        </div>
        <div className="h-20 w-[1px] bg-white/10" aria-hidden="true" />
      </nav>

      {/* Social Uplinks (Bottom HUD) */}
      <footer className="fixed bottom-8 left-8 md:bottom-12 md:left-12 z-50 hidden md:block">
        <nav className="flex gap-10 items-center font-mono text-[9px] text-white/30 tracking-[0.4em] uppercase" aria-label="Social Uplinks">
          {profile?.socials?.map(s => (
            <a 
              key={s.url} 
              href={s.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-ember pointer-events-auto transition-colors"
            >
              {s.platform}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
};
