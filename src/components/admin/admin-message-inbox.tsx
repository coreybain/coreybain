"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

type MessageBrief = {
  summary: string;
  goals: string[];
  scopeSignals: string[];
  nextSteps: string[];
};

export type AdminMessage = {
  _id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  message: string;
  aiBrief?: MessageBrief;
  matchedProjectSlugs?: string[];
  matchedPostSlugs?: string[];
  status: "new" | "replied" | "archived";
  createdAt: number;
};

type Props = {
  initialMessages: AdminMessage[];
};

const statusStyles: Record<AdminMessage["status"], string> = {
  new: "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  replied:
    "border-blue-300/80 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  archived:
    "border-slate-300/80 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

export function AdminMessageInbox({ initialMessages }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [activeStatus, setActiveStatus] = useState<"all" | AdminMessage["status"]>(
    "all"
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const updateMessageStatus = useMutation(api.content.updateMessageStatus);

  const filteredMessages = useMemo(() => {
    if (activeStatus === "all") {
      return messages;
    }
    return messages.filter((message) => message.status === activeStatus);
  }, [activeStatus, messages]);

  const changeStatus = (message: AdminMessage, status: AdminMessage["status"]) => {
    setNotice(null);
    if (!isAuthenticated || isLoading) {
      setNotice("Admin auth is still syncing. Refresh or wait a moment, then try again.");
      return;
    }
    startTransition(async () => {
      setBusyId(message._id);
      try {
        await updateMessageStatus({
          id: message._id as Id<"contactSubmissions">,
          status,
        });
        setMessages((current) =>
          current.map((entry) =>
            entry._id === message._id ? { ...entry, status } : entry
          )
        );
        setNotice(`Updated ${message.email} to ${status}.`);
        router.refresh();
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not update message status."
        );
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "new", "replied", "archived"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
              activeStatus === status
                ? "border-slate-900 bg-slate-900 text-slate-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {notice}
        </p>
      ) : null}

      {filteredMessages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          No messages found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <article
              key={message._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{message.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {message.email}
                    {message.company ? ` · ${message.company}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusStyles[message.status]}`}
                >
                  {message.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Original message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {message.message}
                  </p>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    AI brief
                  </p>
                  {message.aiBrief ? (
                    <div className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                      <p>{message.aiBrief.summary}</p>
                      {message.aiBrief.goals.length > 0 ? (
                        <p>Goals: {message.aiBrief.goals.join(", ")}</p>
                      ) : null}
                      {message.aiBrief.scopeSignals.length > 0 ? (
                        <p>Scope: {message.aiBrief.scopeSignals.join(", ")}</p>
                      ) : null}
                      {message.aiBrief.nextSteps.length > 0 ? (
                        <p>Next: {message.aiBrief.nextSteps.join(", ")}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      No AI brief attached.
                    </p>
                  )}
                  {(message.matchedProjectSlugs?.length ||
                    message.matchedPostSlugs?.length) && (
                    <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {message.matchedProjectSlugs?.length ? (
                        <p>Projects: {message.matchedProjectSlugs.join(", ")}</p>
                      ) : null}
                      {message.matchedPostSlugs?.length ? (
                        <p>Posts: {message.matchedPostSlugs.join(", ")}</p>
                      ) : null}
                    </div>
                  )}
                </section>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === message._id || !isAuthenticated || isLoading}
                  onClick={() => changeStatus(message, "new")}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Reopen
                </button>
                <button
                  type="button"
                  disabled={busyId === message._id || !isAuthenticated || isLoading}
                  onClick={() => changeStatus(message, "replied")}
                  className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-900/60"
                >
                  Mark replied
                </button>
                <button
                  type="button"
                  disabled={busyId === message._id || !isAuthenticated || isLoading}
                  onClick={() => changeStatus(message, "archived")}
                  className="rounded-full border border-slate-400 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Archive
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
