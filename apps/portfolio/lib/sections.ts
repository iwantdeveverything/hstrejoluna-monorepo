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
