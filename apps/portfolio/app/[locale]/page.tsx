import type { Metadata } from "next";
import { cache } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { normalizeSocialLinks } from "@/lib/navigation";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { client } from "@/lib/sanity";
import {
  Profile,
  Project,
  Skill,
  Experience,
  Certificate,
} from "@/types/sanity";
import { ObsidianStream } from "@/components/ObsidianStream";

export const dynamic = "force-dynamic";

const profileQuery = '*[_type == "profile"][0]';
const projectsQuery =
  '*[_type == "project"] | order(isFeatured desc, _createdAt desc) { ..., techStack[]-> }';
const skillsQuery = '*[_type == "skill"] | order(proficiency desc)';
const experiencesQuery = '*[_type == "experience"] | order(startDate desc)';
const certificatesQuery =
  '*[_type == "certificate"] | order(issueDate desc, _createdAt desc)';
const defaultName = "Sebastián Trejo";
const getProfile = cache(() => client.fetch<Profile | null>(profileQuery));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const profile = await getProfile();
  const resolvedName = profile?.name ?? defaultName;

  return {
    title: t("title", { name: resolvedName }),
    description: t("description", { name: resolvedName }),
    openGraph: {
      title: t("ogTitle", { name: resolvedName }),
      description: t("description", { name: resolvedName }),
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Obsidian Command Portfolio Preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedName,
      description: t("description", { name: resolvedName }),
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        es: "/es",
      },
    },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [profile, projects, skills, experiences, certificates] =
    await Promise.all([
      getProfile(),
      client.fetch<Project[]>(projectsQuery),
      client.fetch<Skill[]>(skillsQuery),
      client.fetch<Experience[]>(experiencesQuery),
      client.fetch<Certificate[]>(certificatesQuery),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name,
    jobTitle: profile?.headline,
    description: profile?.bio,
    url: "https://hstrejoluna.com",
    sameAs: normalizeSocialLinks(profile?.socials).map((social) => social.href),
    knowsAbout: skills.map((s) => s.name),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <ObsidianStream
        profile={profile}
        projects={projects}
        skills={skills}
        experiences={experiences}
        certificates={certificates}
      />
    </>
  );
}
