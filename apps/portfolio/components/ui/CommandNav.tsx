"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CommandSurface } from "@hstrejoluna/ui";
import { useReducedMotion } from "@hstrejoluna/ui";
import { normalizeSocialLinks, scrollToSection } from "@/lib/navigation";
import { navSectionIds } from "@/lib/sections";
import type { NavSectionId, StreamSectionId, NavSectionDefinition } from "@/lib/sections";
import type { ProfileSocialLink } from "@hstrejoluna/types-sanity";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface CommandNavCounts {
  projects: number;
  experience: number;
  certificates: number;
}

interface CommandNavProps {
  activeId: StreamSectionId | "";
  counts: CommandNavCounts;
  sections: readonly NavSectionDefinition[];
  socials?: ProfileSocialLink[];
  hideOnScroll?: boolean;
}

export const CommandNav = ({
  activeId,
  counts,
  sections,
  socials,
  hideOnScroll = false,
}: CommandNavProps) => {
  const isReducedMotion = useReducedMotion();
  const tNav = useTranslations("common.nav_labels");

  const socialLinks = useMemo(() => 
    normalizeSocialLinks(socials), 
    [socials]
  );

  const translatedSections = useMemo(() => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return sections.map((s) => {
      let label = s.label;
      if (s.id === "projects") label = `${tNav("projects")} [${pad(counts.projects)}]`;
      if (s.id === "experience") label = `${tNav("experience")} [${pad(counts.experience)}]`;
      if (s.id === "skills") label = tNav("neural_map");
      if (s.id === "certificates") label = `${tNav("certificates")} [${pad(counts.certificates)}]`;

      return { ...s, label };
    });
  }, [sections, counts, tNav]);

  const handleSectionNavigation = (sectionId: string) => {
    const isValidId = (id: string): id is NavSectionId => 
      (navSectionIds as readonly string[]).includes(id);

    if (!isValidId(sectionId)) {
      return;
    }

    scrollToSection({ id: sectionId, reducedMotion: isReducedMotion });
  };

  return (
    <CommandSurface
      activeId={activeId}
      sections={translatedSections}
      socials={socialLinks}
      hideOnScroll={hideOnScroll}
      onSectionNavigate={handleSectionNavigation}
      renderExtra={() => <LocaleSwitcher />}
      fallbackLabel={tNav("system_online")}
      menuLabel={tNav("menu")}
      closeLabel={tNav("close")}
      socialTitle={tNav("social_title")}
      noSocialsLabel={tNav("no_socials")}
    />
  );
};
