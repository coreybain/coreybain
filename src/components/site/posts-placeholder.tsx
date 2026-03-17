import Link from "next/link";

type PostsPlaceholderProps = {
  compact?: boolean;
};

export function PostsPlaceholder({ compact = false }: PostsPlaceholderProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
      <h3 className="text-xl font-medium sm:text-2xl">
        No blog posts published yet.
      </h3>
      <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-muted-foreground)] sm:text-base">
        Writing is on the way. For now, the best overview lives in the work
        section and the interactive Ask Corey experience.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/work"
          className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          Browse work
        </Link>
        {!compact ? (
          <Link
            href="/ask"
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)]"
          >
            Ask Corey
          </Link>
        ) : null}
      </div>
    </div>
  );
}
