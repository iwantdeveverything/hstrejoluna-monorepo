"use client";

import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { type Project } from "@hstrejoluna/types-sanity";
import { urlFor } from "@/lib/sanity";
import { HudChip, GlowBorder, MicroInteraction } from "@hstrejoluna/ui";
import { ExternalLink, Activity } from "lucide-react";
import { blockToPlainText } from "@/lib/utils";

interface ProjectsOverviewProps {
  projects: Project[];
}

export const ProjectsOverview = ({ projects }: { projects: Project[] }) => {
  const t = useTranslations("home");
  const [expandedId, setExpandedId] = useState<string | null>(null);


  const toggleProject = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getProjectDescription = (description: Project["description"]) => {
    const plainText = blockToPlainText(description);
    return plainText.length > 0 ? plainText : t("project_description_fallback");
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
              className={`flex flex-col border-b border-r border-surface_container_highest bg-background relative group ${
                expandedId === project._id ? "col-span-1 md:col-span-2 lg:col-span-3" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggleProject(project._id)}
                className="cursor-pointer relative aspect-video overflow-hidden bg-surface_container_low text-left w-full"
                aria-expanded={expandedId === project._id}
                aria-controls={`project-panel-${project._id}`}
              >
                {project.image ? (
                  <>
                    <Image
                      src={urlFor(project.image).url()}
                      alt={t("screenshot_of", { title: project.title })}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-void/60 group-hover:bg-void/20 transition-colors duration-500" />
                  </>
                ) : (
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-surface_container_low to-void opacity-50" />
                )}
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-on_surface uppercase mb-2">
                    {project.title}
                  </h3>
                  <div className="flex justify-between items-end">
                    <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 backdrop-blur-sm border border-primary/20">
                      {t("deployed")}
                    </span>
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs animate-pulse">
                      {t("click_to_expand")}
                    </span>
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expandedId === project._id && (
                  <m.div
                    id={`project-panel-${project._id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden bg-surface_container_low"
                  >
                    <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 border-t border-primary/20">
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
                            <span>{t("live_deployment")}</span>
                            <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                          </a>
                        )}
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </GlowBorder>
        </MicroInteraction>
      ))}
    </div>
  );
};
