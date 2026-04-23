"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { m } from "framer-motion";
import Image from "next/image";
import { Link } from "@hstrejoluna/i18n";
import { Project } from "@hstrejoluna/types-sanity";
import { urlFor } from "@/lib/sanity";
import { getProjectUrl } from "@/lib/navigation";
import { getExternalLinkProps } from "@hstrejoluna/ui";
import { GlitchText } from "@hstrejoluna/ui";
import { TelemetryHUD } from "@hstrejoluna/ui";
import { blockToPlainText } from "@/lib/utils";

interface ProjectFragmentProps {
  project: Project;
  index: number;
}

/**
 * ProjectFragment Component
 * Displays a single project as an asymmetric cinematic fragment with HUD data.
 */
export const ProjectFragment = ({ project, index }: ProjectFragmentProps) => {
  const t = useTranslations("home");
  return (
    <section className="stream-fragment flex items-center justify-center p-6 md:p-24 relative overflow-hidden bg-background">
      {/* Massive Background Index Number (Watermark) */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-[20rem] md:text-[40rem] text-white/[0.01] select-none z-0 pointer-events-none italic"
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center z-10 w-full max-w-7xl">
        {/* Project Info Panel */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <TelemetryHUD 
              identifier={project.slug?.current || "PROJECT_UNDEFINED"}
              status="PROD_LIVE"
              techStack={project.techStack?.filter(Boolean).map(t => t.name || "") || []}
              className="mb-6 md:mb-10" 
            />
            <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-6 md:mb-8 leading-[0.9] italic">
              <GlitchText text={project.title} className="text-white" />
            </h2>

            <div className="text-white/30 text-base md:text-lg font-light leading-relaxed max-w-md mb-12 border-l-2 border-primary/10 pl-6">
              {blockToPlainText(project.description) || t("project_description_fallback")}
            </div>

            <Link 
              href={getProjectUrl(project)} 
              {...getExternalLinkProps(!!project.externalLink)}
              className="group inline-flex items-center gap-4 md:gap-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
            >
              <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.4em] uppercase text-primary border-b border-primary/20 pb-2 group-hover:border-primary group-hover:text-white transition-all duration-300">
                {t("project_uplink_badge")}
              </span>
              <m.span 
                className="text-primary text-2xl"
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                →
              </m.span>
            </Link>
          </m.div>
        </div>

        {/* Asymmetric Image Fragment */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <m.div
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[16/10] md:aspect-[16/9] w-full group"
          >
            {/* Glow/Shadow Offset */}
            <div 
              className="absolute inset-0 bg-primary/5 z-0 translate-x-6 translate-y-6 transition-transform duration-700 group-hover:translate-x-8 group-hover:translate-y-8"
              style={{ clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }}
            />
            
            {/* Image Container with Custom Clip Path */}
            <div 
              className="relative z-10 w-full h-full overflow-hidden border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:border-primary/30"
              style={{ clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }}
            >
              {project.image && (
                <Image
                  src={urlFor(project.image).url()}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                  className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
              )}
              
              {/* Digital Noise/Scanline Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-30 group-hover:opacity-10 transition-opacity duration-700 bg-[length:100%_4px,3px_100%] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))]" />

              {/* Edge Glitch Light */}
              <div className="absolute top-0 right-0 w-1 h-full bg-glitch-cyan/20 z-30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-1 h-full bg-glitch-magenta/20 z-30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};
