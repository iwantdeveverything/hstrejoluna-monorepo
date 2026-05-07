import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Profile } from "@/types/sanity";
import { HeroLiquidField } from "./HeroLiquidField";

interface HeroSectionProps {
  profile: Profile | null;
}

/**
 * HeroSection — Semantic SSR shell (RSC).
 *
 * Renders the hero's SEO-critical content (h1, eyebrow, lead, CTAs) as
 * server-rendered HTML. The visual liquid-glass layer is deferred to the
 * client-only `HeroLiquidField` + `HeroLiquidWebGL` components.
 *
 * Design contract: spec § "Semantic SSR shell", design §1.
 */
export const HeroSection = ({ profile }: HeroSectionProps) => {
  const t = useTranslations("hero");

  const h1Name = t("h1Name");
  const h1Role = t("h1Role");
  const eyebrow = t("eyebrow");
  const lead = profile?.headline ?? t("lead");
  const primaryCta = t("cta");
  const ctaAriaLabel = t("ctaAriaLabel");
  const secondaryLabel = t("secondaryLabel");
  const secondaryHref = t("secondaryHref");

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative">
      {/* Text content — rendered server-side, zero JS shipped for these nodes */}
      <div className="z-10 relative flex flex-col items-start w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-24">
        {/* Eyebrow */}
        <p className="font-mono text-[10px] md:text-xs tracking-[0.5em] text-ember mb-6 uppercase">
          {eyebrow}
        </p>

        {/* h1 — the LCP candidate */}
        <h1
          id="hero-title"
          className="text-[clamp(3rem,8vw,7rem)] font-black tracking-tighter leading-[0.9] uppercase italic text-white mb-8 md:mb-12"
        >
          {h1Name}
          {" — "}
          {h1Role}
        </h1>

        {/* Lead paragraph — solid white at 90% opacity still passes WCAG AA
            after backdrop-filter brightness(0.65) compositing */}
        <p className="text-sm md:text-lg text-white/90 font-light leading-relaxed max-w-2xl mb-10">
          {lead}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="#projects"
            aria-label={ctaAriaLabel}
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

      {/* Client-only visual layer */}
      <HeroLiquidField />
    </section>
  );
};
