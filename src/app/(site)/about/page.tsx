import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { SectionHeading } from "@/components/site/section-heading";
import { StructuredData } from "@/components/site/structured-data";
import { getAboutPageData } from "@/lib/site/public-data";
import { toAbsoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "About Corey Baines",
  description:
    "Experience timeline, capabilities, and the engineering approach Corey brings to product teams.",
  path: "/about",
});

export default async function AboutPage() {
  const { profile, capabilities, experienceEntries } = await getAboutPageData();
  const orderedExperience = [...experienceEntries].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    description: profile.summary,
    url: toAbsoluteUrl("/about"),
    sameAs: profile.socials.map((social) => social.href),
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-5 py-14 sm:px-8 sm:py-20">
      <StructuredData data={personJsonLd} />
      <section className="space-y-4">
        <SectionHeading
          eyebrow="About"
          title={profile.name}
          description={`${profile.headline}. ${profile.availability}`}
        />
        <div className="max-w-3xl space-y-4 text-[color:var(--color-muted-foreground)]">
          {profile.summaryParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Experience"
          title="Timeline"
          description="Selected roles and work contexts that shaped my approach."
        />
        <div className="space-y-6">
          {orderedExperience.map((entry) => (
            <article
              key={`${entry.company}-${entry.startDate}`}
              className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
            >
              <p className="text-xs tracking-[0.08em] text-[color:var(--color-muted-foreground)] uppercase">
                {entry.startDate} - {entry.endDate ?? "Present"}
              </p>
              <h2 className="mt-2 text-xl font-medium">
                {entry.title} / {entry.company}
              </h2>
              <p className="mt-3 text-[color:var(--color-muted-foreground)]">
                {entry.summary}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Capabilities" title="What I bring to teams" />
        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map((capability) => (
            <article
              key={capability.slug}
              className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
            >
              <h3 className="text-lg font-medium">{capability.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
                {capability.summary}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-[color:var(--color-muted-foreground)]">
                {capability.proofPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
