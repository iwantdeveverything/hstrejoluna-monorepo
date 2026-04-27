"use client";

import { SectionTimeline } from "@hstrejoluna/ui";
import { useReducedMotion } from "@hstrejoluna/ui";
import { scrollToSection } from "@/lib/navigation";
import type {
  NavSectionDefinition,
  NavSectionId,
  StreamSectionId,
} from "@/lib/sections";
import { useTranslations } from "next-intl";

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
  const tBrand = useTranslations("brand");
  const isReducedMotion = useReducedMotion();

  const handleSectionNavigation = (sectionId: string) => {
    scrollToSection({
      id: sectionId as NavSectionId,
      reducedMotion: isReducedMotion,
    });
  };

  return (
    <SectionTimeline
      sections={sections}
      activeId={activeId}
      hideOnScroll={hideOnScroll}
      onSectionNavigate={handleSectionNavigation}
      scrollLabel={tBrand("scrollToExplore")}
    />
  );
};
