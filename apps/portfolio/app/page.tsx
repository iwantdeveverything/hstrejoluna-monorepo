import { client } from "@/lib/sanity";
import { Profile, Project, Skill } from "@/types/sanity";
import { PortfolioGrid } from "@/components/PortfolioGrid";

export default async function PortfolioPage() {
  // Fetch data on the server with strict typing
  const [profile, projects, skills] = await Promise.all([
    client.fetch<Profile | null>('*[_type == "profile"][0]'),
    client.fetch<Project[]>('*[_type == "project"] | order(isFeatured desc, _createdAt desc)'),
    client.fetch<Skill[]>('*[_type == "skill"] | order(proficiency desc)'),
  ]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8 md:p-24 selection:bg-brand-salmon selection:text-white">
      <PortfolioGrid profile={profile} projects={projects} skills={skills} />
    </main>
  );
}
