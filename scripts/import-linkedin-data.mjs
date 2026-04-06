import { createClient } from "@sanity/client";

// This script populates your Sanity CMS with extracted LinkedIn data idempotently.
const client = createClient({
  projectId: "73v5iufs",
  dataset: "production",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // Use an env var for security
  apiVersion: "2024-04-05",
});

// Helper to create deterministic IDs for idempotent inserts
const generateId = (prefix, name) => `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const data = {
  profile: {
    _type: "profile",
    _id: "singleton-profile", 
    name: "Hector Sebastian Trejo Luna",
    headline: "Software Engineer | Gen AI Leader | Universidad del Caribe",
    bio: "Coding at business: Elevating ecosystems with impeccable software architecture. Specialized in React, Python, and Generative AI leader with a focus on scalable hubs.",
    socials: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/hstrejoluna/" },
      { platform: "GitHub", url: "https://github.com/hstrejoluna" }
    ]
  },
  skills: [
    { _type: "skill", name: "React JS", proficiency: 95, category: "frontend" },
    { _type: "skill", name: "JavaScript", proficiency: 90, category: "frontend" },
    { _type: "skill", name: "Generative AI", proficiency: 92, category: "analytics" },
    { _type: "skill", name: "Python 3", proficiency: 85, category: "backend" },
    { _type: "skill", name: "GTM Tracking", proficiency: 88, category: "analytics" },
    { _type: "skill", name: "Flutter", proficiency: 75, category: "frontend" }
  ].map(skill => ({ ...skill, _id: generateId("skill", skill.name) })),
  
  projects: [
    {
      _type: "project",
      title: "Maestros del Salmón",
      slug: { _type: "slug", current: "maestros-del-salmon" },
      description: "Premium Salmon Ecommerce with GTM tracking and Meta Pixel integration.",
      micrositePath: "/maestros-del-salmon",
      isFeatured: true,
      techStack: ["Next.js", "Tailwind CSS", "TypeScript", "GTM"]
    },
    {
      _type: "project",
      title: "Moodle Platform Development",
      slug: { _type: "slug", current: "moodle-platform-development" },
      description: "Full-scale educational platform development for Escuela Superior de Leyes.",
      externalLink: "https://www.esl.edu.mx",
      isFeatured: false,
      techStack: ["Moodle", "PHP", "Web Development"]
    }
  ].map(proj => ({ ...proj, _id: generateId("project", proj.title) })),

  experiences: [
    {
      _type: "experience",
      company: "Universidad del Caribe",
      role: "Software Engineer & Educator",
      startDate: "2022-01-01",
      isCurrent: true,
      description: [
        {
          _type: 'block',
          _key: generateId('block', 'caribe-1'),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', marks: [], text: 'Leading software engineering initiatives and mentoring students.' }]
        }
      ]
    },
    {
      _type: "experience",
      company: "OpenBootcamp",
      role: "Generative AI Leader",
      startDate: "2023-01-01",
      endDate: "2024-01-01",
      isCurrent: false,
      description: [
        {
          _type: 'block',
          _key: generateId('block', 'ob-1'),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', marks: [], text: 'Spearheaded generative AI projects and established scalable tech hubs.' }]
        }
      ]
    }
  ].map(exp => ({ ...exp, _id: generateId("experience", `${exp.company}-${exp.role}`) }))
};

async function importData() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error("❌ Error: SANITY_WRITE_TOKEN is missing. Please provide it as an environment variable.");
    return;
  }

  try {
    console.log("🚀 Starting idempotent data import...");

    // 1. Upsert Profile
    await client.createOrReplace(data.profile);
    console.log("✅ Profile imported.");

    // 2. Upsert Skills
    for (const skill of data.skills) {
      await client.createOrReplace(skill);
    }
    console.log(`✅ ${data.skills.length} Skills imported.`);

    // 3. Upsert Projects
    for (const project of data.projects) {
      await client.createOrReplace(project);
    }
    console.log(`✅ ${data.projects.length} Projects imported.`);

    // 4. Upsert Experiences
    for (const experience of data.experiences) {
      await client.createOrReplace(experience);
    }
    console.log(`✅ ${data.experiences.length} Experiences imported.`);

    console.log("🎊 Import completed successfully! No duplicates were created.");
  } catch (err) {
    console.error("❌ Import failed:", err.message);
  }
}

importData();