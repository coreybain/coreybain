import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getPublishedProjects } from "@/lib/site/public-data";

export const metadata: Metadata = buildMetadata({
  title: "Work - Corey Baines",
  description:
    "Selected case studies and shipped products across SaaS, mobile, and developer experiences.",
  path: "/work",
});

export default async function WorkPage() {
  const projectList = await getPublishedProjects();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Work"
        title="Case studies, shipped products, and practical outcomes."
        description="A curated view of projects across SaaS workflows, mobile products, and developer-facing experiences."
      />
      <section>
        {projectList.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>
    </div>
  );
}
