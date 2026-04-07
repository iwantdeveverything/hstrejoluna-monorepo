import { Metadata } from "next";
import { client } from "@/lib/sanity";
import { Profile, Project, Skill, Experience } from "@/types/sanity";
import { ObsidianStream } from "@/components/ObsidianStream";

/**
 * generateMetadata
 * Dynamically generates SEO metadata using Sanity profile data.
 */
export async function generateMetadata(): Promise<Metadata> {
  const profile = await client.fetch<Profile | null>('*[_type == "profile"][0]');
  
  return {
    title: `${profile?.name || "Sebastián Trejo"} | Senior Software Architect`,
    description: profile?.headline || "Cinematic Portfolio of a Senior Frontend Engineer specializing in Scalable Ecosystems.",
    openGraph: {
      title: `${profile?.name || "Sebastián Trejo"} | Obsidian Command Portfolio`,
      description: profile?.headline,
      type: "website",
      images: [
        {
          url: "/og-image.png", // Placeholder for actual dynamic OG image
          width: 1200,
          height: 630,
          alt: "Obsidian Command Portfolio Preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: profile?.name,
      description: profile?.headline,
    },
  };
}

/**
 * PortfolioPage (RSC)
 * Entry point for the cinematic portfolio experience.
 * Fetches all necessary data from Sanity and injects JSON-LD for SEO.
 */
export default async function PortfolioPage() {
  // Parallel fetching for optimal performance
  const [profile, projects, skills, experiences] = await Promise.all([
    client.fetch<Profile | null>('*[_type == "profile"][0]'),
    client.fetch<Project[]>('*[_type == "project"] | order(isFeatured desc, _createdAt desc) { ..., techStack[]-> }'),
    client.fetch<Skill[]>('*[_type == "skill"] | order(proficiency desc)'),
    client.fetch<Experience[]>('*[_type == "experience"] | order(startDate desc)'),
  ]);

  // Structured Data for Google (Person Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name,
    jobTitle: profile?.headline,
    description: profile?.bio,
    url: "https://hstrejoluna.com", // Should be updated with real domain
    sameAs: profile?.socials?.map(s => s.url) || [],
    knowsAbout: skills.map(s => s.name),
  };

  return (
    <main className="min-h-screen bg-void text-white selection:bg-ember selection:text-void">
      {/* Dynamic SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* The Cinematic Stream Orchestrator */}
      <ObsidianStream 
        profile={profile} 
        projects={projects} 
        skills={skills} 
        experiences={experiences} 
      />
    </main>
  );
}
