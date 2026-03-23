import type { Doc } from "./_generated/dataModel";

type ProjectSeed = Omit<Doc<"projects">, "_id" | "_creationTime">;

export const seedProfile = {
  headline: "Principal / Lead Full-Stack Engineer",
  subheadline:
    "Building reliable products across web, backend, and Apple platforms.",
  availability: "Open to exploring new product and engineering opportunities.",
  location: "Sydney, Australia",
  summary: [
    "I build product-focused software across web, backend, and Apple platforms, with a focus on architecture, delivery, and real business outcomes.",
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/coreybain" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/coreybaines/" },
    { label: "X", href: "https://www.x.com/coreybaines" },
  ],
};

export const seedCapabilities = [
  {
    slug: "system-architecture-scale",
    title: "System Architecture & Scale",
    summary:
      "Design distributed systems, multi-tenant SaaS platforms, and event-driven architectures.",
    proofPoints: [
      "Distributed systems and modular service boundaries",
      "Multi-tenant SaaS design with scale and operability in mind",
    ],
    sortOrder: 1,
  },
  {
    slug: "ai-native-product-development",
    title: "AI-Native Product Development",
    summary:
      "Integrate LLMs into real workflows (not demos): automation, agents, retrieval, copilots.",
    proofPoints: [
      "Applied AI features grounded in production workflows",
      "Agents, retrieval, and copilots designed for practical use",
    ],
    sortOrder: 2,
  },
  {
    slug: "real-time-systems",
    title: "Real-Time Systems",
    summary:
      "Build low-latency systems (auctions, tracking, live updates, streaming).",
    proofPoints: [
      "Low-latency event flows and live state updates",
      "Realtime user experiences with operational reliability",
    ],
    sortOrder: 3,
  },
  {
    slug: "end-to-end-ownership",
    title: "End-to-End Ownership",
    summary:
      "From product ideation → architecture → delivery → scaling → optimisation.",
    proofPoints: [
      "Hands-on delivery from concept through production scaling",
      "Balances product direction, technical design, and execution",
    ],
    sortOrder: 4,
  },
];

export const seedExperienceEntries = [
  {
    company: "Corporate Interactive",
    title: "Principal / Lead Engineer",
    startDate: "2017-01",
    summary:
      "Led full-stack delivery across product initiatives spanning web platforms, backend systems, and customer-facing workflows.",
    highlights: [
      "Owned architecture and delivery standards across multiple streams",
      "Mentored engineers and supported cross-team execution",
      "Improved release confidence through tighter engineering practices",
    ],
    skills: ["Next.js", "React", "Java", "Node.js", "AWS", "CI/CD"],
    sortOrder: 1,
  },
  {
    company: "Independent / Product Builder",
    title: "Builder",
    startDate: "2021-01",
    summary:
      "Built and shipped product ideas, technical experiments, and developer tooling.",
    highlights: [
      "Shipped SaaS and mobile projects with production users",
      "Explored practical AI-assisted workflows for product teams",
      "Maintained public writing and open-source style artifacts",
    ],
    skills: ["TypeScript", "Swift", "Product Strategy", "UX"],
    sortOrder: 2,
  },
];

export const seedProjects: ProjectSeed[] = [
  {
    slug: "quotecloud",
    type: "project",
    visibleOn: ["homepage", "work"],
    title: "QuoteCloud",
    company: "Corporate Interactive",
    tagline: "Sales quote and proposal workflows built for speed.",
    summary:
      "A focused B2B workflow product designed to reduce friction in quote generation and proposal delivery.",
    body: [
      "QuoteCloud was built around a simple principle: sales teams should spend less time formatting and more time closing.",
      "The product flow emphasizes rapid quote creation, reusable structures, and proposal consistency.",
      "Engineering work focused on reliability, clarity, and practical operator workflows.",
    ],
    role: "Product Engineering Lead",
    period: "2023 - Present",
    status: "active",
    stack: ["Next.js", "TypeScript", "React", "Node.js"],
    outcomes: [
      "Reduced operational friction in quote preparation",
      "Improved confidence in proposal quality and consistency",
    ],
    impactMetrics: [
      "Faster quote turnaround for sales workflows",
      "Higher consistency across proposal outputs",
    ],
    teamContext: "Small product-focused team",
    responsibilities: [
      "Architecture and implementation leadership",
      "Feature prioritization and delivery planning",
      "Developer workflow and quality standards",
    ],
    audience: "Sales and operations teams",
    lessonsLearned: [
      "Simple UX patterns outperform feature-heavy forms",
      "Clear content models accelerate long-term product velocity",
    ],
    links: {
      live: "https://quote.cloud",
      video: "https://www.youtube.com/@quotecloud",
    },
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    slug: "traveldocs",
    type: "project",
    visibleOn: ["homepage", "work"],
    title: "TravelDocs",
    company: "Corporate Interactive",
    tagline: "Smart itinerary and document management for travel.",
    summary:
      "An iOS-first product to organize itineraries and critical travel documents with offline access.",
    body: [
      "TravelDocs addresses a common travel pain point: scattered confirmations, tickets, and notes.",
      "The product combines itinerary structure with secure offline document availability.",
      "Implementation favored speed, clarity, and resilience in low-connectivity contexts.",
    ],
    role: "Product Engineer",
    period: "2024 - Present",
    status: "maintained",
    stack: ["Swift", "SwiftUI", "iOS"],
    outcomes: [
      "Improved trip-day readiness through centralized information",
      "Stronger confidence with offline access to important documents",
    ],
    links: {
      store: "https://apps.apple.com/us/app/traveldocs/id6477499212",
    },
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    slug: "npx-card",
    type: "project",
    visibleOn: ["work"],
    title: "npx coreybaines",
    company: "Independent / Product Builder",
    tagline: "A lightweight CLI profile card for quick intros.",
    summary:
      "A small but memorable developer artifact that showcases profile info through a terminal command.",
    body: [
      "The project is intentionally simple and focused: one command that introduces who I am and what I work on.",
      "It works as both a playful brand touchpoint and a practical profile shortcut.",
    ],
    role: "Creator",
    period: "2022 - Present",
    status: "maintained",
    stack: ["Node.js", "JavaScript"],
    outcomes: [
      "Created a distinctive, shareable developer profile moment",
      "Added a memorable call-to-action for technical audiences",
    ],
    links: {
      repo: "https://github.com/coreybain/npx_card",
    },
    featured: false,
    published: true,
    sortOrder: 3,
  },
];

export const seedPosts = [
  {
    slug: "designing-for-reliability-in-small-teams",
    title: "Designing for Reliability in Small Teams",
    excerpt:
      "How to keep momentum while still building systems that hold up under pressure.",
    body: [
      "Small teams move quickly, but speed without structure eventually becomes drag.",
      "This post outlines a practical reliability baseline: release checkpoints, ownership clarity, and observability defaults.",
    ],
    tags: ["Architecture", "Delivery", "Leadership"],
    publishedAt: "2026-02-10",
    published: true,
  },
  {
    slug: "building-ai-features-that-actually-help",
    title: "Building AI Features That Actually Help",
    excerpt:
      "A pragmatic framework for AI features that improve workflows instead of adding noise.",
    body: [
      "Good AI features are invisible in the right way: they reduce effort and improve decision quality.",
      "We can evaluate AI feature quality by asking whether users complete a task faster, with fewer errors, and more confidence.",
    ],
    tags: ["AI", "Product", "UX"],
    publishedAt: "2026-01-21",
    published: true,
  },
  {
    slug: "swiftui-lessons-from-real-product-work",
    title: "SwiftUI Lessons from Real Product Work",
    excerpt:
      "Patterns that held up in production across offline state, sync, and long-lived views.",
    body: [
      "SwiftUI shines when state modeling is deliberate and view boundaries are clean.",
      "This article focuses on decisions that reduced bugs and made iteration faster.",
    ],
    tags: ["SwiftUI", "iOS", "Engineering"],
    publishedAt: "2025-12-18",
    published: true,
  },
];

export const seedExperiments = [
  {
    slug: "ask-corey-rag-prototype",
    title: "Ask Corey RAG Prototype",
    summary:
      "A grounded Q&A flow over project and writing content with citation-first responses.",
    body: "Prototype focused on reliable retrieval, concise responses, and transparent source references.",
    tags: ["AI", "RAG", "Vercel AI SDK"],
    links: {},
    featured: true,
    published: true,
    sortOrder: 1,
  },
];

export const seedSiteSettings = {
  featuredProjectSlugs: ["quotecloud", "traveldocs", "npx-card"],
  featuredPostSlugs: [
    "designing-for-reliability-in-small-teams",
    "building-ai-features-that-actually-help",
  ],
  featuredExperimentSlugs: ["ask-corey-rag-prototype"],
  notificationEmail: "corey@spiritdevs.com",
};
