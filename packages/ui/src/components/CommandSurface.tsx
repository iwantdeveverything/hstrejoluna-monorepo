"use client";

import React, { type MouseEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getExternalLinkProps } from "../lib/utils";

export interface CommandSurfaceSection {
  id: string;
  label: string;
  shortLabel?: string;
}

export interface CommandSurfaceSocialLink {
  kind: string;
  href: string;
  label: string;
  external?: boolean;
}

export interface CommandSurfaceProps {
  activeId: string;
  sections: readonly CommandSurfaceSection[];
  socials?: readonly CommandSurfaceSocialLink[];
  hideOnScroll?: boolean;
  onSectionNavigate?: (sectionId: string) => void;
  renderExtra?: () => React.ReactNode;
  fallbackLabel?: string;
  menuLabel?: string;
  closeLabel?: string;
  socialTitle?: string;
  noSocialsLabel?: string;
}

const NavList = ({
  sections,
  activeId,
  isMobile,
  onNavigate,
}: {
  sections: readonly CommandSurfaceSection[];
  activeId: string;
  isMobile: boolean;
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) => (
  <ul className={isMobile ? "flex flex-col gap-1" : "flex items-center gap-6"}>
    {sections.map((section) => (
      <li key={section.id}>
        <a
          href={`#${section.id}`}
          onClick={(e) => onNavigate(e, section.id)}
          aria-current={activeId === section.id ? "location" : undefined}
          className={
            isMobile
              ? `block rounded px-2 py-3 text-sm font-mono uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  activeId === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-on_surface hover:bg-surface_container"
                }`
              : `text-[11px] font-mono uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  activeId === section.id
                    ? "text-primary font-bold"
                    : "text-on_surface_variant hover:text-on_surface"
                }`
          }
        >
          {isMobile ? section.label : section.shortLabel || section.label}
        </a>
      </li>
    ))}
  </ul>
);

const SocialList = ({
  socials,
  isMobile,
}: {
  socials: readonly CommandSurfaceSocialLink[];
  isMobile: boolean;
}) => (
  <ul className={isMobile ? "flex flex-col gap-2" : "flex items-center gap-4"}>
    {socials.map((social) => (
      <li key={social.href}>
        <a
          href={social.href}
          aria-label={social.label}
          className={
            isMobile
              ? "block rounded px-2 py-2 text-sm font-mono text-on_surface transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              : "text-xs font-mono uppercase text-on_surface_variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          }
          {...getExternalLinkProps(social.external)}
        >
          {social.label}
        </a>
      </li>
    ))}
  </ul>
);

export const CommandSurface = ({
  activeId,
  sections,
  socials = [],
  hideOnScroll = false,
  onSectionNavigate,
  renderExtra,
  fallbackLabel = "SYSTEM ONLINE",
  menuLabel = "Menu",
  closeLabel = "Close",
  socialTitle = "Social",
  noSocialsLabel = "No social links configured.",
}: CommandSurfaceProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldHide = hideOnScroll && !isMenuOpen;

  const activeSection = sections.find((s) => s.id === activeId);
  const currentLabel = activeSection?.label || fallbackLabel;

  const handleSectionNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    if (onSectionNavigate) {
      event.preventDefault();
      onSectionNavigate(sectionId);
    }

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
              {currentLabel}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block">{renderExtra?.()}</div>
          <button
            type="button"
            className="lg:hidden rounded border border-surface_container_highest px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-on_surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-panel"
            aria-label={isMenuOpen ? closeLabel : menuLabel}
            onClick={() => setIsMenuOpen((previous) => !previous)}
          >
            {isMenuOpen ? closeLabel : menuLabel}
          </button>
        </div>
      </div>

      <nav
        aria-label="Primary section navigation"
        className="relative z-10 mt-3 hidden items-center justify-center gap-6 lg:flex"
      >
        <NavList
          sections={sections}
          activeId={activeId}
          isMobile={false}
          onNavigate={handleSectionNavigation}
        />
        <div className="mx-2 h-4 w-[1px] bg-surface_container_highest" />
        <SocialList socials={socials} isMobile={false} />
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            id="mobile-navigation-panel"
            aria-label="Mobile section navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 mt-4 overflow-hidden lg:hidden border-t border-surface_container_highest pt-4"
          >
            <NavList
              sections={sections}
              activeId={activeId}
              isMobile={true}
              onNavigate={handleSectionNavigation}
            />
            <div className="mt-4 border-t border-surface_container_highest pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-on_surface_variant">
                  {socialTitle}
                </p>
                <div className="lg:hidden">{renderExtra?.()}</div>
              </div>
              {socials.length > 0 ? (
                <SocialList socials={socials} isMobile={true} />
              ) : (
                <p className="px-2 py-2 text-sm text-on_surface_variant">
                  {noSocialsLabel}
                </p>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};