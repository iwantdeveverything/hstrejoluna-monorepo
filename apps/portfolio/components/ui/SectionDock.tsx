"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection } from "@/lib/navigation";
import type { NavSectionDefinition, StreamSectionId } from "@/lib/sections";

interface SectionDockProps {
  sections: readonly NavSectionDefinition[];
  activeId: StreamSectionId | "";
  hideOnScroll?: boolean;
}

export const SectionDock = ({
  sections,
  activeId,
  hideOnScroll = false,
}: SectionDockProps) => {
  const isReducedMotion = useReducedMotion();
  const shouldHide = hideOnScroll;

  const handleSectionNavigation = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: NavSectionDefinition["id"]) => {
    event.preventDefault();
    scrollToSection({ id: sectionId, reducedMotion: isReducedMotion });
  };

  return (
    <motion.nav
      aria-label="Section timeline navigation"
      data-testid="section-dock"
      data-hidden={shouldHide ? "true" : "false"}
      className={`fixed right-8 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-6 mix-blend-difference lg:flex ${
        shouldHide ? "pointer-events-none" : ""
      }`}
      initial={false}
      animate={{ x: shouldHide ? 40 : 0, opacity: shouldHide ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
    >
      <span className="[writing-mode:vertical-rl] text-xs font-mono text-on_surface_variant mb-4 uppercase tracking-[0.2em]">
        SCROLL_TO_EXPLORE
      </span>
      <ul className="flex flex-col items-center gap-6">
        {sections.map((section) => {
          const isActive = activeId === section.id;

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-label={`Navigate to ${section.label}`}
                aria-current={isActive ? "location" : undefined}
                className="group relative block rounded p-2 focus-visible:outline-none"
                onClick={(event) => handleSectionNavigation(event, section.id)}
              >
                <span className="sr-only">{section.label}</span>
                <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full border border-primary/20 transition-transform duration-300 group-hover:scale-100" />

                <motion.div
                  initial={false}
                  animate={{
                    width: isActive ? 6 : 4,
                    height: isActive ? 6 : 4,
                    backgroundColor: isActive
                      ? "var(--color-primary)"
                      : "var(--color-surface_container_highest)",
                  }}
                  className="relative z-10 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
};
