"use client";

import dynamic from "next/dynamic";
import type {
  Profile,
  Project,
  Skill,
  Experience,
  Certificate,
} from "@/types/sanity";

const ObsidianStreamDynamic = dynamic(
  () => import("./ObsidianStream").then((mod) => mod.ObsidianStream),
  { ssr: false },
);

interface ObsidianStreamLoaderProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  certificates: Certificate[];
  projectsContent?: React.ReactNode;
  skipHero?: boolean;
}

/**
 * ObsidianStreamLoader — Client Component boundary for deferring
 * the heavy interactive shell (framer-motion, Three.js, WebGL).
 *
 * Wraps `next/dynamic(() => import('./ObsidianStream'), { ssr: false })`
 * because Next.js 16 (Turbopack) forbids `ssr: false` directly inside
 * Server Components.
 */
export function ObsidianStreamLoader(props: ObsidianStreamLoaderProps) {
  return <ObsidianStreamDynamic {...props} />;
}
