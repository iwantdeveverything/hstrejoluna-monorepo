import type { Profile, Skill } from "@/types/sanity";
import { normalizeSocialLinks } from "@/lib/navigation";
import { urlFor } from "@/lib/sanity";

const SITE_URL = "https://hstrejoluna.com";
const FALLBACK_IMAGE = "/og-image.png";

interface BuildPersonJsonLdParams {
  profile: Profile | null;
  skills: Pick<Skill, "name">[];
  locale: string;
}

interface PersonJsonLd {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string | undefined;
  jobTitle: string | undefined;
  description: string | undefined | null;
  url: string;
  sameAs: string[];
  knowsAbout: string[];
  image: string;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
}

/**
 * Builds a JSON-LD Person structured data object.
 *
 * Extracted from page.tsx to enable pure-function testing.
 * Design contract: spec § "SEO surface", design §8.
 */
export function buildPersonJsonLd({
  profile,
  skills,
  locale,
}: BuildPersonJsonLdParams): PersonJsonLd {
  let image: string;

  if (profile?.image) {
    image = urlFor(profile.image).width(1200).height(630).url();
  } else {
    image = FALLBACK_IMAGE;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name,
    jobTitle: profile?.headline,
    description: profile?.bio,
    url: SITE_URL,
    sameAs: normalizeSocialLinks(profile?.socials).map((social) => social.href),
    knowsAbout: skills.map((s) => s.name),
    image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${locale}`,
    },
  };
}
