export const streamSectionIds = [
  "hero",
  "projects",
  "experience",
  "skills",
  "certificates",
] as const;

export const navSectionIds = [
  "projects",
  "experience",
  "skills",
  "certificates",
] as const;

export type StreamSectionId = (typeof streamSectionIds)[number];
export type NavSectionId = (typeof navSectionIds)[number];

export interface NavSectionDefinition {
  id: NavSectionId;
  label: string;
  shortLabel: string;
}

export const navSections: readonly NavSectionDefinition[] = [
  { id: "projects", label: "Projects", shortLabel: "Projects" },
  { id: "experience", label: "Experience", shortLabel: "Experience" },
  { id: "skills", label: "Skills", shortLabel: "Skills" },
  { id: "certificates", label: "Certificates", shortLabel: "Certificates" },
];
