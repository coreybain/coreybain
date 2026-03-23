export type ProjectLinkSet = {
  live?: string;
  repo?: string;
  store?: string;
  video?: string;
  post?: string;
};

export type ProjectMedia = {
  type: "image" | "video";
  src: string;
  alt: string;
};

export type ProjectType = "project" | "experiment";

export type ProjectVisibility = "homepage" | "work" | "experiments";

export type Project = {
  slug: string;
  type: ProjectType;
  visibleOn: ProjectVisibility[];
  title: string;
  company?: string;
  tagline: string;
  summary: string;
  body: string[];
  role?: string;
  period?: string;
  status?: "active" | "maintained" | "archived";
  stack: string[];
  outcomes: string[];
  impactMetrics?: string[];
  teamContext?: string;
  responsibilities?: string[];
  audience?: string;
  lessonsLearned?: string[];
  media?: ProjectMedia[];
  links: ProjectLinkSet;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  published: boolean;
};

export type AboutExperienceEntry = {
  company: string;
  title: string;
  period: string;
  summary: string;
  highlights: string[];
  sortOrder: number;
};

export type Capability = {
  slug: string;
  title: string;
  summary: string;
  proofPoints: string[];
};

export type Experiment = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  links: ProjectLinkSet;
  featured: boolean;
  published: boolean;
};

export type SiteProfile = {
  name: string;
  role: string;
  headline: string;
  subheadline: string;
  summary: string;
  summaryParagraphs: string[];
  availability: string;
  location: string;
  contactEmail?: string;
  socials: { label: string; href: string }[];
};
