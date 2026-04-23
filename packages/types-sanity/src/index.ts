export interface ProfileSocialLink {
  platform: string;
  url?: string;
  email?: string;
  label?: string;
  order?: number;
}

export interface Profile {
  name?: string;
  headline?: string;
  bio?: string;
  socials?: ProfileSocialLink[];
}

export interface SanityImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
}

export interface PortableTextSpan {
  _type: "span";
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: string;
}

export interface PortableTextBlock {
  _type: "block";
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  style?: string;
}

/**
 * Normalized Sanity Types:
 * The frontend receives these after the GROQ query has selected the 
 * correct translation via the $locale parameter.
 */

export interface Project {
  _id: string;
  title: string; // Already translated by GROQ
  slug?: { current: string };
  description: string | PortableTextBlock[]; // Already translated by GROQ
  image?: SanityImage;
  techStack?: Skill[];
  micrositePath?: string;
  externalLink?: string;
  isFeatured?: boolean;
}

export interface Experience {
  _id: string;
  company: string;
  role: string; // Already translated by GROQ
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string | PortableTextBlock[]; // Already translated by GROQ
}

export interface Skill {
  _id: string;
  name: string;
  proficiency: number;
  category: string;
}

export interface Certificate {
  _id: string;
  name: string; // Already translated by GROQ
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  source: "linkedin";
}

export interface SyncCertificatesResult {
  fetched: number;
  upserted: number;
  skipped: number;
  warnings: string[];
}
