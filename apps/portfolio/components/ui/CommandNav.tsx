"use client";

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
  const socialLinks = normalizeSocialLinks(socials);

  const handleSectionNavigation = (sectionId: string) => {
    if (!navSectionIds.includes(sectionId as NavSectionId)) {
      return;
    }

    scrollToSection({ id: sectionId as NavSectionId, reducedMotion: isReducedMotion });
  };

  return (
    <CommandSurface
      activeId={activeId}
      counts={counts}
      sections={sections}
      socials={socialLinks}
      hideOnScroll={hideOnScroll}
      onSectionNavigate={handleSectionNavigation}
      renderExtra={() => <LocaleSwitcher />}
    />
  );
};
