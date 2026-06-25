"use client";

import { useMemo } from "react";
import {
  TemperedGlassNav,
  useLiquidGlassGates,
} from "@hstrejoluna/ui";
import { normalizeSocialLinks, scrollToSection } from "@/lib/navigation";
import { navSectionIds } from "@/lib/sections";
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

const formatCount = (value: number): string =>
  value.toString().padStart(2, "0");

interface CommandNavLabels {
  initializing: string;
  systemOnline: string;
  projectsPrefix: string;
  experiencePrefix: string;
  skills: string;
  certificatesPrefix: string;
}

const resolveLabel = (
  activeId: string,
  counts: CommandNavCounts,
  labels: CommandNavLabels,
): string => {
  if (!activeId) return labels.initializing;
  if (activeId === "hero") return labels.systemOnline;
  if (activeId === "projects")
    return `${labels.projectsPrefix} [${formatCount(counts.projects)}]`;
  if (activeId === "experience")
    return `${labels.experiencePrefix} [${formatCount(counts.experience)}]`;
  if (activeId === "skills") return labels.skills;
  if (activeId === "certificates")
    return `${labels.certificatesPrefix} [${formatCount(counts.certificates)}]`;
  return activeId.toUpperCase();
};

export const CommandNav = ({
  activeId,
  counts,
  socials,
  hideOnScroll = false,
}: CommandNavProps) => {
  const tBrand = useTranslations("brand");
  const tNav = useTranslations("nav");
  const { reduceMotion: isReducedMotion } = useLiquidGlassGates();
  const socialLinks = useMemo(() => normalizeSocialLinks(socials), [socials]);

  const sections = useMemo(
    () =>
      navSectionIds.map((id) => {
        const label = tNav(id);
        return { id, label, shortLabel: label };
      }),
    [tNav],
  );

  const handleSectionNavigation = (sectionId: string) => {
    if (!navSectionIds.includes(sectionId as NavSectionId)) {
      return;
    }

    scrollToSection({
      id: sectionId as NavSectionId,
      reducedMotion: isReducedMotion,
    });
  };

  const statusLabel = resolveLabel(activeId, counts, {
    initializing: tBrand("initializing"),
    systemOnline: tBrand("systemOnline"),
    projectsPrefix: tNav("projects").toUpperCase(),
    experiencePrefix: tNav("experience").toUpperCase(),
    skills: tBrand("neuralMap"),
    certificatesPrefix: tNav("certificates").toUpperCase(),
  });

  return (
    <TemperedGlassNav
      activeId={activeId}
      sections={sections}
      socials={socialLinks}
      hideOnScroll={hideOnScroll}
      onSectionNavigate={handleSectionNavigation}
      statusLabel={statusLabel}
      labels={{
        menu: tBrand("menu") || "Menu",
        close: tBrand("close") || "Close",
        socialHeading: tBrand("socialHeading") || "Social",
      }}
    >
      <LocaleSwitcher />
    </TemperedGlassNav>
  );
};
