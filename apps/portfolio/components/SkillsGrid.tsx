"use client";

import { motion, Variants } from "framer-motion";
import { Skill } from "@/types/sanity";

interface SkillsGridProps {
  skills: Skill[];
  variants: Variants;
}

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue-500",
  backend: "bg-green-500",
  analytics: "bg-purple-500",
  tools: "bg-yellow-500",
  design: "bg-pink-500",
};

export const SkillsGrid = ({ skills, variants }: SkillsGridProps) => {
  return (
    <motion.div
      variants={variants}
      className="md:col-span-2 lg:col-span-3 row-span-1 bento-card p-10"
    >
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tighter">Expertise</h2>
        <div className="h-px flex-1 bg-white/10 mx-6" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
        {skills.map((skill) => (
          <div key={skill._id} className="group">
            <div className="flex justify-between items-end mb-3">
              <span className="text-lg font-bold text-gray-200 group-hover:text-brand-salmon transition-colors">
                {skill.name}
              </span>
              <span className="text-sm font-mono text-gray-500">{skill.proficiency}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${CATEGORY_COLORS[skill.category] || 'bg-brand-salmon'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
