"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useReducedMotion } from "@hstrejoluna/ui";
import { useAutoHideNavigation } from "@/hooks/useAutoHideNavigation";
import { useActiveSection } from "@/hooks/useActiveSection";
import {
  Profile,
  Project,
  Skill,
  Experience,
  Certificate,
} from "@hstrejoluna/types-sanity";
import { HeroFragment } from "./fragments/HeroFragment";
import { ProjectsOverview } from "./fragments/ProjectsOverview";
import { ExperienceOverview } from "./fragments/ExperienceOverview";
import { SkillsOverview } from "./fragments/SkillsOverview";
import { CertificatesOverview } from "./fragments/CertificatesOverview";
import { SectionDock } from "./ui/SectionDock";
import { CommandNav } from "./ui/CommandNav";
import { BootSequence } from "@hstrejoluna/ui";
import { m, useScroll, useTransform, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { navSections, streamSectionIds } from "@/lib/sections";
import type { NavSectionId, StreamSectionId } from "@/lib/sections";
import { useTranslations } from "next-intl";

interface ObsidianStreamProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  certificates: Certificate[];
}

interface StreamSectionProps {
  id: NavSectionId;
  sectionClassName: string;
  wrapperClassName: string;
  title: string;
  countLabel: string;
  children: ReactNode;
}

const StreamSection = ({
  id,
  sectionClassName,
  wrapperClassName,
  title,
  countLabel,
  children,
}: StreamSectionProps) => (
  <section id={id} className={sectionClassName}>
    <div className={wrapperClassName}>
      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 italic text-on_surface border-b border-surface_container_highest pb-4">
        {title} <span className="text-primary text-sm tracking-widest align-top ml-4">{countLabel}</span>
      </h2>
      {children}
    </div>
  </section>
);

export const ObsidianStream = ({
  profile,
  projects,
  skills,
  experiences,
  certificates,
}: ObsidianStreamProps) => {
  const skipBootSequence = process.env.NEXT_PUBLIC_SKIP_BOOT_SEQUENCE === "1";
  const [isBooted, setIsBooted] = useState(skipBootSequence);
  const isReducedMotion = useReducedMotion();
  const isNavigationHidden = useAutoHideNavigation(isBooted);
  const tSections = useTranslations("home.sections");
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  const tNavLabels = useTranslations("common.nav_labels");
  
  const activeId = useActiveSection<StreamSectionId>(streamSectionIds, 0.4);

  const { scrollYProgress } = useScroll();
  const sectionBaseWrapperClass =
    "pt-24 md:pt-32 px-4 md:px-12 max-w-7xl mx-auto w-full";
  const compactSectionWrapperClass = `${sectionBaseWrapperClass} pb-12`;
  const fullSectionWrapperClass = `${sectionBaseWrapperClass} pb-32`;

  const backgroundY = useTransform(
    scrollYProgress, 
    [0, 1], 
    isReducedMotion ? ["0%", "0%"] : ["5%", "-30%"]
  );

  useEffect(() => {
    if (!isBooted) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isBooted]);

  const translatedNavSections = useMemo(() => 
    navSections.map(section => {
      // Explicit keys for type safety
      const labelMap: Record<NavSectionId, string> = {
        projects: tCommon("nav.projects"),
        experience: tCommon("nav.experience"),
        skills: tCommon("nav.skills"),
        certificates: tCommon("nav.certificates"),
      };

      const label = labelMap[section.id];
      return {
        ...section,
        label,
        shortLabel: label
      };
    }),
    [tCommon]
  );

  return (
    <div className="relative bg-background w-full min-h-screen font-sans overflow-x-hidden">
      <AnimatePresence>
        {!isBooted && <BootSequence onComplete={() => setIsBooted(true)} />}
      </AnimatePresence>

      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isBooted ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {isBooted && (
          <>
            <m.div 
              style={{ y: backgroundY }}
              aria-hidden="true"
              className="fixed inset-0 z-0 flex flex-col justify-center items-center pointer-events-none select-none opacity-5 md:opacity-10"
            >
              <span className="text-[15vw] font-black uppercase leading-none italic">
                {profile?.name || tHome("default_name")}
              </span>
            </m.div>

            <SectionDock
              sections={translatedNavSections}
              activeId={activeId}
              hideOnScroll={isNavigationHidden}
            />
            <CommandNav 
              activeId={activeId} 
              counts={{
                projects: projects.length,
                experience: experiences.length,
                certificates: certificates.length,
              }}
              socials={profile?.socials}
              hideOnScroll={isNavigationHidden}
              sections={translatedNavSections}
            />

            <LazyMotion features={domAnimation}>
              <main className="relative z-10 flex flex-col w-full">
                <section id="hero" className="stream-section">
                  <HeroFragment profile={profile} />
                </section>

                <StreamSection
                  id="projects"
                  sectionClassName="stream-section bg-surface_container_lowest"
                  wrapperClassName={compactSectionWrapperClass}
                  title={tSections("projects")}
                  countLabel={`[${projects.length.toString().padStart(2, '0')}]`}
                >
                  <ProjectsOverview projects={projects} />
                </StreamSection>

                <StreamSection
                  id="experience"
                  sectionClassName="stream-section relative bg-background"
                  wrapperClassName={compactSectionWrapperClass}
                  title={tSections("experience")}
                  countLabel={`[${experiences.length.toString().padStart(2, '0')}]`}
                >
                  <ExperienceOverview experiences={experiences} />
                </StreamSection>

                <StreamSection
                  id="skills"
                  sectionClassName="stream-section bg-surface_container_lowest"
                  wrapperClassName={fullSectionWrapperClass}
                  title={tSections("skills")}
                  countLabel={`[${tNavLabels("active_nodes")}: ${skills.length}]`}
                >
                  <SkillsOverview skills={skills} />
                </StreamSection>

                <StreamSection
                  id="certificates"
                  sectionClassName="stream-section relative bg-background"
                  wrapperClassName={fullSectionWrapperClass}
                  title={tSections("certificates")}
                  countLabel={`[${certificates.length.toString().padStart(2, '0')}]`}
                >
                  <CertificatesOverview certificates={certificates} />
                </StreamSection>
              </main>
            </LazyMotion>

            <div aria-hidden="true" className="fixed top-0 left-0 w-full h-[2px] z-[100] bg-white/5 pointer-events-none">
              <m.div 
                className="h-full bg-primary origin-left"
                style={{ scaleX: scrollYProgress }} 
              />
            </div>
          </>
        )}
      </m.div>
    </div>
  );
};