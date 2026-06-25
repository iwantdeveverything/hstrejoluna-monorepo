"use client";

import React, { type MouseEvent, useState, useMemo, useRef } from "react";
import { LiquidGlass } from "../liquid-glass";
import { cn } from "../utils/cn";
import { LG_FILTER_IDS } from "../liquid-glass/filter-defs";
import { useFocusTrap } from "../hooks/useFocusTrap";

export interface TemperedGlassNavSection {
  id: string;
  label: string;
  shortLabel?: string;
  href?: string;
}

export interface TemperedGlassNavSocialLink {
  kind: string;
  href: string;
  label: string;
  external?: boolean;
}

export interface TemperedGlassNavLabels {
  menu: string;
  close: string;
  socialHeading: string;
}

export interface TemperedGlassNavProps {
  activeId: string;
  sections: readonly TemperedGlassNavSection[];
  socials?: readonly TemperedGlassNavSocialLink[];
  hideOnScroll?: boolean;
  onSectionNavigate?: (sectionId: string) => void;
  statusLabel?: string;
  labels?: Partial<TemperedGlassNavLabels>;
  children?: React.ReactNode;
  className?: string;
}

const defaultLabels: TemperedGlassNavLabels = {
  menu: "Menu",
  close: "Close",
  socialHeading: "Social",
};

const externalLinkProps = (social: TemperedGlassNavSocialLink) =>
  social.external
    ? { target: "_blank" as const, rel: "noopener noreferrer external" }
    : {};

export const TemperedGlassNav = ({
  activeId,
  sections,
  socials = [],
  hideOnScroll = false,
  onSectionNavigate,
  statusLabel = "SYSTEM ONLINE",
  labels,
  children,
  className,
}: TemperedGlassNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldHide = hideOnScroll && !isMenuOpen;
  
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(mobilePanelRef, isMenuOpen, () => setIsMenuOpen(false));

  const resolvedLabels = useMemo(
    () => ({ ...defaultLabels, ...labels }),
    [labels]
  );

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    // Only intercept if primary button and no modifier keys
    if (
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      onSectionNavigate?.(sectionId);
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      data-testid="tempered-nav"
      data-hidden={shouldHide ? "true" : "false"}
      className={cn(
        "tempered-nav-root fixed bottom-4 left-4 right-4 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50",
        shouldHide ? "pointer-events-none" : "",
        className,
      )}
    >
      <LiquidGlass
        variant="dock"
        intensity="high"
        className="relative flex items-center justify-between md:justify-center h-14 md:h-16 gap-4 p-3 border border-white/10 shadow-2xl rounded-full"
      >
        <div aria-hidden="true" className="tempered-nav-scrim absolute inset-0 rounded-full" />
        <div className="relative z-10 flex items-center gap-3 pl-2 w-full md:w-auto justify-between md:justify-start">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-on_surface_variant min-w-[160px]">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="uppercase tracking-widest truncate">
              {statusLabel}
            </span>
          </div>
          {children}

          <button
            type="button"
            className="md:hidden flex items-center justify-center rounded-full bg-surface_container_highest/70 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-on_surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] cursor-pointer"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-liquid-panel"
            onClick={() => setIsMenuOpen((p) => !p)}
          >
            {isMenuOpen ? resolvedLabels.close : resolvedLabels.menu}
          </button>
        </div>

        <div className="relative hidden md:flex items-center justify-center z-10">
          <div
            className="absolute inset-0 pointer-events-none flex items-center gap-2 px-4 opacity-30"
            style={{ filter: `url(#${LG_FILTER_IDS.gooey})` }}
            aria-hidden="true"
          >
            {sections.map((section) => {
              const isActive = activeId === section.id;
              return (
                <div
                  key={`bg-${section.id}`}
                  className="relative px-4 py-2 text-xs font-mono uppercase tracking-widest"
                >
                  <span
                    data-active={isActive ? "true" : "false"}
                    className="liquid-nav-pill absolute inset-0 bg-primary rounded-full"
                  />
                </div>
              );
            })}
          </div>

          <nav
            aria-label="Primary sections"
            className="relative flex items-center gap-2 px-4"
          >
            {sections.map((section) => {
              const isActive = activeId === section.id;
              return (
                <a
                  key={section.id}
                  href={section.href ?? `#${section.id}`}
                  onClick={(e) => handleNavigate(e, section.id)}
                  className={cn(
                    "relative px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors duration-500 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
                    isActive
                      ? "text-primary drop-shadow-[0_0_8px_rgba(255,180,165,0.4)]"
                      : "text-on_surface hover:text-white",
                  )}
                  aria-current={isActive ? "location" : undefined}
                >
                  <span className="relative z-10">
                    {section.shortLabel ?? section.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 pr-4 border-l border-surface_container_highest pl-4 z-10">
          {socials.map((social) => (
            <a
              key={social.kind}
              href={social.href}
              aria-label={social.label}
              className="text-xs font-mono uppercase text-on_surface_variant transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              {...externalLinkProps(social)}
            >
              {social.label}
            </a>
          ))}
        </div>
      </LiquidGlass>

      {isMenuOpen && (
        <div
          id="mobile-liquid-panel"
          data-state="open"
          className="tempered-nav-mobile-panel absolute bottom-[calc(100%+16px)] left-0 right-0 z-40 md:hidden"
        >
          <LiquidGlass
            variant="dialog"
            intensity="high"
            className="p-4 border border-white/10 rounded-3xl shadow-2xl flex flex-col gap-4"
          >
            <div ref={mobilePanelRef} role="dialog" aria-modal="true" aria-label={resolvedLabels.menu} className="flex flex-col gap-4">
              <nav aria-label="Mobile sections" className="flex flex-col gap-2">
                {sections.map((section) => {
                  const isActive = activeId === section.id;
                  return (
                    <a
                      key={`mob-${section.id}`}
                      href={section.href ?? `#${section.id}`}
                      onClick={(e) => handleNavigate(e, section.id)}
                      className={cn(
                        "w-full block text-left px-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-on_surface hover:bg-white/5",
                      )}
                      aria-current={isActive ? "location" : undefined}
                    >
                      {section.label}
                    </a>
                  );
                })}
              </nav>

              {socials.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <p className="mb-3 px-2 text-[10px] font-mono uppercase tracking-widest text-on_surface_variant">
                    {resolvedLabels.socialHeading}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((social) => (
                      <a
                        key={`mob-soc-${social.kind}`}
                        href={social.href}
                        className="px-3 py-2 rounded-lg bg-surface_container_highest/30 text-xs font-mono text-on_surface transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                        {...externalLinkProps(social)}
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </LiquidGlass>
        </div>
      )}
    </header>
  );
};
