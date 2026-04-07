export interface Profile {
  name?: string;
  headline?: string;
  bio?: string;
  socials?: { platform: string; url: string }[];
}

export interface SanityImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
}

export interface Project {
  _id: string;
  title: string;
  slug?: { current: string };
  description: any; // Block content
  image?: SanityImage;
  techStack?: Skill[];
  micrositePath?: string;
  externalLink?: string;
  isFeatured?: boolean;
}

export interface Experience {
  _id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: any; // Block content
}

export interface Skill {
  _id: string;
  name: string;
  proficiency: number;
  category: string;
}
