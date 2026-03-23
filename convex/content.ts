import { embed } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalQuery,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { authComponent, isAdminEmail } from "./auth";
import {
  seedCapabilities,
  seedExperienceEntries,
  seedExperiments,
  seedPosts,
  seedProfile,
  seedProjects,
  seedSiteSettings,
} from "./seedData";

const EMBEDDING_DIMENSIONS = 3072;
const PROJECT_COMPANY_BY_SLUG: Record<string, string> = {
  quotecloud: "Corporate Interactive",
  traveldocs: "Corporate Interactive",
  "npx-card": "Independent / Product Builder",
};

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function tokenize(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function lexicalScore(haystack: string, title: string, queryText: string) {
  const queryTokens = tokenize(queryText);
  const lowerHaystack = haystack.toLowerCase();
  const lowerTitle = title.toLowerCase();

  return queryTokens.reduce((score, token) => {
    return (
      score +
      (lowerHaystack.includes(token) ? 1 : 0) +
      (lowerTitle.includes(token) ? 2 : 0)
    );
  }, 0);
}

function cosineSimilarity(left: number[], right: number[]) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function hashedEmbedding(value: string) {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = tokenize(value);

  for (const token of tokens) {
    let hash = 2166136261;

    for (const char of token) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }

    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    vector[index] += 1;
  }

  const magnitude = Math.sqrt(
    vector.reduce((sum, component) => sum + component * component, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((component) => component / magnitude);
}

async function makeEmbedding(value: string) {
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      const { embedding } = await embed({
        model: gateway.embedding("openai/text-embedding-3-large"),
        value,
      });

      return embedding;
    } catch (error) {
      console.error("Embedding generation failed, using deterministic fallback.", error);
    }
  }

  return hashedEmbedding(value);
}

async function requireAdmin(
  ctx: Parameters<typeof authComponent.safeGetAuthUser>[0]
) {
  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function getSingleton<T extends "profile" | "siteSettings">(
  ctx: Parameters<typeof query>[0] extends never ? never : any,
  table: T
) {
  return (await ctx.db.query(table).take(1))[0] as Doc<T> | undefined;
}

function sortBySortOrder<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((left, right) => left.sortOrder - right.sortOrder);
}

function sortPosts(posts: Doc<"posts">[]) {
  return [...posts].sort((left, right) =>
    left.publishedAt < right.publishedAt ? 1 : -1
  );
}

function resolveProjectCompany(project: {
  slug: string;
  company?: string | undefined;
}) {
  return (
    project.company?.trim() ||
    PROJECT_COMPANY_BY_SLUG[project.slug] ||
    "Independent / Product Builder"
  );
}

type ProjectLocation = "homepage" | "work" | "experiments";

type NormalizedProject = Omit<Doc<"projects">, "company" | "type" | "visibleOn"> & {
  company: string;
  type: "project" | "experiment";
  visibleOn: ProjectLocation[];
};

function normalizeProject(project: Doc<"projects">): NormalizedProject {
  return {
    ...project,
    type: project.type ?? "project",
    visibleOn:
      project.visibleOn && project.visibleOn.length > 0
        ? project.visibleOn
        : ["work"],
    company: resolveProjectCompany(project),
  };
}

function isProjectVisibleOn(
  project: NormalizedProject,
  location: ProjectLocation
) {
  return project.visibleOn.includes(location);
}

async function fetchPublishedPortfolioItems(
  ctx: Parameters<typeof query>[0] extends never ? never : any
) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_published", (queryBuilder: any) =>
      queryBuilder.eq("published", true)
    )
    .collect();

  return sortBySortOrder(projects as Doc<"projects">[]).map((project) =>
    normalizeProject(project)
  );
}

async function fetchPublishedProjects(
  ctx: Parameters<typeof query>[0] extends never ? never : any
) {
  const projects = await fetchPublishedPortfolioItems(ctx);
  return projects.filter((project) => isProjectVisibleOn(project, "work"));
}

async function fetchPublishedPosts(ctx: Parameters<typeof query>[0] extends never ? never : any) {
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_published", (queryBuilder: any) =>
      queryBuilder.eq("published", true)
    )
    .collect();

  return sortPosts(posts) as Doc<"posts">[];
}

async function fetchPublishedExperiments(
  ctx: Parameters<typeof query>[0] extends never ? never : any
) {
  const [portfolioItems, legacyExperiments] = await Promise.all([
    fetchPublishedPortfolioItems(ctx),
    ctx.db
      .query("experiments")
      .withIndex("by_published", (queryBuilder: any) =>
        queryBuilder.eq("published", true)
      )
      .collect(),
  ]);

  const typedExperiments = portfolioItems
    .filter((project) => isProjectVisibleOn(project, "experiments"))
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      body: project.body.join("\n\n"),
      tags: project.stack,
      links: {
        live: project.links.live,
        repo: project.links.repo,
        post: project.links.post,
      },
      featured: project.visibleOn.includes("homepage"),
      published: project.published,
      sortOrder: project.sortOrder,
    }));

  const typedExperimentSlugs = new Set(typedExperiments.map((experiment) => experiment.slug));
  const remainingLegacyExperiments = sortBySortOrder(
    legacyExperiments as Doc<"experiments">[]
  ).filter((experiment) => !typedExperimentSlugs.has(experiment.slug));

  return [...typedExperiments, ...remainingLegacyExperiments];
}

async function fetchCapabilities(ctx: Parameters<typeof query>[0] extends never ? never : any) {
  const capabilities = await ctx.db
    .query("capabilities")
    .withIndex("by_sort_order")
    .collect();

  return capabilities as Doc<"capabilities">[];
}

async function fetchExperienceEntries(
  ctx: Parameters<typeof query>[0] extends never ? never : any
) {
  return await ctx.db
    .query("experienceEntries")
    .withIndex("by_sort_order")
    .collect() as Promise<Doc<"experienceEntries">[]>;
}

function selectBySlugList<T extends { slug: string }>(
  items: T[],
  slugs: string[] | undefined,
  fallbackCount = 3
) {
  if (slugs && slugs.length > 0) {
    const bySlug = new Map(items.map((item) => [item.slug, item]));
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((item): item is T => Boolean(item));
  }

  return items.slice(0, fallbackCount);
}

function selectVisibleItems<
  T extends {
    visibleOn?: ProjectLocation[];
    sortOrder: number;
  },
>(items: T[], location: ProjectLocation, fallbackCount = 3) {
  const visible = items.filter((item) => item.visibleOn?.includes(location));
  if (visible.length > 0) {
    return visible;
  }

  return items.slice(0, fallbackCount);
}

function projectToKnowledgeDocument(project: NormalizedProject) {
  return {
    sourceType: "project" as const,
    sourceSlug: project.slug,
    title: project.title,
    url: project.type === "experiment" ? "/experiments" : `/work/${project.slug}`,
    plainText: [
      project.type,
      project.title,
      resolveProjectCompany(project),
      project.tagline,
      project.summary,
      project.body.join(" "),
      project.role ?? "",
      project.period ?? "",
      project.stack.join(" "),
      project.outcomes.join(" "),
      project.impactMetrics?.join(" ") ?? "",
      project.teamContext ?? "",
      project.responsibilities?.join(" ") ?? "",
      project.audience ?? "",
      project.lessonsLearned?.join(" ") ?? "",
    ].join(" "),
  };
}

function projectToAboutExperience(project: NormalizedProject) {
  return {
    company: resolveProjectCompany(project),
    title: project.role?.trim() || project.title,
    period: project.period?.trim() || "Selected work",
    summary: project.summary,
    highlights:
      project.outcomes.length > 0
        ? project.outcomes
        : project.responsibilities?.length
          ? project.responsibilities
          : project.body.slice(0, 3),
    sortOrder: project.sortOrder,
  };
}

function postToKnowledgeDocument(post: Doc<"posts">) {
  return {
    sourceType: "post" as const,
    sourceSlug: post.slug,
    title: post.title,
    url: `/blog/${post.slug}`,
    plainText: [post.title, post.excerpt, post.body.join(" "), post.tags.join(" ")].join(
      " "
    ),
  };
}

function pageKnowledgeDocuments(args: {
  profile: Doc<"profile"> | undefined;
  capabilities: Doc<"capabilities">[];
  experienceEntries: ReturnType<typeof projectToAboutExperience>[];
}) {
  if (!args.profile) {
    return [];
  }

  return [
    {
      sourceType: "page" as const,
      sourceSlug: "about",
      title: "About Corey Baines",
      url: "/about",
      plainText: [
        args.profile.headline,
        args.profile.subheadline,
        args.profile.summary.join(" "),
        args.profile.availability ?? "",
        args.capabilities
          .map((capability) =>
            [
              capability.title,
              capability.summary,
              capability.proofPoints.join(" "),
            ].join(" ")
          )
          .join(" "),
        args.experienceEntries
          .map((entry) =>
            [
              `${entry.title} at ${entry.company}`,
              entry.summary,
              entry.highlights.join(" "),
            ].join(" ")
          )
          .join(" "),
      ].join(" "),
    },
  ];
}

async function scheduleKnowledgeReindex(
  ctx: Parameters<typeof mutation>[0] extends never ? never : any
) {
  await ctx.scheduler.runAfter(
    0,
    (internal as any).content.rebuildKnowledgeIndex,
    {}
  );
}

export const seedInitialContentIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existingProfile = await ctx.db.query("profile").take(1);
    const existingProjects = await ctx.db.query("projects").take(1);

    if (existingProfile.length > 0 || existingProjects.length > 0) {
      return { seeded: false };
    }

    await ctx.db.insert("profile", seedProfile);
    await ctx.db.insert("siteSettings", seedSiteSettings);

    for (const capability of seedCapabilities) {
      await ctx.db.insert("capabilities", capability);
    }

    for (const entry of seedExperienceEntries) {
      await ctx.db.insert("experienceEntries", entry);
    }

    for (const project of seedProjects) {
      await ctx.db.insert("projects", project);
    }

    for (const post of seedPosts) {
      await ctx.db.insert("posts", post);
    }

    for (const experiment of seedExperiments) {
      await ctx.db.insert("experiments", experiment);
    }

    await scheduleKnowledgeReindex(ctx);

    return { seeded: true };
  },
});

export const getSiteChrome = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getSingleton(ctx, "profile");
    return { profile };
  },
});

export const getHomeData = query({
  args: {},
  handler: async (ctx) => {
    const [profile, settings, capabilities, portfolioItems, posts, experiments] =
      await Promise.all([
        getSingleton(ctx, "profile"),
        getSingleton(ctx, "siteSettings"),
        fetchCapabilities(ctx),
        fetchPublishedPortfolioItems(ctx),
        fetchPublishedPosts(ctx),
        fetchPublishedExperiments(ctx),
      ]);

    return {
      profile,
      capabilities,
      featuredProjects: selectVisibleItems(portfolioItems, "homepage", 3),
      latestPosts: selectBySlugList(posts, settings?.featuredPostSlugs, 2),
      featuredExperiments: selectBySlugList(
        experiments,
        settings?.featuredExperimentSlugs,
        2
      ),
      settings,
    };
  },
});

export const getAboutData = query({
  args: {},
  handler: async (ctx) => {
    const [profile, capabilities, projects] = await Promise.all([
      getSingleton(ctx, "profile"),
      fetchCapabilities(ctx),
      fetchPublishedPortfolioItems(ctx),
    ]);

    return {
      profile,
      capabilities,
      experienceEntries: projects
        .filter((project) => project.type === "project")
        .map(projectToAboutExperience),
    };
  },
});

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    return await fetchPublishedProjects(ctx);
  },
});

export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (queryBuilder) => queryBuilder.eq("slug", args.slug))
      .unique();

    if (!project || !project.published) {
      return null;
    }

    const normalizedProject = normalizeProject(project);
    if (
      normalizedProject.type !== "project" ||
      !isProjectVisibleOn(normalizedProject, "work")
    ) {
      return null;
    }

    return normalizedProject;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    return await fetchPublishedPosts(ctx);
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (queryBuilder) => queryBuilder.eq("slug", args.slug))
      .unique();

    if (!post || !post.published) {
      return null;
    }

    return post;
  },
});

export const getExperiments = query({
  args: {},
  handler: async (ctx) => {
    return await fetchPublishedExperiments(ctx);
  },
});

export const getSettingsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [profile, siteSettings, capabilities] =
      await Promise.all([
        getSingleton(ctx, "profile"),
        getSingleton(ctx, "siteSettings"),
        fetchCapabilities(ctx),
      ]);

    return {
      profile,
      siteSettings,
      capabilities,
    };
  },
});

export const listProjectsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const projects = await ctx.db.query("projects").withIndex("by_sort_order").collect();
    return projects.map((project) => normalizeProject(project));
  },
});

export const listPostsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const posts = await ctx.db.query("posts").collect();
    return sortPosts(posts);
  },
});

export const listExperimentsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("experiments").withIndex("by_sort_order").collect();
  },
});

export const searchKnowledgeDocuments = query({
  args: {
    queryText: v.string(),
    limit: v.optional(v.number()),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("aiKnowledgeDocuments")
      .withIndex("by_published", (queryBuilder) =>
        queryBuilder.eq("published", true)
      )
      .collect();

    const ranked = documents
      .map((document) => {
        const lexical = lexicalScore(
          document.plainText,
          document.title,
          args.queryText
        );
        const semantic = args.embedding
          ? cosineSimilarity(document.embedding, args.embedding)
          : 0;

        return {
          ...document,
          _score: lexical + semantic * 4,
        };
      })
      .sort((left, right) => right._score - left._score);

    return ranked.slice(0, args.limit ?? 4);
  },
});

export const saveProfile = mutation({
  args: {
    headline: v.string(),
    subheadline: v.string(),
    availability: v.optional(v.string()),
    location: v.optional(v.string()),
    summary: v.array(v.string()),
    socialLinks: v.array(
      v.object({
        label: v.string(),
        href: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await getSingleton(ctx, "profile");

    if (existing) {
      await ctx.db.patch(existing._id, args);
      await scheduleKnowledgeReindex(ctx);
      return existing._id;
    }

    const id = await ctx.db.insert("profile", args);
    await scheduleKnowledgeReindex(ctx);
    return id;
  },
});

export const saveSiteSettings = mutation({
  args: {
    featuredProjectSlugs: v.array(v.string()),
    featuredPostSlugs: v.array(v.string()),
    featuredExperimentSlugs: v.optional(v.array(v.string())),
    notificationEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await getSingleton(ctx, "siteSettings");

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("siteSettings", args);
  },
});

export const saveCapability = mutation({
  args: {
    id: v.optional(v.id("capabilities")),
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    proofPoints: v.array(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...payload } = args;

    if (id) {
      await ctx.db.patch(id, payload);
      await scheduleKnowledgeReindex(ctx);
      return id;
    }

    const newId = await ctx.db.insert("capabilities", payload);
    await scheduleKnowledgeReindex(ctx);
    return newId;
  },
});

export const deleteCapability = mutation({
  args: { id: v.id("capabilities") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await scheduleKnowledgeReindex(ctx);
  },
});

export const saveExperienceEntry = mutation({
  args: {
    id: v.optional(v.id("experienceEntries")),
    company: v.string(),
    title: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    summary: v.string(),
    highlights: v.array(v.string()),
    skills: v.array(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...payload } = args;

    if (id) {
      await ctx.db.patch(id, payload);
      await scheduleKnowledgeReindex(ctx);
      return id;
    }

    const newId = await ctx.db.insert("experienceEntries", payload);
    await scheduleKnowledgeReindex(ctx);
    return newId;
  },
});

export const deleteExperienceEntry = mutation({
  args: { id: v.id("experienceEntries") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await scheduleKnowledgeReindex(ctx);
  },
});

const projectArgs = {
  id: v.optional(v.id("projects")),
  slug: v.string(),
  type: v.optional(v.union(v.literal("project"), v.literal("experiment"))),
  visibleOn: v.optional(
    v.array(
      v.union(
        v.literal("homepage"),
        v.literal("work"),
        v.literal("experiments")
      )
    )
  ),
  title: v.string(),
  company: v.optional(v.string()),
  tagline: v.string(),
  summary: v.string(),
  body: v.array(v.string()),
  role: v.optional(v.string()),
  period: v.optional(v.string()),
  status: v.optional(v.string()),
  stack: v.array(v.string()),
  outcomes: v.array(v.string()),
  impactMetrics: v.optional(v.array(v.string())),
  teamContext: v.optional(v.string()),
  responsibilities: v.optional(v.array(v.string())),
  audience: v.optional(v.string()),
  lessonsLearned: v.optional(v.array(v.string())),
  media: v.optional(
    v.array(
      v.object({
        type: v.union(v.literal("image"), v.literal("video")),
        src: v.string(),
        alt: v.string(),
      })
    )
  ),
  links: v.object({
    live: v.optional(v.string()),
    repo: v.optional(v.string()),
    store: v.optional(v.string()),
    video: v.optional(v.string()),
    post: v.optional(v.string()),
  }),
  featured: v.boolean(),
  published: v.boolean(),
  sortOrder: v.number(),
};

export const saveProject = mutation({
  args: projectArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const visibleOn: ProjectLocation[] =
      rest.visibleOn && rest.visibleOn.length > 0 ? rest.visibleOn : ["work"];
    const payload = {
      ...rest,
      type: rest.type ?? "project",
      visibleOn,
    };

    if (id) {
      await ctx.db.patch(id, payload);
      await scheduleKnowledgeReindex(ctx);
      return id;
    }

    const newId = await ctx.db.insert("projects", payload);
    await scheduleKnowledgeReindex(ctx);
    return newId;
  },
});

export const backfillProjectCompanies = mutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    let updated = 0;

    for (const project of projects) {
      if (project.company?.trim()) {
        continue;
      }

      await ctx.db.patch(project._id, {
        company: resolveProjectCompany(project),
      });
      updated += 1;
    }

    if (updated > 0) {
      await scheduleKnowledgeReindex(ctx);
    }

    return { updated };
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await scheduleKnowledgeReindex(ctx);
  },
});

const postArgs = {
  id: v.optional(v.id("posts")),
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  body: v.array(v.string()),
  coverImage: v.optional(v.string()),
  tags: v.array(v.string()),
  publishedAt: v.string(),
  updatedAt: v.optional(v.string()),
  published: v.boolean(),
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
};

export const savePost = mutation({
  args: postArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...payload } = args;

    if (id) {
      await ctx.db.patch(id, payload);
      await scheduleKnowledgeReindex(ctx);
      return id;
    }

    const newId = await ctx.db.insert("posts", payload);
    await scheduleKnowledgeReindex(ctx);
    return newId;
  },
});

export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    await scheduleKnowledgeReindex(ctx);
  },
});

const experimentArgs = {
  id: v.optional(v.id("experiments")),
  slug: v.string(),
  title: v.string(),
  summary: v.string(),
  body: v.string(),
  published: v.boolean(),
  tags: v.array(v.string()),
  featured: v.boolean(),
  sortOrder: v.number(),
  links: v.object({
    live: v.optional(v.string()),
    repo: v.optional(v.string()),
    post: v.optional(v.string()),
  }),
};

export const saveExperiment = mutation({
  args: experimentArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...payload } = args;

    if (id) {
      await ctx.db.patch(id, payload);
      return id;
    }

    return await ctx.db.insert("experiments", payload);
  },
});

export const deleteExperiment = mutation({
  args: { id: v.id("experiments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const updateMessageStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.union(
      v.literal("new"),
      v.literal("replied"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const getNotificationEmail = query({
  args: {},
  handler: async (ctx) => {
    const settings = await getSingleton(ctx, "siteSettings");
    return settings?.notificationEmail ?? "corey@spiritdevs.com";
  },
});

export const getMessageByIdAdmin = query({
  args: { id: v.id("contactSubmissions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const knowledgeSnapshot = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [profile, capabilities, portfolioItems, posts] =
      await Promise.all([
        getSingleton(ctx, "profile"),
        fetchCapabilities(ctx),
        fetchPublishedPortfolioItems(ctx),
        fetchPublishedPosts(ctx),
      ]);

    const experienceEntries = portfolioItems
      .filter((project) => project.type === "project")
      .map(projectToAboutExperience);

    return {
      documents: [
        ...portfolioItems.map(projectToKnowledgeDocument),
        ...posts.map(postToKnowledgeDocument),
        ...pageKnowledgeDocuments({ profile, capabilities, experienceEntries }),
      ],
    };
  },
});

export const rebuildKnowledgeIndex = internalAction({
  args: {},
  handler: async (ctx) => {
    const snapshot = (await ctx.runQuery(
      (internal as any).content.knowledgeSnapshot,
      {}
    )) as {
      documents: Array<{
        sourceType: "project" | "post" | "page";
        sourceSlug: string;
        title: string;
        url: string;
        plainText: string;
      }>;
    };
    const documents = await Promise.all(
      snapshot.documents.map(async (document) => ({
        ...document,
        published: true,
        updatedAt: Date.now(),
        embedding: await makeEmbedding(document.plainText),
      }))
    );

    await ctx.runMutation((internal as any).content.replaceKnowledgeDocuments, {
      documents,
    });

    return { count: documents.length };
  },
});

export const replaceKnowledgeDocuments = internalMutation({
  args: {
    documents: v.array(
      v.object({
        sourceType: v.union(
          v.literal("project"),
          v.literal("post"),
          v.literal("page")
        ),
        sourceSlug: v.string(),
        title: v.string(),
        url: v.string(),
        plainText: v.string(),
        published: v.boolean(),
        embedding: v.array(v.float64()),
        updatedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("aiKnowledgeDocuments").collect();

    for (const document of existing) {
      await ctx.db.delete(document._id);
    }

    for (const document of args.documents) {
      await ctx.db.insert("aiKnowledgeDocuments", document);
    }
  },
});

export const rebuildKnowledgeIndexNow = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.content.rebuildKnowledgeIndex, {});
    return { ok: true };
  },
});
