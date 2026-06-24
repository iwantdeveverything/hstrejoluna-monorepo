import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Profile } from "@/types/sanity";
import { HeroContent, mapHeroTranslations } from "./fragments/HeroContent";
import { HeroBackdrop } from "./hero/HeroBackdrop";

interface HeroTextProps {
  profile: Profile | null;
  locale: string;
}

/** Build-time kill switch (ADR-3): glass JS never ships unless explicitly on. */
const heroLiquidEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_HERO_LIQUID === "true";

/**
 * HeroText — Server Component. Fast SSR hero shell for LCP.
 *
 * Renders SEO-critical content (eyebrow, h1, lead, CTAs) without any
 * client-side JS, plus the SSR poster `<img>` (ADR-6) as the background LCP
 * candidate. The liquid-glass video/refraction layers are deferred to the
 * `<HeroBackdrop />` client island, mounted ONLY when the kill switch is on
 * (RSC-level enforcement — zero glass JS shipped when off, ADR-3).
 */
export const HeroText = async ({ profile, locale }: HeroTextProps) => {
  const t = await getTranslations({ locale, namespace: "hero" });
  const lead = profile?.headline ?? t("lead");
  const heroProps = mapHeroTranslations(t, lead);

  return (
    <div className="relative overflow-hidden w-full">
      {/* SSR poster (ADR-6): real <img> beneath everything, the background LCP
          candidate. Never removed — instant fallback if playback dies. */}
      <Image
        src="/hero-poster.avif"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none"
      />
      {heroLiquidEnabled() ? <HeroBackdrop /> : null}
      <HeroContent {...heroProps} />
    </div>
  );
};
