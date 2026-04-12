"use client";

import React from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'System', href: '#' },
];

export const GlassNav = () => {
  return (
    <nav className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-6 md:gap-10 px-8 py-4 bg-surface_container/60 backdrop-blur-xl border border-outline_variant/10 rounded-none">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-on_surface font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {item.label}
          </a>
        ))}
        <a
          href="#projects"
          className="text-on_surface font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Projects
        </a>
        <a
          href="#experience"
          className="text-on_surface font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Experience
        </a>
        <a
          href="#skills"
          className="text-on_surface font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Skills
        </a>
      </div>
    </nav>
  );
};
