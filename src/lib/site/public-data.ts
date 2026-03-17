import "server-only";

import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { unstable_cache } from "next/cache";
import {
  capabilities as fallbackCapabilities,
  experienceEntries as fallbackExperienceEntries,
  experiments as fallbackExperiments,
  posts as fallbackPosts,
  profile as fallbackProfile,
  projects as fallbackProjects,
} from "@/lib/site/content";
import type {
  Capability,
  ExperienceEntry,
  Experiment,
  Post,
  Project,
  SiteProfile,
} from "@/lib/site/types";

type HomePageData = {
  profile: SiteProfile;
  capabilities: Capability[];
  featuredProjects: Project[];
  latestPosts: Post[];
  featuredExperiments: Experiment[];
};

type AboutPageData = {
  profile: SiteProfile;
  capabilities: Capability[];
  experienceEntries: ExperienceEntry[];
};

const PUBLIC_SITE_REVALIDATE_SECONDS = 3600;

function mapProfile(
  profile: {
    headline?: string;
    subheadline?: string;
    summary?: string[];
    availability?: string;
    location?: string;
    socialLinks?: { label: string; href: string }[];
  } | null | undefined,
  notificationEmail?: string
): SiteProfile {
  if (!profile) {
    return {
      name: fallbackProfile.name,
      role: fallbackProfile.role,
      headline: fallbackProfile.role,
      subheadline: fallbackProfile.summary,
      summary: fallbackProfile.summary,
      summaryParagraphs: [fallbackProfile.summary],
      availability: fallbackProfile.availability,
      location: fallbackProfile.location,
      contactEmail: fallbackProfile.contactEmail,
      socials: fallbackProfile.socials,
    };
  }

  const summaryParagraphs =
    Array.isArray(profile.summary) && profile.summary.length > 0
      ? profile.summary
      : [fallbackProfile.summary];

  return {
    name: "Corey Baines",
    role: profile.headline ?? fallbackProfile.role,
    headline: profile.headline ?? fallbackProfile.role,
    subheadline: profile.subheadline ?? fallbackProfile.summary,
    summary: summaryParagraphs.join(" "),
    summaryParagraphs,
    availability: profile.availability ?? fallbackProfile.availability,
    location: profile.location ?? fallbackProfile.location,
    contactEmail: notificationEmail ?? fallbackProfile.contactEmail,
    socials: profile.socialLinks ?? fallbackProfile.socials,
  };
}

async function withFallback<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

const getHomePageDataCached = unstable_cache(
  async (): Promise<HomePageData> =>
    withFallback(
      async () => {
        const result = await fetchQuery(api.content.getHomeData, {});

        return {
          profile: mapProfile(result.profile, result.settings?.notificationEmail),
          capabilities: result.capabilities as Capability[],
          featuredProjects: result.featuredProjects as Project[],
          latestPosts: result.latestPosts as Post[],
          featuredExperiments: result.featuredExperiments as Experiment[],
        };
      },
      {
        profile: mapProfile(null),
        capabilities: fallbackCapabilities,
        featuredProjects: fallbackProjects.filter((project) => project.featured),
        latestPosts: [...fallbackPosts].slice(0, 2),
        featuredExperiments: fallbackExperiments.filter(
          (experiment) => experiment.featured
        ),
      }
    ),
  ["site-home-page-data"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-home", "site-profile", "site-projects", "site-posts", "site-experiments"],
  }
);

const getAboutPageDataCached = unstable_cache(
  async (): Promise<AboutPageData> =>
    withFallback(
      async () => {
        const result = await fetchQuery(api.content.getAboutData, {});

        return {
          profile: mapProfile(result.profile, undefined),
          capabilities: result.capabilities as Capability[],
          experienceEntries: result.experienceEntries as ExperienceEntry[],
        };
      },
      {
        profile: mapProfile(null),
        capabilities: fallbackCapabilities,
        experienceEntries: fallbackExperienceEntries,
      }
    ),
  ["site-about-page-data"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-about", "site-profile", "site-capabilities", "site-experience"],
  }
);

const getPublishedProjectsCached = unstable_cache(
  async (): Promise<Project[]> =>
    withFallback(
      async () => (await fetchQuery(api.content.getProjects, {})) as Project[],
      fallbackProjects.filter((project) => project.published)
    ),
  ["site-published-projects"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-projects"],
  }
);

const getProjectBySlugCached = unstable_cache(
  async (slug: string): Promise<Project | null> =>
    withFallback(
      async () =>
        (await fetchQuery(api.content.getProjectBySlug, { slug })) as Project | null,
      fallbackProjects.find((project) => project.slug === slug && project.published) ??
        null
    ),
  ["site-project-by-slug"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-projects"],
  }
);

const getPublishedPostsCached = unstable_cache(
  async (): Promise<Post[]> =>
    withFallback(
      async () => (await fetchQuery(api.content.getPosts, {})) as Post[],
      [...fallbackPosts].filter((post) => post.published)
    ),
  ["site-published-posts"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-posts"],
  }
);

const getPostBySlugCached = unstable_cache(
  async (slug: string): Promise<Post | null> =>
    withFallback(
      async () =>
        (await fetchQuery(api.content.getPostBySlug, { slug })) as Post | null,
      fallbackPosts.find((post) => post.slug === slug && post.published) ?? null
    ),
  ["site-post-by-slug"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-posts"],
  }
);

const getPublishedExperimentsCached = unstable_cache(
  async (): Promise<Experiment[]> =>
    withFallback(
      async () => (await fetchQuery(api.content.getExperiments, {})) as Experiment[],
      fallbackExperiments.filter((experiment) => experiment.published)
    ),
  ["site-published-experiments"],
  {
    revalidate: PUBLIC_SITE_REVALIDATE_SECONDS,
    tags: ["site-content", "site-experiments"],
  }
);

export async function getHomePageData() {
  return getHomePageDataCached();
}

export async function getAboutPageData() {
  return getAboutPageDataCached();
}

export async function getSiteProfile(): Promise<SiteProfile> {
  const data = await getHomePageDataCached();
  return data.profile;
}

export async function getProfile() {
  return getSiteProfile();
}

export async function getCapabilities() {
  const data = await getAboutPageData();
  return data.capabilities;
}

export async function getExperienceEntries() {
  const data = await getAboutPageData();
  return data.experienceEntries;
}

export async function getPublishedProjects() {
  return getPublishedProjectsCached();
}

export async function getFeaturedProjects() {
  const data = await getHomePageData();
  return data.featuredProjects;
}

export async function getProjectBySlug(slug: string) {
  return getProjectBySlugCached(slug);
}

export async function getPublishedPosts() {
  return getPublishedPostsCached();
}

export async function getPostBySlug(slug: string) {
  return getPostBySlugCached(slug);
}

export async function getPublishedExperiments() {
  return getPublishedExperimentsCached();
}
