"use client";

import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { type Project } from "@/types/sanity";
import { urlFor } from "@/lib/sanity";
import { HudChip, GlowBorder, MicroInteraction, LiquidGlass } from "@hstrejoluna/ui";
import { ExternalLink, Activity } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProjectsOverviewProps {
  projects: Project[];
}

export const ProjectsOverview = ({ projects }: ProjectsOverviewProps) => {
  const tCommon = useTranslations("common");
  const tFragments = useTranslations("fragments.projects");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleProject = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getProjectDescription = (description: Project["description"]) => {
    if (typeof description === "string" && description.length > 0) {
      return description;
    }

    return tFragments("noDescription");
  };

  return (
    <div className="grid-with-life grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-surface_container_highest relative z-20 w-full">
      {projects.map((project) => (
        <MicroInteraction key={project._id}>
          <GlowBorder glowColor="var(--color-primary)" glowIntensity="0 0 10px">
            <m.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`border-b border-r border-surface_container_highest relative group ${
                expandedId === project._id ? "col-span-1 md:col-span-2 lg:col-span-3" : ""
              }`}
            >
              <LiquidGlass variant="panel" className="flex h-full flex-col">
                <div
                  className="relative aspect-video overflow-hidden bg-surface_container_low text-left w-full"
                >
                  {project.image ? (
                    <>
                      <Image
                        src={urlFor(project.image).url()}
                        alt={`Screenshot of ${project.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-void/60 group-hover:bg-void/20 transition-colors duration-500" />
                    </>
                  ) : (
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-surface_container_low to-void opacity-50" />
                  )}
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-on_surface uppercase mb-2 pointer-events-none">
                      {project.title}
                    </h3>
                    <div className="flex justify-between items-end">
                      <LiquidGlass
                        as="span"
                        variant="pill"
                        intensity="low"
                        className="font-mono text-xs text-primary px-2 py-1 border border-primary/20 pointer-events-none"
                      >
                        {tCommon("deployed")}
                      </LiquidGlass>
                      <button
                        type="button"
                        onClick={() => toggleProject(project._id)}
                        className="cursor-pointer text-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs animate-pulse focus:opacity-100 focus:outline-none"
                        aria-expanded={expandedId === project._id}
                        aria-controls={`project-panel-${project._id}`}
                      >
                        {/* Stretched link to make the whole area clickable */}
                        <span className="absolute inset-0 z-0" aria-hidden="true" />
                        <span className="relative z-10">{tFragments("clickToExpand")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedId === project._id && (
                    <m.div
                      id={`project-panel-${project._id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <LiquidGlass variant="panel" className="border-t border-primary/20">
                        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
                          <div className="flex-1 space-y-6">
                            <div className="text-on_surface_variant leading-relaxed text-sm md:text-base font-mono">
                              {getProjectDescription(project.description)}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {project.techStack?.filter(Boolean).map((tech) => (
                                <HudChip key={tech._id}>{tech.name}</HudChip>
                              ))}
                            </div>
                          </div>
  
                          <div className="w-full md:w-64 space-y-4 font-mono text-xs border-l border-surface_container_highest pl-0 md:pl-8">
                            {(project.externalLink || project.micrositePath) && (
                              <a href={project.externalLink || project.micrositePath || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-on_surface hover:text-primary transition-colors p-3 border border-surface_container_highest hover:border-primary/50 group">
                                <Activity className="w-4 h-4 text-primary group-hover:animate-pulse" />
                                <span>{tFragments("liveDeployment")}</span>
                                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                              </a>
                            )}
                          </div>
                        </div>
                      </LiquidGlass>
                    </m.div>
                  )}
                </AnimatePresence>
              </LiquidGlass>
            </m.div>
          </GlowBorder>
        </MicroInteraction>
      ))}
    </div>
  );
};
