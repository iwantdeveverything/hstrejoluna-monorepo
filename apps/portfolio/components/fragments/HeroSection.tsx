"use client";

import { useTranslations } from "next-intl";
import { HeroContent, mapHeroTranslations } from "./HeroContent";
import type { Profile } from "@/types/sanity";

interface HeroSectionProps {
  profile: Profile | null;
}

export const HeroSection = ({ profile }: HeroSectionProps) => {
  const t = useTranslations("hero");

  const lead = profile?.headline ?? t("lead");
  const heroProps = mapHeroTranslations(t, lead);

  return (
    <HeroContent
      {...heroProps}
      blobs={
        <>
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
        </>
      }
    />
  );
};
