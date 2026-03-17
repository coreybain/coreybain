import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { PostCard } from "@/components/site/post-card";
import { PostsPlaceholder } from "@/components/site/posts-placeholder";
import { SectionHeading } from "@/components/site/section-heading";
import { getPublishedPosts } from "@/lib/site/public-data";

export const metadata: Metadata = buildMetadata({
  title: "Blog - Corey Baines",
  description:
    "Writing on architecture, delivery, and practical product engineering.",
  path: "/blog",
});

export default async function BlogPage() {
  const postList = await getPublishedPosts();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Blog"
        title="Writing on architecture, delivery, and product engineering."
        description="Practical notes from building and shipping software."
      />
      <section>
        {postList.length > 0 ? (
          postList.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <PostsPlaceholder />
        )}
      </section>
    </div>
  );
}
