import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Profile } from "@/types/sanity";
import { HeroContent, mapHeroTranslations } from "./fragments/HeroContent";
import { HeroBackdrop } from "./hero/HeroBackdrop";

interface HeroTextProps {
  profile: Profile | null;
  locale: string;
}

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
      <HeroBackdrop />
      <HeroContent {...heroProps} />
    </div>
  );
};
