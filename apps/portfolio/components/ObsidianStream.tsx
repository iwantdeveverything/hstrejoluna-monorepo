"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Profile, Project, Skill, Experience } from "@/types/sanity";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { HeroFragment } from "./fragments/HeroFragment";
import { ProjectFragment } from "./fragments/ProjectFragment";
import { ExperienceFragment } from "./fragments/ExperienceFragment";
import { SkillsFragment } from "./fragments/SkillsFragment";
import { GlassNav } from "./ui/GlassNav";

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

  // Enable keyboard navigation
  useKeyboardNav(containerRef);

  // Disable parallax if reduced motion is requested
  const backgroundX = useTransform(
    scrollXProgress, 
    [0, 1], 
    isReducedMotion ? ["0%", "0%"] : ["5%", "-30%"]
  );

  return (
    <div className="relative bg-background w-full h-screen overflow-hidden font-sans">
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
        <footer aria-label="Site Footer" className="stream-fragment flex flex-col items-center justify-center p-6 bg-background relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,0,0.03)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="text-center z-10 w-full max-w-sm">
            <div className="font-mono text-[10px] md:text-xs tracking-[0.6em] text-primary mb-12 uppercase opacity-50">
              [EOF]: END_OF_STREAM_TRANSMISSION
            </div>
            <h2 className="text-6xl md:text-fluid-hero font-black uppercase tracking-tighter mb-16 leading-none italic text-white/10 hover:text-white transition-colors duration-1000 cursor-default">
              EXIT_SYS
            </h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center">
              <button 
                onClick={() => containerRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' })}
                className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 border border-white/5 text-white/50 font-mono tracking-[0.3em] uppercase text-[10px] hover:border-primary hover:text-primary transition-all duration-300 bg-white/[0.01]"
                aria-label="Back to top"
              >
                [REBOOT_STREAM]
              </button>
              <a 
                href={`mailto:${profile?.socials?.find(s => s.platform.toLowerCase() === 'email')?.url || ''}`}
                className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-primary text-background font-mono tracking-[0.3em] uppercase text-[10px] font-bold hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(255,42,0,0.3)]"
                aria-label="Send an email to contact"
              >
                [SEND_SIGNAL]
              </a>
            </div>
            
            {/* Mobile Footer Socials */}
            <nav className="mt-16 flex gap-6 items-center justify-center md:hidden font-mono text-[10px] text-white/50 tracking-[0.2em] uppercase" aria-label="Mobile Social Uplinks">
              {profile?.socials?.map(s => (
                <a 
                  key={s.url} 
                  href={s.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary p-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {s.platform}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </main>

      {/* Persistent Global HUD Overlays */}
      <header className="fixed top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-primary animate-ping" aria-hidden="true" />
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
              className="hover:text-primary pointer-events-auto transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
            >
              {s.platform}
            </a>
          ))}
        </nav>
      </footer>

      {/* Floating Glass Navigation */}
      <GlassNav />

      {/* Global Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-[100] bg-white/5 hidden md:block">
        <motion.div 
          className="h-full bg-primary origin-left"
          style={{ scaleX: scrollXProgress }} 
        />
      </div>
    </div>
  );
};
