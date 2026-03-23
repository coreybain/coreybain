import type { Metadata } from "next";
import Link from "next/link";
import { AskPromptButtons } from "@/components/site/ask-prompt-buttons";
import { PostCard } from "@/components/site/post-card";
import { PostsPlaceholder } from "@/components/site/posts-placeholder";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/site/section-heading";
import { StructuredData } from "@/components/site/structured-data";
import { TerminalCard } from "@/components/site/terminal-card";
import { buildMetadata } from "@/app/seo";
import { askCoreyPrompts } from "@/lib/site/ask-prompts";
import { getHomePageData } from "@/lib/site/public-data";
import { toAbsoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Corey Baines - Principal Full-Stack Engineer",
  description:
    "Case studies, writing, and an AI-assisted interactive resume for hiring teams and collaborators.",
  path: "/",
});

export default async function HomePage() {
  const { featuredProjects, latestPosts, profile } = await getHomePageData();
  const capabilityCards = [
    {
      title: "System Architecture & Scale",
      summary:
        "Design distributed systems, multi-tenant SaaS platforms, and event-driven architectures.",
    },
    {
      title: "AI-Native Product Development",
      summary:
        "Integrate LLMs into real workflows (not demos): automation, agents, retrieval, copilots.",
    },
    {
      title: "Real-Time Systems",
      summary:
        "Build low-latency systems (auctions, tracking, live updates, streaming).",
    },
    {
      title: "End-to-End Ownership",
      summary:
        "From product ideation \u2192 architecture \u2192 delivery \u2192 scaling \u2192 optimisation.",
    },
  ];
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    description: profile.summary,
    url: toAbsoluteUrl("/"),
    sameAs: profile.socials.map((social) => social.href),
    ...(profile.contactEmail ? { email: profile.contactEmail } : {}),
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-20 px-5 py-14 sm:px-8 sm:py-20">
      <StructuredData data={personJsonLd} />
      <section className="space-y-8">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          {profile.headline}
        </p>
        <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-[38px]">
          {profile.subheadline}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-[color:var(--color-muted-foreground)]">
          {profile.summary}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/work"
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-2 text-sm font-medium transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-surface-solid)] hover:text-[color:var(--color-accent)]"
          >
            View work
          </Link>
          <Link
            href="/ask"
            className="rounded-full border border-[color:var(--color-border)] px-5 py-2 text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface-solid)] hover:text-[color:var(--color-foreground)]"
          >
            Ask Corey
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[color:var(--color-border)] px-5 py-2 text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface-solid)] hover:text-[color:var(--color-foreground)]"
          >
            Contact
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {capabilityCards.map((capability) => (
          <article
            key={capability.title}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
          >
            <h2 className="text-lg font-medium">{capability.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
              {capability.summary}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Selected Work"
          title="Case studies, shipped products, and practical experiments."
          description="A curated mix of work that shows how I approach architecture, delivery, and product outcomes."
        />
        <div>
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Ask Corey"
          title="Interactive, citation-first resume search."
          description="Ask about architecture, leadership, AI integration, or project fit. Responses are grounded in published content."
        />
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
          <AskPromptButtons prompts={askCoreyPrompts} />
          <Link
            href="/ask"
            className="mt-5 inline-block text-sm font-medium text-[color:var(--color-accent)]"
          >
            Open Ask Corey
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Latest Writing"
          title="Notes on architecture, product, and delivery."
        />
        <div>
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <PostsPlaceholder compact />
          )}
        </div>
      </section>

      <TerminalCard />
    </div>
  );
}
