import type { Metadata } from "next";
import { cache } from "react";
import { normalizeSocialLinks } from "@/lib/navigation";
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
const defaultHeadline =
  "Cinematic Portfolio of a Senior Frontend Engineer specializing in Scalable Ecosystems.";
const defaultName = "Sebastián Trejo";
const getProfile = cache(() => client.fetch<Profile | null>(profileQuery));

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const resolvedName = profile?.name ?? defaultName;
  const resolvedHeadline = profile?.headline ?? defaultHeadline;

  return {
    title: `${resolvedName} | Senior Software Architect`,
    description: resolvedHeadline,
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

export default async function PortfolioPage() {
  const [profile, projects, skills, experiences, certificates] = await Promise.all([
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
    <main
      id="main-content"
      className="min-h-screen bg-void text-white selection:bg-ember selection:text-void"
    >
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
    </main>
  );
}
