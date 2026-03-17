"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

type PostRecord = Doc<"posts">;

type Props = {
  initialPosts: PostRecord[];
};

type PostDraft = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string;
  publishedAt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
};

const initialDraft: PostDraft = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  tags: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  coverImage: "",
  seoTitle: "",
  seoDescription: "",
  published: false,
};

function fromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toDraft(post: PostRecord): PostDraft {
  return {
    id: String(post._id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body.join("\n"),
    tags: post.tags.join(", "),
    publishedAt: post.publishedAt,
    coverImage: post.coverImage ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    published: post.published,
  };
}

export function AdminPostsManager({ initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<PostDraft>(initialDraft);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useConvexAuth();

  const savePost = useMutation(api.content.savePost);
  const deletePost = useMutation(api.content.deletePost);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((left, right) => {
        if (left.publishedAt === right.publishedAt) {
          return left.title.localeCompare(right.title);
        }
        return left.publishedAt < right.publishedAt ? 1 : -1;
      }),
    [posts]
  );

  const updateDraftField = <Key extends keyof PostDraft>(key: Key, value: PostDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const canMutate = isAuthenticated && !isLoading;

  const ensureAuthenticated = () => {
    if (canMutate) {
      return true;
    }

    setNotice("Admin auth is still syncing. Refresh or wait a moment, then try again.");
    return false;
  };

  const patchRow = (id: Id<"posts">, patch: Partial<PostRecord>) => {
    setPosts((current) =>
      current.map((post) => (post._id === id ? { ...post, ...patch } : post))
    );
  };

  const removeRow = (id: Id<"posts">) => {
    setPosts((current) => current.filter((post) => post._id !== id));
    if (draft.id === String(id)) {
      setDraft(initialDraft);
    }
  };

  const saveDraft = () => {
    setNotice(null);
    if (!ensureAuthenticated()) {
      return;
    }
    startTransition(async () => {
      setIsSaving(true);
      try {
        const payload = {
          id: draft.id ? (draft.id as Id<"posts">) : undefined,
          slug: draft.slug.trim(),
          title: draft.title.trim(),
          excerpt: draft.excerpt.trim(),
          body: fromLines(draft.body),
          tags: fromCsv(draft.tags),
          publishedAt: draft.publishedAt.trim(),
          coverImage: draft.coverImage.trim() || undefined,
          updatedAt: new Date().toISOString().slice(0, 10),
          published: draft.published,
          seoTitle: draft.seoTitle.trim() || undefined,
          seoDescription: draft.seoDescription.trim() || undefined,
        };

        if (
          !payload.slug ||
          !payload.title ||
          !payload.excerpt ||
          !payload.publishedAt ||
          payload.body.length === 0 ||
          payload.tags.length === 0
        ) {
          throw new Error("Fill all required fields before saving.");
        }

        const savedId = await savePost(payload);
        const nextRecord: PostRecord = {
          _id: payload.id ?? savedId,
          _creationTime:
            posts.find((post) => String(post._id) === draft.id)?._creationTime ??
            Date.now(),
          slug: payload.slug,
          title: payload.title,
          excerpt: payload.excerpt,
          body: payload.body,
          tags: payload.tags,
          publishedAt: payload.publishedAt,
          coverImage: payload.coverImage,
          updatedAt: payload.updatedAt,
          published: payload.published,
          seoTitle: payload.seoTitle,
          seoDescription: payload.seoDescription,
        };

        if (payload.id) {
          patchRow(payload.id, nextRecord);
        } else {
          setPosts((current) => [...current, nextRecord]);
          setDraft(toDraft(nextRecord));
        }

        setNotice("Post saved.");
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not save post.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const togglePublish = (post: PostRecord) => {
    setNotice(null);
    if (!ensureAuthenticated()) {
      return;
    }
    startTransition(async () => {
      setBusyRowId(String(post._id));
      try {
        const nextPublished = !post.published;
        await savePost({
          id: post._id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          tags: post.tags,
          publishedAt: post.publishedAt,
          coverImage: post.coverImage,
          updatedAt: new Date().toISOString().slice(0, 10),
          published: nextPublished,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
        });
        patchRow(post._id, {
          published: nextPublished,
          updatedAt: new Date().toISOString().slice(0, 10),
        });
        if (draft.id === String(post._id)) {
          setDraft((current) => ({ ...current, published: nextPublished }));
        }
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not update post.");
      } finally {
        setBusyRowId(null);
      }
    });
  };

  const deleteDraftPost = () => {
    if (!draft.id) {
      setNotice("Select an existing post before deleting.");
      return;
    }

    setNotice(null);
    if (!ensureAuthenticated()) {
      return;
    }
    startTransition(async () => {
      setIsSaving(true);
      try {
        const id = draft.id as Id<"posts">;
        await deletePost({ id });
        removeRow(id);
        setNotice("Post deleted.");
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not delete post.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Posts ({posts.length})</p>
          <button
            type="button"
            onClick={() => {
              setDraft(initialDraft);
              setNotice(null);
            }}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            New post
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Slug</th>
                <th className="px-2 py-2">Published</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map((post) => (
                <tr
                  key={String(post._id)}
                  className="border-b border-slate-100 last:border-none dark:border-slate-800"
                >
                  <td className="px-2 py-3">{post.publishedAt}</td>
                  <td className="px-2 py-3">{post.title}</td>
                  <td className="px-2 py-3 font-mono text-xs">{post.slug}</td>
                  <td className="px-2 py-3">{post.published ? "Yes" : "No"}</td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={!canMutate}
                          onClick={() => setDraft(toDraft(post))}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busyRowId === String(post._id) || !canMutate}
                        onClick={() => togglePublish(post)}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        {post.published ? "Unpublish" : "Publish"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold">
          {draft.id ? "Edit post" : "Create post"}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("title", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Slug</span>
            <input
              value={draft.slug}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("slug", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>Excerpt</span>
            <textarea
              rows={3}
              value={draft.excerpt}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("excerpt", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>Body (one paragraph per line)</span>
            <textarea
              rows={6}
              value={draft.body}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("body", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Tags (comma separated)</span>
            <input
              value={draft.tags}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("tags", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Published at</span>
            <input
              value={draft.publishedAt}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("publishedAt", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
              placeholder="YYYY-MM-DD"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>Cover image URL</span>
            <input
              value={draft.coverImage}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("coverImage", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>SEO title</span>
            <input
              value={draft.seoTitle}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("seoTitle", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>SEO description</span>
            <input
              value={draft.seoDescription}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateDraftField("seoDescription", value);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                updateDraftField("published", checked);
              }}
            />
            Published
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSaving || !canMutate}
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {isSaving ? "Saving..." : "Save post"}
          </button>
          <button
            type="button"
            onClick={deleteDraftPost}
            disabled={isSaving || !canMutate}
            className="rounded-full border border-rose-300 px-4 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setDraft(initialDraft)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>

        {notice ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{notice}</p>
        ) : null}
      </section>
    </div>
  );
}
