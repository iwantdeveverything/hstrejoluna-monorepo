import Link from "next/link";
import React from "react";

export interface HeroContentProps {
  eyebrow: string;
  h1Name: string;
  h1Role: string;
  lead: string;
  primaryCta: string;
  secondaryLabel: string;
  secondaryHref: string;
  ctaAriaLabel?: string;
  blobs?: React.ReactNode;
}

// Type for the subset of keys we actually use.
export type HeroTranslationKey = "eyebrow" | "h1Name" | "h1Role" | "cta" | "secondaryLabel" | "secondaryHref" | "ctaAriaLabel";

export const mapHeroTranslations = (t: (key: HeroTranslationKey) => string, leadFallback: string) => ({
  eyebrow: t("eyebrow"),
  h1Name: t("h1Name"),
  h1Role: t("h1Role"),
  lead: leadFallback,
  primaryCta: t("cta"),
  secondaryLabel: t("secondaryLabel"),
  secondaryHref: t("secondaryHref"),
  ctaAriaLabel: t("ctaAriaLabel"),
});

export const HeroContent = ({
  eyebrow,
  h1Name,
  h1Role,
  lead,
  primaryCta,
  secondaryLabel,
  secondaryHref,
  ctaAriaLabel,
  blobs,
}: HeroContentProps) => {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative z-[1] pointer-events-none overflow-hidden">
      <div className="relative z-[2] pointer-events-none flex flex-col items-start w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-24 pt-24 md:pt-32 pb-16 md:pb-24">
        <p className="font-mono text-[10px] md:text-xs tracking-[0.5em] text-ember mb-6 uppercase">
          {eyebrow}
        </p>

        <h1
          id="hero-title"
          className="text-[clamp(3rem,8vw,7rem)] font-black tracking-tighter leading-[0.9] uppercase italic text-white mb-8 md:mb-12 break-words max-w-full overflow-wrap-anywhere"
        >
          {h1Name}
          {" — "}
          {h1Role}
        </h1>

        <p className="text-sm md:text-lg text-white/90 font-light leading-relaxed max-w-2xl mb-10">
          {lead}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <Link
            href="#projects"
            aria-label={ctaAriaLabel ? `${ctaAriaLabel} — ${primaryCta}` : primaryCta}
            className="inline-flex items-center px-8 py-4 bg-ember text-[#3a0000] font-mono tracking-[0.3em] uppercase text-xs font-bold transition-all duration-300 hover:bg-ember/80 rounded-tl-[16px] rounded-br-[16px]"
          >
            {primaryCta}
          </Link>

          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 border border-white/10 text-white/60 font-mono tracking-[0.3em] uppercase text-xs font-bold transition-all duration-300 hover:border-ember/30 hover:text-white rounded-tl-[16px] rounded-br-[16px]"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>



    </section>
  );
};
