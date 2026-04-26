"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type Experience } from "@hstrejoluna/types-sanity";
import { PortableText } from "@portabletext/react";
import { Calendar, Building, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useExpandableToggle } from "@hstrejoluna/ui";

export const ExperienceOverview = ({ experiences }: { experiences: Experience[] }) => {
  const { isExpanded, toggle } = useExpandableToggle();
  const t = useTranslations("experience");

  const getDescription = (description: Experience["description"]) => {
    if (typeof description === "string") {
      return <p>{description}</p>;
    }

    return <PortableText value={description} />;
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 px-4 md:px-0">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-surface_container_highest -translate-x-1/2 z-0" />

      <div className="space-y-4 relative z-10">
        {experiences.map((exp, index) => {
          const expanded = isExpanded(exp._id);
          const isLeft = index % 2 === 0;

          return (
            <div key={exp._id} className={`flex flex-col md:flex-row w-full ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} relative`}>
              <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 w-3 h-3 bg-surface_container_highest border border-primary/50 rotate-45 z-20"
                   style={{ backgroundColor: expanded ? 'var(--color-primary)' : '' }} />

              <div className="w-full md:w-1/2 pl-12 md:pl-0 flex">
                <div className={`w-full max-w-lg ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                  <motion.button
                    layout
                    type="button"
                    onClick={() => toggle(exp._id)}
                    aria-expanded={expanded}
                    aria-controls={`details-${exp._id}`}
                    className={`w-full text-left cursor-pointer border border-surface_container_highest bg-background p-6 transition-colors duration-300 hover:border-primary/50 group ${expanded ? 'border-primary/50 bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center gap-2 text-primary font-mono text-xs mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>
                        <time dateTime={exp.startDate}>{new Date(exp.startDate).getFullYear()}</time>
                        {' — '}
                        {exp.endDate ? (
                          <time dateTime={exp.endDate}>{new Date(exp.endDate).getFullYear()}</time>
                        ) : (
                          <span>{t("present")}</span>
                        )}
                      </span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight text-on_surface mb-1">
                      {exp.role}
                    </h3>
                    
                    <div className="flex items-center justify-between text-on_surface_variant font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>{exp.company}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          id={`details-${exp._id}`}
                          className="overflow-hidden mt-6 pt-6 border-t border-surface_container_highest"
                        >
                          <div className="prose prose-invert prose-sm max-w-none prose-p:text-on_surface_variant prose-li:text-on_surface_variant prose-strong:text-on_surface prose-a:text-primary">
                            {exp.description ? (
                              getDescription(exp.description)
                            ) : (
                              <p className="text-on_surface_variant/50 italic font-mono text-xs">[{t("no_description")}]</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
