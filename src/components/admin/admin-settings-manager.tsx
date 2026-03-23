"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { refreshPublicSiteContent } from "@/lib/site/revalidate-client";

type ProfileRecord = Doc<"profile"> | null;
type SiteSettingsRecord = Doc<"siteSettings"> | null;
type CapabilityRecord = Doc<"capabilities">;

type Props = {
  initialProfile: ProfileRecord;
  initialSiteSettings: SiteSettingsRecord;
  initialCapabilities: CapabilityRecord[];
};

type CapabilityDraft = {
  key: string;
  id: string;
  slug: string;
  title: string;
  summary: string;
  proofPoints: string;
  sortOrder: number;
};

type ActionFeedbackTone = "pending" | "success" | "error";

type ActionFeedback = {
  key: string;
  tone: ActionFeedbackTone;
  message: string;
};

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function csvToArray(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toSocialLinks(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((value) => value.trim());
      return {
        label: label || "Link",
        href: href || "",
      };
    })
    .filter((item) => item.href);
}

function toCapabilityDraft(capability: CapabilityRecord, index: number): CapabilityDraft {
  return {
    key: `${String(capability._id)}-${index}`,
    id: String(capability._id),
    slug: capability.slug,
    title: capability.title,
    summary: capability.summary,
    proofPoints: capability.proofPoints.join("\n"),
    sortOrder: capability.sortOrder,
  };
}

export function AdminSettingsManager({
  initialProfile,
  initialSiteSettings,
  initialCapabilities,
}: Props) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initialProfile?.headline ?? "");
  const [subheadline, setSubheadline] = useState(initialProfile?.subheadline ?? "");
  const [availability, setAvailability] = useState(initialProfile?.availability ?? "");
  const [location, setLocation] = useState(initialProfile?.location ?? "");
  const [summary, setSummary] = useState(initialProfile?.summary.join("\n") ?? "");
  const [socialLinks, setSocialLinks] = useState(
    initialProfile?.socialLinks.map((link) => `${link.label}|${link.href}`).join("\n") ??
      ""
  );
  const [featuredProjects] = useState(
    initialSiteSettings?.featuredProjectSlugs.join(", ") ?? ""
  );
  const [featuredPosts, setFeaturedPosts] = useState(
    initialSiteSettings?.featuredPostSlugs.join(", ") ?? ""
  );
  const [featuredExperiments] = useState(
    initialSiteSettings?.featuredExperimentSlugs?.join(", ") ?? ""
  );
  const [notificationEmail, setNotificationEmail] = useState(
    initialSiteSettings?.notificationEmail ?? ""
  );
  const [capabilities, setCapabilities] = useState(
    initialCapabilities.map(toCapabilityDraft)
  );
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useConvexAuth();

  const saveProfile = useMutation(api.content.saveProfile);
  const saveSiteSettings = useMutation(api.content.saveSiteSettings);
  const saveCapability = useMutation(api.content.saveCapability);
  const deleteCapability = useMutation(api.content.deleteCapability);

  const sortedCapabilities = useMemo(
    () => [...capabilities].sort((a, b) => a.sortOrder - b.sortOrder),
    [capabilities]
  );

  const canMutate = isAuthenticated && !isLoading;

  const setPendingFeedback = (key: string, message: string) => {
    setActionFeedback({ key, tone: "pending", message });
  };

  const setSuccessFeedback = (key: string, message: string) => {
    setActionFeedback({ key, tone: "success", message });
  };

  const setErrorFeedback = (key: string, message: string) => {
    setActionFeedback({ key, tone: "error", message });
  };

  const renderActionFeedback = (key: string) => {
    if (!actionFeedback || actionFeedback.key !== key) {
      return null;
    }

    const toneClasses =
      actionFeedback.tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200"
        : actionFeedback.tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200"
          : "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200";

    return (
      <p
        aria-live={actionFeedback.tone === "error" ? "assertive" : "polite"}
        role={actionFeedback.tone === "error" ? "alert" : "status"}
        className={`rounded-xl border px-3 py-2 text-sm ${toneClasses}`}
      >
        {actionFeedback.message}
      </p>
    );
  };

  const ensureAuthenticated = (key: string) => {
    if (canMutate) {
      return true;
    }

    setErrorFeedback(
      key,
      "Admin auth is still syncing. Refresh or wait a moment, then try again."
    );
    return false;
  };

  const applyRefreshFeedback = async (key: string, successMessage: string) => {
    const refreshed = await refreshPublicSiteContent();
    if (refreshed.ok) {
      setSuccessFeedback(key, successMessage);
      return;
    }

    setErrorFeedback(key, refreshed.message);
  };

  const updateCapabilityField = <Key extends keyof CapabilityDraft>(
    itemKey: string,
    key: Key,
    value: CapabilityDraft[Key]
  ) => {
    setCapabilities((current) =>
      current.map((entry) => (entry.key === itemKey ? { ...entry, [key]: value } : entry))
    );
  };

  const saveProfileSection = () => {
    if (!ensureAuthenticated("profile")) {
      return;
    }

    startTransition(async () => {
      setBusyKey("profile");
      setPendingFeedback("profile", "Saving profile...");
      try {
        const summaryItems = linesToArray(summary);
        if (!headline.trim() || !subheadline.trim() || summaryItems.length === 0) {
          throw new Error("Headline, subheadline, and summary are required.");
        }

        await saveProfile({
          headline: headline.trim(),
          subheadline: subheadline.trim(),
          availability: availability.trim() || undefined,
          location: location.trim() || undefined,
          summary: summaryItems,
          socialLinks: toSocialLinks(socialLinks),
        });
        await applyRefreshFeedback("profile", "Profile saved.");
        router.refresh();
      } catch (error) {
        setErrorFeedback(
          "profile",
          error instanceof Error ? error.message : "Could not save profile."
        );
      } finally {
        setBusyKey(null);
      }
    });
  };

  const saveSiteSettingsSection = () => {
    if (!ensureAuthenticated("settings")) {
      return;
    }

    startTransition(async () => {
      setBusyKey("settings");
      setPendingFeedback("settings", "Saving site settings...");
      try {
        await saveSiteSettings({
          featuredProjectSlugs: csvToArray(featuredProjects),
          featuredPostSlugs: csvToArray(featuredPosts),
          featuredExperimentSlugs: csvToArray(featuredExperiments),
          notificationEmail: notificationEmail.trim() || undefined,
        });
        await applyRefreshFeedback("settings", "Site settings saved.");
        router.refresh();
      } catch (error) {
        setErrorFeedback(
          "settings",
          error instanceof Error ? error.message : "Could not save site settings."
        );
      } finally {
        setBusyKey(null);
      }
    });
  };

  const addCapability = () => {
    const key = `new-cap-${Date.now()}`;
    setCapabilities((current) => [
      ...current,
      {
        key,
        id: "",
        slug: "",
        title: "",
        summary: "",
        proofPoints: "",
        sortOrder: current.length + 1,
      },
    ]);
  };

  const saveCapabilityRow = (draft: CapabilityDraft) => {
    if (!ensureAuthenticated(draft.key)) {
      return;
    }

    startTransition(async () => {
      setBusyKey(draft.key);
      setPendingFeedback(draft.key, "Saving capability...");
      try {
        if (!draft.slug.trim() || !draft.title.trim() || !draft.summary.trim()) {
          throw new Error("Capability slug, title, and summary are required.");
        }

        const id = await saveCapability({
          id: draft.id ? (draft.id as Id<"capabilities">) : undefined,
          slug: draft.slug.trim(),
          title: draft.title.trim(),
          summary: draft.summary.trim(),
          proofPoints: linesToArray(draft.proofPoints),
          sortOrder: draft.sortOrder,
        });

        setCapabilities((current) =>
          current.map((entry) =>
            entry.key === draft.key ? { ...entry, id: String(id) } : entry
          )
        );
        await applyRefreshFeedback(draft.key, "Capability saved.");
        router.refresh();
      } catch (error) {
        setErrorFeedback(
          draft.key,
          error instanceof Error ? error.message : "Could not save capability."
        );
      } finally {
        setBusyKey(null);
      }
    });
  };

  const removeCapabilityRow = (draft: CapabilityDraft) => {
    if (!ensureAuthenticated(draft.key)) {
      return;
    }

    startTransition(async () => {
      setBusyKey(draft.key);
      setPendingFeedback(draft.key, "Removing capability...");
      try {
        if (draft.id) {
          await deleteCapability({ id: draft.id as Id<"capabilities"> });
        }
        setCapabilities((current) => current.filter((entry) => entry.key !== draft.key));
        await applyRefreshFeedback(draft.key, "Capability removed.");
        router.refresh();
      } catch (error) {
        setErrorFeedback(
          draft.key,
          error instanceof Error ? error.message : "Could not remove capability."
        );
      } finally {
        setBusyKey(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Profile</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Headline</span>
            <input
              value={headline}
              onChange={(event) => setHeadline(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Subheadline</span>
            <input
              value={subheadline}
              onChange={(event) => setSubheadline(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Availability</span>
            <input
              value={availability}
              onChange={(event) => setAvailability(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>Summary (one line per paragraph)</span>
            <textarea
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span>Social links (`Label|URL` per line)</span>
            <textarea
              rows={4}
              value={socialLinks}
              onChange={(event) => setSocialLinks(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={saveProfileSection}
            disabled={busyKey === "profile" || !canMutate}
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {busyKey === "profile" ? "Saving..." : "Save profile"}
          </button>
          {renderActionFeedback("profile")}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold">Site settings</h3>
        <div className="mt-4 grid gap-3">
          <label className="space-y-1 text-sm">
            <span>Featured post slugs (comma separated)</span>
            <input
              value={featuredPosts}
              onChange={(event) => setFeaturedPosts(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Notification email</span>
            <input
              value={notificationEmail}
              onChange={(event) => setNotificationEmail(event.currentTarget.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={saveSiteSettingsSection}
            disabled={busyKey === "settings" || !canMutate}
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {busyKey === "settings" ? "Saving..." : "Save site settings"}
          </button>
          {renderActionFeedback("settings")}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Capabilities</h3>
          <button
            type="button"
            onClick={addCapability}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Add capability
          </button>
        </div>
        <div className="space-y-4">
          {sortedCapabilities.map((capability) => (
            <article
              key={capability.key}
              className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span>Slug</span>
                  <input
                    value={capability.slug}
                    onChange={(event) =>
                      updateCapabilityField(
                        capability.key,
                        "slug",
                        event.currentTarget.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span>Sort order</span>
                  <input
                    type="number"
                    value={capability.sortOrder}
                    onChange={(event) =>
                      updateCapabilityField(
                        capability.key,
                        "sortOrder",
                        Number(event.currentTarget.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span>Title</span>
                  <input
                    value={capability.title}
                    onChange={(event) =>
                      updateCapabilityField(
                        capability.key,
                        "title",
                        event.currentTarget.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span>Summary</span>
                  <textarea
                    rows={3}
                    value={capability.summary}
                    onChange={(event) =>
                      updateCapabilityField(
                        capability.key,
                        "summary",
                        event.currentTarget.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </label>
                <label className="space-y-1 text-sm sm:col-span-2">
                  <span>Proof points (one per line)</span>
                  <textarea
                    rows={4}
                    value={capability.proofPoints}
                    onChange={(event) =>
                      updateCapabilityField(
                        capability.key,
                        "proofPoints",
                        event.currentTarget.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveCapabilityRow(capability)}
                  disabled={busyKey === capability.key || !canMutate}
                  className="rounded-full border border-slate-900 bg-slate-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                  {busyKey === capability.key ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => removeCapabilityRow(capability)}
                  disabled={busyKey === capability.key || !canMutate}
                  className="rounded-full border border-rose-300 px-3 py-1 text-xs text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3">{renderActionFeedback(capability.key)}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
