import Link from "next/link";
import { Markdown } from "@/components/ui/markdown";
import type { Project } from "@/lib/site/types";

type ProjectCardProps = {
  project: Project;
};

const statusLabel: Record<Exclude<Project["status"], undefined>, string> = {
  active: "Active",
  maintained: "Maintained",
  archived: "Archived",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const status = project.status ?? "active";
  const isExperiment = project.type === "experiment";
  const primaryLink = isExperiment
    ? project.links.post ?? project.links.live ?? project.links.repo
    : `/work/${project.slug}`;
  const primaryLabel = isExperiment ? "Explore experiment" : "Read case study";
  const badges = project.stack.slice(0, 5);

  return (
    <article className="group border-b border-[color:var(--color-border)] py-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xl font-medium">{project.title}</h3>
        <span className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-xs text-[color:var(--color-muted-foreground)]">
          {isExperiment ? "Experiment" : statusLabel[status]}
        </span>
      </div>
      {project.company ? (
        <p className="text-xs font-mono tracking-[0.12em] uppercase text-[color:var(--color-muted-foreground)]">
          {project.company}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-[color:var(--color-foreground)]">
        {project.tagline}
      </p>
      {project.role || project.period ? (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          {[project.role, project.period].filter(Boolean).join(" / ")}
        </p>
      ) : null}
      <div className="mt-3 max-w-3xl text-[color:var(--color-muted-foreground)] [&>*+*]:mt-3 [&_a]:font-medium [&_a]:underline [&_li]:whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:whitespace-pre-wrap [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <Markdown>{project.summary}</Markdown>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-[color:var(--color-surface-alt)] px-2.5 py-1 text-xs text-[color:var(--color-muted-foreground)]"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        {primaryLink ? (
          <Link
            href={primaryLink}
            target={isExperiment && primaryLink.startsWith("http") ? "_blank" : undefined}
            rel={isExperiment && primaryLink.startsWith("http") ? "noreferrer noopener" : undefined}
            className="text-sm font-medium transition-colors group-hover:text-[color:var(--color-accent)]"
          >
            {primaryLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
