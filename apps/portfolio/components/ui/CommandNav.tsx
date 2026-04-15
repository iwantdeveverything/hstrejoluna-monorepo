"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { normalizeSocialLinks, scrollToSection } from "@/lib/navigation";
import { navSections } from "@/lib/sections";
import type { NavSectionId, StreamSectionId } from "@/lib/sections";
import type { ProfileSocialLink } from "@/types/sanity";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isReducedMotion = useReducedMotion();
  const socialLinks = useMemo(() => normalizeSocialLinks(socials), [socials]);
  const shouldHide = hideOnScroll && !isMenuOpen;
  const labelMap: Record<StreamSectionId | "", string> = {
    "": "INITIALIZING...",
    hero: "SYSTEM ONLINE",
    projects: `PROJECTS [0${counts.projects}]`,
    experience: `EXPERIENCE [0${counts.experience}]`,
    skills: "NEURAL MAP",
    certificates: `CERTIFICATES [0${counts.certificates}]`,
  };
  const label = labelMap[activeId];

  const handleSectionNavigation = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: NavSectionId) => {
    event.preventDefault();
    scrollToSection({ id: sectionId, reducedMotion: isReducedMotion });
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      data-testid="command-nav"
      data-hidden={shouldHide ? "true" : "false"}
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4 ${
        shouldHide ? "pointer-events-none" : ""
      }`}
      initial={{ y: 100 }}
      animate={{ y: shouldHide ? 140 : 0, opacity: shouldHide ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md border-t border-surface_container_highest" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={activeId}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="text-on_surface uppercase"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="lg:hidden rounded border border-surface_container_highest px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-on_surface focus-visible:outline-none"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-panel"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        aria-label="Primary section navigation"
        className="relative z-10 mt-3 hidden items-center justify-center gap-6 lg:flex"
      >
        <ul className="flex items-center gap-6">
          {navSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={activeId === section.id ? "location" : undefined}
                className={`text-xs font-mono uppercase transition-colors hover:text-primary ${
                  activeId === section.id
                    ? "border-b-2 border-primary pb-1 text-primary"
                    : "text-on_surface_variant"
                }`}
                onClick={(event) => handleSectionNavigation(event, section.id)}
              >
                {section.shortLabel}
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex items-center gap-4 border-l border-surface_container_highest pl-4">
          {socialLinks.map((social) => (
            <li key={social.kind}>
              <a
                href={social.href}
                aria-label={social.label}
                className="text-xs font-mono uppercase text-on_surface_variant transition-colors hover:text-primary"
                target={social.external ? "_blank" : undefined}
                rel={social.external ? "noopener noreferrer external" : undefined}
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="mobile-navigation-panel"
            aria-label="Mobile section navigation"
            className="relative z-10 mt-3 rounded border border-surface_container_highest bg-surface_container/95 p-4 lg:hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <ul className="flex flex-col gap-3">
              {navSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={activeId === section.id ? "location" : undefined}
                    className={`block rounded px-2 py-2 text-sm font-mono uppercase tracking-wide transition-colors focus-visible:outline-none ${
                      activeId === section.id
                        ? "bg-primary/15 text-primary"
                        : "text-on_surface"
                    }`}
                    onClick={(event) => handleSectionNavigation(event, section.id)}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-surface_container_highest pt-3">
              <p className="mb-2 text-[11px] font-mono uppercase tracking-wider text-on_surface_variant">
                Social
              </p>
              {socialLinks.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {socialLinks.map((social) => (
                    <li key={`mobile-${social.kind}`}>
                      <a
                        href={social.href}
                        aria-label={social.label}
                        className="block rounded px-2 py-2 text-sm font-mono text-on_surface transition-colors hover:text-primary focus-visible:outline-none"
                        target={social.external ? "_blank" : undefined}
                        rel={social.external ? "noopener noreferrer external" : undefined}
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2 py-2 text-sm text-on_surface_variant">
                  No social links configured.
                </p>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
