import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profile: defineTable({
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
  }),
  experienceEntries: defineTable({
    company: v.string(),
    title: v.string(),
    summary: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    highlights: v.array(v.string()),
    skills: v.array(v.string()),
    sortOrder: v.number(),
  }).index("by_sort_order", ["sortOrder"]),
  capabilities: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    proofPoints: v.array(v.string()),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sort_order", ["sortOrder"]),
  projects: defineTable({
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
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"])
    .index("by_sort_order", ["sortOrder"]),
  posts: defineTable({
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
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_published_at", ["publishedAt"]),
  experiments: defineTable({
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
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_sort_order", ["sortOrder"]),
  siteSettings: defineTable({
    featuredProjectSlugs: v.array(v.string()),
    featuredPostSlugs: v.array(v.string()),
    featuredExperimentSlugs: v.optional(v.array(v.string())),
    notificationEmail: v.optional(v.string()),
  }),
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    message: v.string(),
    aiBrief: v.optional(
      v.object({
        summary: v.string(),
        goals: v.array(v.string()),
        scopeSignals: v.array(v.string()),
        nextSteps: v.array(v.string()),
      })
    ),
    matchedProjectSlugs: v.optional(v.array(v.string())),
    matchedPostSlugs: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("new"),
      v.literal("replied"),
      v.literal("archived")
    ),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
  aiKnowledgeDocuments: defineTable({
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
    .index("by_source", ["sourceType", "sourceSlug"])
    .index("by_published", ["published"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 3072,
      filterFields: ["sourceType", "published"],
    }),
});
