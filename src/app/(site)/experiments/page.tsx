import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { SectionHeading } from "@/components/site/section-heading";
import { getPublishedExperiments } from "@/lib/site/public-data";

export const metadata: Metadata = buildMetadata({
  title: "Experiments - Corey Baines",
  description:
    "AI and engineering experiments exploring practical workflows and product ideas.",
  path: "/experiments",
});

export default async function ExperimentsPage() {
  const experimentList = await getPublishedExperiments();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Experiments"
        title="Small R&D projects and practical prototypes."
        description="A running collection of ideas tested in code, from AI workflows to product UX concepts."
      />
      <section className="grid gap-4 sm:grid-cols-2">
        {experimentList.map((experiment) => (
          <article
            key={experiment.slug}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
          >
            <h2 className="text-lg font-medium">{experiment.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
              {experiment.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {experiment.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-xs text-[color:var(--color-muted-foreground)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            {experiment.links.repo ? (
              <Link
                href={experiment.links.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-block text-sm text-[color:var(--color-accent)]"
              >
                Repository
              </Link>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
