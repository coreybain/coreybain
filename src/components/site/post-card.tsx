import Link from "next/link";
import type { Post } from "@/lib/site/types";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-[color:var(--color-border)] py-6">
      <p className="text-xs tracking-[0.08em] text-[color:var(--color-muted-foreground)] uppercase">
        {new Date(post.publishedAt).toLocaleDateString("en-AU", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>
      <h3 className="mt-2 text-xl font-medium">
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-3xl text-[color:var(--color-muted-foreground)]">
        {post.excerpt}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-xs text-[color:var(--color-muted-foreground)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
