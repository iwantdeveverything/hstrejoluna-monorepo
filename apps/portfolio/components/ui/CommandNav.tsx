"use client";

import { useMemo } from "react";
import { CommandSurface } from "@hstrejoluna/ui";
import { useReducedMotion } from "@hstrejoluna/ui";
import { normalizeSocialLinks, scrollToSection } from "@/lib/navigation";
import { navSectionIds, navSections } from "@/lib/sections";
import type { NavSectionId, StreamSectionId } from "@/lib/sections";
import type { ProfileSocialLink } from "@/types/sanity";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface CommandNavCounts {
  projects: number;
  experience: number;
  certificates: number;
}

interface CommandNavProps {
  activeId: StreamSectionId | "";
  counts: CommandNavCounts;
  socials?: ProfileSocialLink[];
  hideOnScroll?: boolean;
}

export const CommandNav = ({
  activeId,
  counts,
  socials,
  hideOnScroll = false,
}: CommandNavProps) => {
  const tBrand = useTranslations("brand");
  const tNav = useTranslations("nav");
  const isReducedMotion = useReducedMotion();
  const socialLinks = useMemo(() => normalizeSocialLinks(socials), [socials]);

  const handleSectionNavigation = (sectionId: string) => {
    if (!navSectionIds.includes(sectionId as NavSectionId)) {
      return;
    }

    scrollToSection({
      id: sectionId as NavSectionId,
      reducedMotion: isReducedMotion,
    });
  };

  return (
    <CommandSurface
      activeId={activeId}
      counts={counts}
      sections={navSections}
      socials={socialLinks}
      hideOnScroll={hideOnScroll}
      onSectionNavigate={handleSectionNavigation}
      labels={{
        initializing: tBrand("initializing"),
        systemOnline: tBrand("systemOnline"),
        projectsPrefix: tNav("projects").toUpperCase(),
        experiencePrefix: tNav("experience").toUpperCase(),
        skills: tBrand("neuralMap"),
        certificatesPrefix: tNav("certificates").toUpperCase(),
      }}
    >
      <LocaleSwitcher />
    </CommandSurface>
  );
};
