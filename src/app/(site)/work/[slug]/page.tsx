import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/app/seo";
import { StructuredData } from "@/components/site/structured-data";
import {
  getPublishedProjects,
  getProjectBySlug,
} from "@/lib/site/public-data";
import { toAbsoluteUrl } from "@/lib/site-config";

type WorkDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

function stripMarkdown(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~`>#]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return buildMetadata({
      title: "Project Not Found - Corey Baines",
      description: "This project page could not be found.",
      path: "/work",
    });
  }

  const summaryText = stripMarkdown(project.summary);

  return buildMetadata({
    title: `${project.title} - Case Study`,
    description: summaryText,
    path: `/work/${project.slug}`,
    type: "article",
  });
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const summaryText = stripMarkdown(project.summary);

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: summaryText,
    url: toAbsoluteUrl(`/work/${project.slug}`),
    creator: {
      "@type": "Person",
      name: "Corey Baines",
    },
    genre: "Software case study",
    keywords: project.stack.join(", "),
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 px-5 py-14 sm:px-8 sm:py-20">
      <StructuredData data={projectJsonLd} />
      <header className="space-y-4">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          Case Study
        </p>
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          {project.company}
        </p>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
          {project.title}
        </h1>
        <p className="text-lg text-[color:var(--color-muted-foreground)]">
          {project.tagline}
        </p>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          {project.role} / {project.period}
        </p>
      </header>

      <section className="space-y-5">
        {project.body.map((paragraph) => (
          <p
            key={paragraph}
            className="text-pretty text-[color:var(--color-muted-foreground)]"
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <h2 className="text-lg font-medium">Outcomes</h2>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
            {project.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <h2 className="text-lg font-medium">Stack</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-xs text-[color:var(--color-muted-foreground)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="flex flex-wrap items-center gap-4">
        {project.links.live ? (
          <Link
            href={project.links.live}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
          >
            Visit live product
          </Link>
        ) : null}
        {project.links.store ? (
          <Link
            href={project.links.store}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
          >
            Open app store
          </Link>
        ) : null}
        {project.links.repo ? (
          <Link
            href={project.links.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
          >
            View repository
          </Link>
        ) : null}
      </section>
    </div>
  );
}
