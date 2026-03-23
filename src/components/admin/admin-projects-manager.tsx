"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { refreshPublicSiteContent } from "@/lib/site/revalidate-client";
import type { ProjectType, ProjectVisibility } from "@/lib/site/types";

type ProjectRecord = Doc<"projects">;

type Props = {
  initialProjects: ProjectRecord[];
};

type ProjectDraft = {
  id: string;
  slug: string;
  type: ProjectType;
  visibleOn: ProjectVisibility[];
  title: string;
  company: string;
  tagline: string;
  summary: string;
  body: string;
  role: string;
  period: string;
  status: string;
  stack: string;
  outcomes: string;
  impactMetrics: string;
  teamContext: string;
  responsibilities: string;
  audience: string;
  lessonsLearned: string;
  mediaJson: string;
  linkLive: string;
  linkRepo: string;
  linkStore: string;
  linkVideo: string;
  linkPost: string;
  published: boolean;
  sortOrder: number;
};

const visibilityOptions: Array<{
  label: string;
  value: ProjectVisibility;
}> = [
  { label: "Homepage", value: "homepage" },
  { label: "Work", value: "work" },
  { label: "Experiments", value: "experiments" },
];

const emptyDraft: ProjectDraft = {
  id: "",
  slug: "",
  type: "project",
  visibleOn: ["work"],
  title: "",
  company: "",
  tagline: "",
  summary: "",
  body: "",
  role: "",
  period: "",
  status: "active",
  stack: "",
  outcomes: "",
  impactMetrics: "",
  teamContext: "",
  responsibilities: "",
  audience: "",
  lessonsLearned: "",
  mediaJson: "",
  linkLive: "",
  linkRepo: "",
  linkStore: "",
  linkVideo: "",
  linkPost: "",
  published: false,
  sortOrder: 100,
};

function toLines(values: string[] | undefined) {
  return values?.join("\n") ?? "";
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseMediaJson(raw: string): ProjectRecord["media"] {
  if (!raw.trim()) {
    return undefined;
  }

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Media JSON must be an array.");
  }

  const media = parsed.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Each media entry must be an object.");
    }

    const type = (item as { type?: unknown }).type;
    const src = (item as { src?: unknown }).src;
    const alt = (item as { alt?: unknown }).alt;

    if (type !== "image" && type !== "video") {
      throw new Error("Media type must be image or video.");
    }
    if (typeof src !== "string" || typeof alt !== "string") {
      throw new Error("Media entries require string src and alt.");
    }

    return { type: type as "image" | "video", src, alt };
  });

  return media.length > 0 ? media : undefined;
}

function toDraft(project: ProjectRecord): ProjectDraft {
  return {
    id: String(project._id),
    slug: project.slug,
    type: project.type ?? "project",
    visibleOn:
      project.visibleOn && project.visibleOn.length > 0
        ? project.visibleOn
        : ["work"],
    title: project.title,
    company: project.company ?? "",
    tagline: project.tagline,
    summary: project.summary,
    body: toLines(project.body),
    role: project.role ?? "",
    period: project.period ?? "",
    status: project.status ?? "active",
    stack: project.stack.join(", "),
    outcomes: toLines(project.outcomes),
    impactMetrics: toLines(project.impactMetrics),
    teamContext: project.teamContext ?? "",
    responsibilities: toLines(project.responsibilities),
    audience: project.audience ?? "",
    lessonsLearned: toLines(project.lessonsLearned),
    mediaJson: project.media ? JSON.stringify(project.media, null, 2) : "",
    linkLive: project.links.live ?? "",
    linkRepo: project.links.repo ?? "",
    linkStore: project.links.store ?? "",
    linkVideo: project.links.video ?? "",
    linkPost: project.links.post ?? "",
    published: project.published,
    sortOrder: project.sortOrder,
  };
}

function entryTypeLabel(type: ProjectType) {
  return type === "experiment" ? "Experiment" : "Project";
}

export function AdminProjectsManager({ initialProjects }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useConvexAuth();

  const saveProject = useMutation(api.content.saveProject);
  const deleteProject = useMutation(api.content.deleteProject);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((left, right) => {
        if (left.sortOrder === right.sortOrder) {
          return left.title.localeCompare(right.title);
        }
        return left.sortOrder - right.sortOrder;
      }),
    [projects]
  );

  const canMutate = isAuthenticated && !isLoading;
  const isExperiment = draft.type === "experiment";

  const updateDraftField = <Key extends keyof ProjectDraft>(
    key: Key,
    value: ProjectDraft[Key]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const ensureAuthenticated = () => {
    if (canMutate) {
      return true;
    }

    setNotice("Admin auth is still syncing. Refresh or wait a moment, then try again.");
    return false;
  };

  const patchRow = (id: Id<"projects">, patch: Partial<ProjectRecord>) => {
    setProjects((current) =>
      current.map((project) =>
        project._id === id ? { ...project, ...patch } : project
      )
    );
  };

  const removeRow = (id: Id<"projects">) => {
    setProjects((current) => current.filter((project) => project._id !== id));
    if (draft.id === String(id)) {
      setDraft(emptyDraft);
    }
  };

  const toggleVisibleOn = (value: ProjectVisibility) => {
    setDraft((current) => {
      const nextVisibleOn = current.visibleOn.includes(value)
        ? current.visibleOn.filter((entry) => entry !== value)
        : [...current.visibleOn, value];

      return {
        ...current,
        visibleOn: nextVisibleOn,
      };
    });
  };

  const saveDraft = () => {
    setNotice(null);
    if (!ensureAuthenticated()) {
      return;
    }

    startTransition(async () => {
      setIsSaving(true);
      try {
        const media = parseMediaJson(draft.mediaJson);
        const visibleOn = Array.from(new Set(draft.visibleOn));
        const payload = {
          id: draft.id ? (draft.id as Id<"projects">) : undefined,
          slug: draft.slug.trim(),
          type: draft.type,
          visibleOn,
          title: draft.title.trim(),
          company: draft.company.trim() || undefined,
          tagline: draft.tagline.trim() || draft.summary.trim(),
          summary: draft.summary.trim(),
          body:
            fromLines(draft.body).length > 0
              ? fromLines(draft.body)
              : draft.summary.trim()
                ? [draft.summary.trim()]
                : [],
          role: draft.role.trim() || undefined,
          period: draft.period.trim() || undefined,
          status: draft.status.trim() || undefined,
          stack: fromCsv(draft.stack),
          outcomes: fromLines(draft.outcomes),
          impactMetrics: fromLines(draft.impactMetrics),
          teamContext: draft.teamContext.trim() || undefined,
          responsibilities: fromLines(draft.responsibilities),
          audience: draft.audience.trim() || undefined,
          lessonsLearned: fromLines(draft.lessonsLearned),
          media,
          links: {
            live: draft.linkLive.trim() || undefined,
            repo: draft.linkRepo.trim() || undefined,
            store: draft.linkStore.trim() || undefined,
            video: draft.linkVideo.trim() || undefined,
            post: draft.linkPost.trim() || undefined,
          },
          featured: visibleOn.includes("homepage"),
          published: draft.published,
          sortOrder: Number.isFinite(draft.sortOrder)
            ? draft.sortOrder
            : emptyDraft.sortOrder,
        };

        if (!payload.slug || !payload.title || !payload.summary) {
          throw new Error("Slug, title, and summary are required.");
        }

        if (payload.visibleOn.length === 0) {
          throw new Error("Choose at least one location in Visible here.");
        }

        if (payload.type === "project") {
          if (
            !payload.company ||
            !payload.tagline ||
            payload.body.length === 0 ||
            !payload.role ||
            !payload.period ||
            !payload.status ||
            payload.stack.length === 0 ||
            payload.outcomes.length === 0
          ) {
            throw new Error(
              "Projects need company, tagline, body, role, period, status, stack, and outcomes."
            );
          }
        }

        const savedId = await saveProject(payload);
        const existingRecord = projects.find((project) => String(project._id) === draft.id);
        const nextRecord: ProjectRecord = {
          _id: payload.id ?? savedId,
          _creationTime: existingRecord?._creationTime ?? Date.now(),
          slug: payload.slug,
          type: payload.type,
          visibleOn: payload.visibleOn,
          title: payload.title,
          company: payload.company,
          tagline: payload.tagline,
          summary: payload.summary,
          body: payload.body,
          role: payload.role,
          period: payload.period,
          status: payload.status,
          stack: payload.stack,
          outcomes: payload.outcomes,
          impactMetrics: payload.impactMetrics.length
            ? payload.impactMetrics
            : undefined,
          teamContext: payload.teamContext,
          responsibilities: payload.responsibilities.length
            ? payload.responsibilities
            : undefined,
          audience: payload.audience,
          lessonsLearned: payload.lessonsLearned.length
            ? payload.lessonsLearned
            : undefined,
          media: payload.media,
          links: payload.links,
          featured: payload.featured,
          published: payload.published,
          sortOrder: payload.sortOrder,
        };

        if (payload.id) {
          patchRow(payload.id, nextRecord);
        } else {
          setProjects((current) => [...current, nextRecord]);
          setDraft(toDraft(nextRecord));
        }

        const refreshed = await refreshPublicSiteContent();
        setNotice(refreshed.ok ? "Entry saved." : refreshed.message);
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not save entry.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const togglePublished = (project: ProjectRecord) => {
    setNotice(null);
    if (!ensureAuthenticated()) {
      return;
    }

    startTransition(async () => {
      setBusyRowId(String(project._id));
      try {
        const merged = { ...project, published: !project.published };
        await saveProject({
          id: project._id,
          slug: merged.slug,
          type: merged.type ?? "project",
          visibleOn:
            merged.visibleOn && merged.visibleOn.length > 0
              ? merged.visibleOn
              : ["work"],
          title: merged.title,
          company: merged.company,
          tagline: merged.tagline,
          summary: merged.summary,
          body: merged.body,
          role: merged.role,
          period: merged.period,
          status: merged.status,
          stack: merged.stack,
          outcomes: merged.outcomes,
          impactMetrics: merged.impactMetrics,
          teamContext: merged.teamContext,
          responsibilities: merged.responsibilities,
          audience: merged.audience,
          lessonsLearned: merged.lessonsLearned,
          media: merged.media,
          links: merged.links,
          featured:
            merged.visibleOn?.includes("homepage") ?? merged.featured,
          published: merged.published,
          sortOrder: merged.sortOrder,
        });
        patchRow(project._id, merged);
        if (draft.id === String(project._id)) {
          setDraft((current) => ({
            ...current,
            published: merged.published,
          }));
        }
        const refreshed = await refreshPublicSiteContent();
        setNotice(refreshed.ok ? "Entry updated." : refreshed.message);
        router.refresh();
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not update the entry row."
        );
      } finally {
        setBusyRowId(null);
      }
    });
  };

  const deleteDraftProject = () => {
    if (!draft.id) {
      setNotice("Select an existing entry before deleting.");
      return;
    }

    setNotice(null);
    if (!ensureAuthenticated()) {
      return;
    }

    startTransition(async () => {
      setIsSaving(true);
      try {
        const id = draft.id as Id<"projects">;
        await deleteProject({ id });
        removeRow(id);
        const refreshed = await refreshPublicSiteContent();
        setNotice(refreshed.ok ? "Entry deleted." : refreshed.message);
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not delete entry.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Portfolio entries ({projects.length})</p>
          <button
            type="button"
            onClick={() => {
              setDraft(emptyDraft);
              setNotice(null);
            }}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            New entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-2 py-2">Order</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Visible here</th>
                <th className="px-2 py-2">Slug</th>
                <th className="px-2 py-2">Published</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((project) => {
                const isBusy = busyRowId === String(project._id);
                const normalizedType = project.type ?? "project";
                const normalizedVisibleOn =
                  project.visibleOn && project.visibleOn.length > 0
                    ? project.visibleOn
                    : ["work"];

                return (
                  <tr
                    key={String(project._id)}
                    className="border-b border-slate-100 last:border-none dark:border-slate-800"
                  >
                    <td className="px-2 py-3">{project.sortOrder}</td>
                    <td className="px-2 py-3">{entryTypeLabel(normalizedType)}</td>
                    <td className="px-2 py-3">{project.title}</td>
                    <td className="px-2 py-3">{normalizedVisibleOn.join(", ")}</td>
                    <td className="px-2 py-3 font-mono text-xs">{project.slug}</td>
                    <td className="px-2 py-3">{project.published ? "Yes" : "No"}</td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={!canMutate}
                          onClick={() => setDraft(toDraft(project))}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isBusy || !canMutate}
                          onClick={() => togglePublished(project)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          {project.published ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold">
          {draft.id ? "Edit entry" : "Create entry"}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Type</span>
            <select
              value={draft.type}
              onChange={(event) => {
                const nextType = event.currentTarget.value as ProjectType;
                setDraft((current) => ({
                  ...current,
                  type: nextType,
                  visibleOn:
                    current.visibleOn.length > 0
                      ? current.visibleOn
                      : nextType === "experiment"
                        ? ["experiments"]
                        : ["work"],
                }));
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            >
              <option value="project">Project</option>
              <option value="experiment">Experiment</option>
            </select>
          </label>
          <div className="space-y-1 text-sm">
            <span>Visible here</span>
            <div className="flex min-h-[44px] flex-wrap gap-2 rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              {visibilityOptions.map((option) => {
                const checked = draft.visibleOn.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${
                      checked
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                        : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleVisibleOn(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>
          <label className="space-y-1 text-sm">
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(event) => updateDraftField("title", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Slug</span>
            <input
              value={draft.slug}
              onChange={(event) => updateDraftField("slug", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          {!isExperiment ? (
            <label className="space-y-1 text-sm sm:col-span-2">
              <span>Company</span>
              <input
                value={draft.company}
                onChange={(event) => updateDraftField("company", event.currentTarget.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
              />
            </label>
          ) : null}
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>{isExperiment ? "Short hook" : "Tagline"}</span>
            <input
              value={draft.tagline}
              onChange={(event) => updateDraftField("tagline", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          {!isExperiment ? (
            <>
              <label className="space-y-1 text-sm">
                <span>Role</span>
                <input
                  value={draft.role}
                  onChange={(event) => updateDraftField("role", event.currentTarget.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Period</span>
                <input
                  value={draft.period}
                  onChange={(event) => updateDraftField("period", event.currentTarget.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
            </>
          ) : null}
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>Summary</span>
            <textarea
              rows={6}
              value={draft.summary}
              onChange={(event) => updateDraftField("summary", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports markdown for line breaks, bullet lists, and bold text.
            </p>
          </label>
          {!isExperiment ? (
            <label className="space-y-1 text-sm">
              <span>Status</span>
              <input
                value={draft.status}
                onChange={(event) => updateDraftField("status", event.currentTarget.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
              />
            </label>
          ) : null}
          <label className="space-y-1 text-sm">
            <span>Sort order</span>
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(event) =>
                updateDraftField("sortOrder", Number(event.currentTarget.value))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>{isExperiment ? "Notes (one paragraph per line)" : "Body (one paragraph per line)"}</span>
            <textarea
              rows={5}
              value={draft.body}
              onChange={(event) => updateDraftField("body", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>{isExperiment ? "Tags (comma separated)" : "Stack (comma separated)"}</span>
            <input
              value={draft.stack}
              onChange={(event) => updateDraftField("stack", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          {!isExperiment ? (
            <>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Outcomes (one per line)</span>
                <textarea
                  rows={4}
                  value={draft.outcomes}
                  onChange={(event) => updateDraftField("outcomes", event.currentTarget.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Impact metrics (one per line)</span>
                <textarea
                  rows={3}
                  value={draft.impactMetrics}
                  onChange={(event) =>
                    updateDraftField("impactMetrics", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Team context</span>
                <input
                  value={draft.teamContext}
                  onChange={(event) =>
                    updateDraftField("teamContext", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Responsibilities (one per line)</span>
                <textarea
                  rows={3}
                  value={draft.responsibilities}
                  onChange={(event) =>
                    updateDraftField("responsibilities", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Audience</span>
                <input
                  value={draft.audience}
                  onChange={(event) =>
                    updateDraftField("audience", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Lessons learned (one per line)</span>
                <textarea
                  rows={3}
                  value={draft.lessonsLearned}
                  onChange={(event) =>
                    updateDraftField("lessonsLearned", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                <span>Media JSON (optional)</span>
                <textarea
                  rows={4}
                  value={draft.mediaJson}
                  onChange={(event) => updateDraftField("mediaJson", event.currentTarget.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                  placeholder='[{"type":"image","src":"...","alt":"..."}]'
                />
              </label>
            </>
          ) : null}
          <label className="space-y-1 text-sm">
            <span>Live URL</span>
            <input
              value={draft.linkLive}
              onChange={(event) => updateDraftField("linkLive", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Repo URL</span>
            <input
              value={draft.linkRepo}
              onChange={(event) => updateDraftField("linkRepo", event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          {!isExperiment ? (
            <>
              <label className="space-y-1 text-sm">
                <span>Store URL</span>
                <input
                  value={draft.linkStore}
                  onChange={(event) =>
                    updateDraftField("linkStore", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span>Video URL</span>
                <input
                  value={draft.linkVideo}
                  onChange={(event) =>
                    updateDraftField("linkVideo", event.currentTarget.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </label>
            </>
          ) : null}
          {isExperiment ? (
            <label className="space-y-1 text-sm sm:col-span-2">
              <span>Post URL</span>
              <input
                value={draft.linkPost}
                onChange={(event) => updateDraftField("linkPost", event.currentTarget.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
              />
            </label>
          ) : null}
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => updateDraftField("published", event.currentTarget.checked)}
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
            {isSaving ? "Saving..." : "Save entry"}
          </button>
          <button
            type="button"
            onClick={deleteDraftProject}
            disabled={isSaving || !canMutate}
            className="rounded-full border border-rose-300 px-4 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setDraft(emptyDraft)}
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
