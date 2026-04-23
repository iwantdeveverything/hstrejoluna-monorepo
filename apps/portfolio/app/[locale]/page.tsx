import type { Metadata } from "next";
import { cache } from "react";
import { normalizeSocialLinks } from "@/lib/navigation";
import { client } from "@/lib/sanity";
import { blockToPlainText } from "@/lib/utils";
import type {
  Profile,
  Project,
  Skill,
  Experience,
  Certificate,
} from "@hstrejoluna/types-sanity";
import { ObsidianStream } from "@/components/ObsidianStream";
import { locales, isValidLocale, type Locale } from '@hstrejoluna/i18n';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Note on Mixed i18n Strategy:
 * - Profile: Document-level (language == $locale) due to deep narrative and bio differences between locales.
 * - Others: Field-level i18n for maintainability of shared metadata and assets.
 */

// Localized queries using explicit GROQ projections
const profileQuery = `*[_type == "profile" && language == $locale][0]`;

const projectsQuery = `
  *[_type == "project"] | order(isFeatured desc, _createdAt desc) { 
    ..., 
    "title": coalesce(title[$locale], title.en, title),
    "description": coalesce(description[$locale], description.en, description),
    techStack[]-> { 
      ..., 
      "name": coalesce(name[$locale], name.en, name)
    }
  }
`;

const skillsQuery = `
  *[_type == "skill"] | order(proficiency desc) {
    ...,
    "name": coalesce(name[$locale], name.en, name)
  }
`;

const experiencesQuery = `
  *[_type == "experience"] | order(startDate desc) {
    ...,
    "role": coalesce(role[$locale], role.en, role),
    "description": coalesce(description[$locale], description.en, description)
  }
`;

const certificatesQuery = `
  *[_type == "certificate"] | order(issueDate desc, _createdAt desc) {
    ...,
    "name": coalesce(name[$locale], name.en, name)
  }
`;

const defaultHeadline =
  "Cinematic Portfolio of a Senior Frontend Engineer specializing in Scalable Ecosystems.";
const defaultName = "Sebastián Trejo";

const getProfile = cache((locale: string) => 
  client.fetch<Profile | null>(profileQuery, { locale })
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const profile = await getProfile(locale);
  const resolvedName = profile?.name ?? defaultName;
  const resolvedHeadline = profile?.headline ?? defaultHeadline;

  return {
    title: `${resolvedName} | Senior Software Architect`,
    description: resolvedHeadline,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`])
      ),
    },
    openGraph: {
      title: `${resolvedName} | Obsidian Command Portfolio`,
      description: resolvedHeadline,
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
      description: resolvedHeadline,
    },
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const [profile, projects, skills, experiences, certificates] = await Promise.all([
    getProfile(locale),
    client.fetch<Project[]>(projectsQuery, { locale }),
    client.fetch<Skill[]>(skillsQuery, { locale }),
    client.fetch<Experience[]>(experiencesQuery, { locale }),
    client.fetch<Certificate[]>(certificatesQuery, { locale }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name ?? defaultName,
    jobTitle: profile?.headline ?? defaultHeadline,
    description: blockToPlainText(profile?.bio),
    url: "https://hstrejoluna.com",
    sameAs: normalizeSocialLinks(profile?.socials).map((social) => social.href),
    knowsAbout: skills.map((s) => s.name),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
