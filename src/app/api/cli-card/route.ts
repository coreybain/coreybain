import { getAboutPageData, getHomePageData } from "@/lib/site/public-data";
import { toAbsoluteUrl } from "@/lib/site-config";

function getSocialLink(
  socials: { label: string; href: string }[],
  label: string
) {
  return socials.find((social) => social.label.toLowerCase() === label.toLowerCase())
    ?.href;
}

function buildLeadershipHighlights(input: {
  experienceEntries: {
    summary: string;
    highlights: string[];
  }[];
  capabilities: {
    summary: string;
    proofPoints: string[];
  }[];
}) {
  const highlights = [
    input.experienceEntries[0]?.summary,
    input.experienceEntries[0]?.highlights?.[0],
    input.experienceEntries[0]?.highlights?.[1],
    input.capabilities[0]?.summary,
    input.capabilities[0]?.proofPoints?.[1],
    input.capabilities[3]?.summary,
  ].filter((value): value is string => Boolean(value));

  return highlights.slice(0, 4);
}

export async function GET() {
  const [homeData, aboutData] = await Promise.all([
    getHomePageData(),
    getAboutPageData(),
  ]);

  const leadershipHighlights = buildLeadershipHighlights({
    experienceEntries: aboutData.experienceEntries,
    capabilities: aboutData.capabilities,
  });

  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    profile: {
      name: homeData.profile.name,
      headline: homeData.profile.headline,
      subheadline: homeData.profile.subheadline,
      availability: homeData.profile.availability,
      location: homeData.profile.location,
      contactEmail: homeData.profile.contactEmail,
      socials: homeData.profile.socials,
    },
    featuredProjects: homeData.featuredProjects.map((project) => ({
      slug: project.slug,
      title: project.title,
      tagline: project.tagline,
      summary: project.summary,
      role: project.role,
      period: project.period,
      stack: project.stack,
      outcomes: project.outcomes,
      impactMetrics: project.impactMetrics ?? [],
      links: {
        ...project.links,
        caseStudy: toAbsoluteUrl(`/work/${project.slug}`),
      },
    })),
    leadershipHighlights,
    latestPosts: homeData.latestPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      href: toAbsoluteUrl(`/blog/${post.slug}`),
    })),
    featuredExperiments: homeData.featuredExperiments.map((experiment) => ({
      slug: experiment.slug,
      title: experiment.title,
      summary: experiment.summary,
      tags: experiment.tags,
      links: {
        ...experiment.links,
        live: experiment.links.live ?? toAbsoluteUrl("/experiments"),
      },
    })),
    links: {
      website: toAbsoluteUrl("/"),
      work: toAbsoluteUrl("/work"),
      about: toAbsoluteUrl("/about"),
      contact: toAbsoluteUrl("/contact"),
      ask: toAbsoluteUrl("/ask"),
      github: getSocialLink(homeData.profile.socials, "GitHub"),
      linkedin: getSocialLink(homeData.profile.socials, "LinkedIn"),
      x: getSocialLink(homeData.profile.socials, "X"),
      email: homeData.profile.contactEmail
        ? `mailto:${homeData.profile.contactEmail}`
        : undefined,
    },
    ask: {
      enabled: Boolean(
        process.env.AI_GATEWAY_API_KEY ||
          (process.env.NODE_ENV !== "production" && process.env.ANTHROPIC_API_KEY)
      ),
      url: toAbsoluteUrl("/api/cli-card/ask"),
    },
  };

  return Response.json(payload, {
    headers: {
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
