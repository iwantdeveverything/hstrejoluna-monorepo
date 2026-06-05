import { getTranslations } from "next-intl/server";
import type { Profile } from "@/types/sanity";
import { HeroContent, mapHeroTranslations } from "./fragments/HeroContent";
import { HeroPhysicsIsland } from "./fragments/HeroPhysicsIsland";

interface HeroTextProps {
  profile: Profile | null;
  locale: string;
}

/**
 * HeroText — Server Component. Fast SSR hero shell for LCP.
 *
 * Renders SEO-critical content (eyebrow, h1, lead, CTAs) without any
 * client-side JS. The visual liquid-glass layer is deferred to the
 * dynamic ObsidianStream client component.
 */
export const HeroText = async ({ profile, locale }: HeroTextProps) => {
  const t = await getTranslations({ locale, namespace: "hero" });
  const lead = profile?.headline ?? t("lead");
  const heroProps = mapHeroTranslations(t, lead);

  return (
    <div className="relative overflow-hidden w-full">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="hero-blob hero-blob-drift-1 absolute -top-[10%] -left-[5%] w-[45%] h-[55%] rounded-[40%_60%_60%_40%/45%_45%_55%_55%] bg-gradient-to-br from-ember/15 via-ember/5 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="hero-blob hero-blob-drift-2 absolute top-[5%] -right-[10%] w-[40%] h-[50%] rounded-[60%_40%_40%_60%/55%_55%_45%_45%] bg-gradient-to-tl from-primary/10 via-primary/5 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="hero-blob hero-blob-drift-3 absolute -bottom-[15%] left-[20%] w-[35%] h-[45%] rounded-[50%_50%_45%_55%/60%_40%_60%_40%] bg-gradient-to-tr from-accent/8 via-accent/3 to-transparent blur-3xl"
          aria-hidden="true"
        />
      </div>
      <HeroPhysicsIsland />
      <HeroContent {...heroProps} />
    </div>
  );
};
