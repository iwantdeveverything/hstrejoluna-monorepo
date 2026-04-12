"use client";

import React, { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Profile, Project, Skill, Experience } from "@/types/sanity";
import { HeroFragment } from "./fragments/HeroFragment";
import { ProjectsOverview } from "./fragments/ProjectsOverview";
import { ExperienceOverview } from "./fragments/ExperienceOverview";
import { SkillsOverview } from "./fragments/SkillsOverview";
import { SectionDock } from "./ui/SectionDock";
import { CommandNav } from "./ui/CommandNav";
import { motion, useScroll, useTransform } from "framer-motion";

interface ObsidianStreamProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
}

export const ObsidianStream = ({ profile, projects, skills, experiences }: ObsidianStreamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  const sectionIds = ['hero', 'projects', 'experience', 'skills'];
  const activeId = useActiveSection(sectionIds, 0.4);

  const { scrollYProgress } = useScroll();

  const backgroundY = useTransform(
    scrollYProgress, 
    [0, 1], 
    isReducedMotion ? ["0%", "0%"] : ["5%", "-30%"]
  );

  return (
    <div className="relative bg-background w-full min-h-screen font-sans overflow-x-hidden">
      {/* Background layer */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 z-0 flex flex-col justify-center items-center pointer-events-none select-none opacity-5 md:opacity-10"
      >
        <span className="text-[15vw] font-black uppercase leading-none italic">
          {profile?.name || "SEBASTIÁN TREJO"}
        </span>
      </motion.div>

      {/* Navigation HUDs */}
      <SectionDock sections={sectionIds} activeId={activeId} />
      <CommandNav 
        activeId={activeId} 
        counts={{ projects: projects.length, experience: experiences.length }} 
      />

      <main 
        ref={containerRef}
        className="relative z-10 flex flex-col w-full"
      >
        <section id="hero" className="stream-section">
          <HeroFragment profile={profile} />
        </section>

        <section id="projects" className="stream-section bg-surface_container_lowest">
          <div className="pt-24 md:pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 italic text-on_surface border-b border-surface_container_highest pb-4">
              PROJECTS <span className="text-primary text-sm tracking-widest align-top ml-4">[0{projects.length}]</span>
            </h2>
            <ProjectsOverview projects={projects} />
          </div>
        </section>

        <section id="experience" className="stream-section relative bg-background">
          <div className="pt-24 md:pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 italic text-on_surface border-b border-surface_container_highest pb-4">
              EXPERIENCE_LOG <span className="text-primary text-sm tracking-widest align-top ml-4">[0{experiences.length}]</span>
            </h2>
            <ExperienceOverview experiences={experiences} />
          </div>
        </section>

        <section id="skills" className="stream-section bg-surface_container_lowest">
          <div className="pt-24 md:pt-32 pb-32 px-4 md:px-12 max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 italic text-on_surface border-b border-surface_container_highest pb-4">
              NEURAL_MAP <span className="text-primary text-sm tracking-widest align-top ml-4">[ACTIVE_NODES: {skills.length}]</span>
            </h2>
            <SkillsOverview skills={skills} />
          </div>
        </section>
      </main>

      {/* Global Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-[100] bg-white/5">
        <motion.div 
          className="h-full bg-primary origin-left"
          style={{ scaleX: scrollYProgress }} 
        />
      </div>
    </div>
  );
};
