import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/app/seo";
import { StructuredData } from "@/components/site/structured-data";
import { getPostBySlug, getPublishedPosts } from "@/lib/site/public-data";
import { toAbsoluteUrl } from "@/lib/site-config";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Post Not Found - Corey Baines",
      description: "This blog post could not be found.",
      path: "/blog",
    });
  }

  return buildMetadata({
    title: `${post.title} - Corey Baines`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedIso = new Date(post.publishedAt).toISOString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: publishedIso,
    dateModified: publishedIso,
    mainEntityOfPage: toAbsoluteUrl(`/blog/${post.slug}`),
    author: {
      "@type": "Person",
      name: "Corey Baines",
    },
    publisher: {
      "@type": "Person",
      name: "Corey Baines",
    },
  };

  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <StructuredData data={articleJsonLd} />
      <header className="space-y-4">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          {new Date(post.publishedAt).toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
          {post.title}
        </h1>
        <p className="text-lg text-[color:var(--color-muted-foreground)]">
          {post.excerpt}
        </p>
      </header>

      <section className="space-y-5">
        {post.body.map((paragraph) => (
          <p
            key={paragraph}
            className="text-pretty text-[color:var(--color-muted-foreground)]"
          >
            {paragraph}
          </p>
        ))}
      </section>
    </article>
  );
}
