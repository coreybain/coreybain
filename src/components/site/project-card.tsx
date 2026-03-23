import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Project } from "@/lib/site/types";

type ProjectCardProps = {
  project: Project;
};

const statusLabel: Record<Project["status"], string> = {
  active: "Active",
  maintained: "Maintained",
  archived: "Archived",
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group border-b border-[color:var(--color-border)] py-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xl font-medium">{project.title}</h3>
        <span className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-xs text-[color:var(--color-muted-foreground)]">
          {statusLabel[project.status]}
        </span>
      </div>
      <p className="text-xs font-mono tracking-[0.12em] uppercase text-[color:var(--color-muted-foreground)]">
        {project.company}
      </p>
      <p className="mt-2 text-sm text-[color:var(--color-foreground)]">
        {project.tagline}
      </p>
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        {project.role} / {project.period}
      </p>
      <div className="mt-3 max-w-3xl text-[color:var(--color-muted-foreground)] [&>*+*]:mt-3 [&_a]:font-medium [&_a]:underline [&_li]:whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:whitespace-pre-wrap [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <ReactMarkdown>{project.summary}</ReactMarkdown>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.slice(0, 5).map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-[color:var(--color-surface-alt)] px-2.5 py-1 text-xs text-[color:var(--color-muted-foreground)]"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/work/${project.slug}`}
          className="text-sm font-medium transition-colors group-hover:text-[color:var(--color-accent)]"
        >
          Read case study
        </Link>
        {project.links.live ? (
          <Link
            href={project.links.live}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)]"
          >
            Live
          </Link>
        ) : null}
      </div>
    </article>
  );
}
