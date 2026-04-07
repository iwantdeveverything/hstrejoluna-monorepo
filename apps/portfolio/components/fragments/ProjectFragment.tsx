"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/types/sanity";
import { urlFor } from "@/lib/sanity";
import { GlitchText } from "@/components/ui/GlitchText";
import { TelemetryHUD } from "@/components/ui/TelemetryHUD";

interface ProjectFragmentProps {
  project: Project;
  index: number;
}

/**
 * ProjectFragment Component
 * Displays a single project as an asymmetric cinematic fragment with HUD data.
 */
export const ProjectFragment = ({ project, index }: ProjectFragmentProps) => {
  const getProjectUrl = () => {
    if (project.micrositePath) return project.micrositePath;
    return project.externalLink || "#";
  };

  return (
    <section className="stream-fragment flex items-center justify-center p-6 md:p-24 relative overflow-hidden bg-void">
      {/* Massive Background Index Number (Watermark) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-[20rem] md:text-[40rem] text-white/[0.01] select-none z-0 pointer-events-none italic">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center z-10 w-full max-w-7xl">
        {/* Project Info Panel */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <TelemetryHUD data={project} className="mb-10" />
            
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9] italic">
              <GlitchText text={project.title} className="text-white" />
            </h2>

            <div className="text-white/30 text-base md:text-lg font-light leading-relaxed max-w-md mb-12 border-l-2 border-ember/10 pl-6">
              {/* Description fallback if block content extraction is not simple here */}
              DATA_EXTRACT: Analysis of architectural patterns and implementation strategies for high-performance scalable systems.
            </div>

            <Link 
              href={getProjectUrl()} 
              target={project.externalLink ? "_blank" : "_self"}
              className="group inline-flex items-center gap-6"
            >
              <span className="font-mono text-xs tracking-[0.4em] uppercase text-ember border-b border-ember/20 pb-2 group-hover:border-ember group-hover:text-white transition-all duration-300">
                [EXEC_UPLINK_PROJ]
              </span>
              <motion.span 
                className="text-ember text-2xl"
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* Asymmetric Image Fragment */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[16/10] md:aspect-[16/9] w-full group"
          >
            {/* Glow/Shadow Offset */}
            <div 
              className="absolute inset-0 bg-ember/5 z-0 translate-x-6 translate-y-6 transition-transform duration-700 group-hover:translate-x-8 group-hover:translate-y-8"
              style={{ clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }}
            />
            
            {/* Image Container with Custom Clip Path */}
            <div 
              className="relative z-10 w-full h-full overflow-hidden border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:border-ember/30"
              style={{ clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }}
            >
              {project.image && (
                <Image
                  src={urlFor(project.image).url()}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                  className="object-cover transition-transform duration-[2s] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-110"
                />
              )}
              
              {/* Digital Noise/Scanline Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-30 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
              </div>

              {/* Edge Glitch Light */}
              <div className="absolute top-0 right-0 w-1 h-full bg-glitch-cyan/20 z-30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-1 h-full bg-glitch-magenta/20 z-30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
