// SkillsOverview.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Skill } from "@hstrejoluna/types-sanity";
import { HudChip } from "@hstrejoluna/ui";
import { useTranslations } from "next-intl";

export const SkillsOverview = ({ skills }: { skills: Skill[] }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const t = useTranslations();
  
  // Create unique categories
  const categories = Array.from(new Set(skills.map((s) => s.category))).filter(
    (c): c is string => Boolean(c)
  );

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || '');

  const filteredSkills = skills.filter(s => s.category === activeCategory);

  return (
    <div className="w-full relative z-20">
      {/* HUD Filter Bar */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-12 border-b border-surface_container_highest pb-4 px-4 md:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setExpandedId(null);
            }}
            className={`font-mono text-xs md:text-sm uppercase tracking-widest px-4 py-2 transition-colors duration-300 ${
              activeCategory === cat 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-on_surface_variant hover:text-on_surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 gap-0 border-t border-surface_container_highest">
        {filteredSkills.map((skill) => {
          const isExpanded = expandedId === skill._id;
          
          return (
            <motion.div
              layout
              key={skill._id}
              className={`border-b border-surface_container_highest bg-background ${isExpanded ? 'bg-surface_container_lowest' : ''}`}
            >
              <button 
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : skill._id)}
                aria-expanded={isExpanded}
                aria-controls={`skill-panel-${skill._id}`}
                className="w-full text-left cursor-pointer p-4 md:p-6 flex items-center justify-between group hover:bg-surface_container_low transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-primary text-xs opacity-50 group-hover:opacity-100">
                    {`[${skill.proficiency || 0}%]`}
                  </span>
                  <h4 className="text-base md:text-lg font-bold text-on_surface uppercase tracking-tight">
                    {skill.name}
                  </h4>
                </div>
                
                <div className="hidden md:flex gap-2">
                  <HudChip>{t("skills.sync_rate")}: {skill.proficiency || 0}%</HudChip>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    id={`skill-panel-${skill._id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-primary/20 bg-primary/5"
                  >
                    <div className="p-6 md:p-8 space-y-6">
                      {/* Visual Proficiency Bar */}
                      <div className="w-full bg-surface_container_highest h-2 relative overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.proficiency || 0}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute left-0 top-0 bottom-0 bg-primary"
                        />
                      </div>
                      
                      <div className="font-mono text-xs text-on_surface_variant leading-relaxed columns-1 md:columns-2 gap-8">
                        <div>
                          <p className="text-primary mb-2">{t("skills.documentation_fragment")}</p>
                          {/* Localized technical narrative */}
                          <p>{skill.name} {t("skills.proficiency_narrative_prefix")} {skill.category} {t("skills.proficiency_narrative_mid")} {skill.proficiency}% {t("skills.proficiency_narrative_suffix")}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
