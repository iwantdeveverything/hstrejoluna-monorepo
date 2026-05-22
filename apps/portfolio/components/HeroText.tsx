import { getTranslations } from "next-intl/server";
import type { Profile } from "@/types/sanity";
import { HeroContent, mapHeroTranslations } from "./fragments/HeroContent";

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
    <HeroContent
      {...heroProps}
      blobs={
        <>
          <div
            className="hero-blob hero-blob--primary absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(255,86,55,0.3) 0%, rgba(255,86,55,0.05) 50%, transparent 70%)",
              left: "calc(0.5 * 100% - 30vw)",
              top: "calc(0.5 * 100% - 30vw)",
              filter: "blur(40px)",
            }}
          />

          <div
            className="hero-blob hero-blob--secondary absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(209,77,255,0.2) 0%, rgba(209,77,255,0.03) 60%, transparent 80%)",
              right: "calc(0.5 * 100% - 20vw)",
              bottom: "calc(0.5 * 100% - 20vw)",
              filter: "blur(50px)",
            }}
          />

          <div
            className="hero-blob hero-blob--accent absolute w-[30vw] h-[30vw] max-w-[350px] max-h-[350px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.02) 60%, transparent 80%)",
              left: "calc(0.5 * 100% - 20vw)",
              bottom: "calc(0.5 * 100% - 25vw)",
              filter: "blur(35px)",
            }}
          />
        </>
      }
    />
  );
};
