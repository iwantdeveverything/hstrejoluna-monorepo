"use client";

import { SectionTimeline } from "@hstrejoluna/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection } from "@/lib/navigation";
import type { NavSectionDefinition, NavSectionId, StreamSectionId } from "@/lib/sections";

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

  const handleSectionNavigation = (sectionId: string) => {
    scrollToSection({ id: sectionId as NavSectionId, reducedMotion: isReducedMotion });
  };

  return (
    <SectionTimeline
      sections={sections}
      activeId={activeId}
      hideOnScroll={hideOnScroll}
      onSectionNavigate={handleSectionNavigation}
    />
  );
};
