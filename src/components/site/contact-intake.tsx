"use client";

import { useState } from "react";
import { CONTACT_MESSAGE_MIN, normalizeContactWebsite } from "@/lib/contact";

type FormState = {
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  company: "",
  website: "",
  message: "",
};

export function ContactIntake() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [botField, setBotField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  function updateFormField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMessage("Name, email, and project notes are required.");
      return;
    }

    if (form.message.trim().length < CONTACT_MESSAGE_MIN) {
      setErrorMessage(
        `Project notes need at least ${CONTACT_MESSAGE_MIN} characters.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedWebsite = normalizeContactWebsite(form.website);

      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || undefined,
          website: normalizedWebsite,
          message: form.message.trim(),
          matchedProjectSlugs: [],
          matchedPostSlugs: [],
          botField,
          startedAt,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Could not send the inquiry.");
      }

      setForm(initialFormState);
      setStatusMessage("Inquiry sent. I’ll review it and get back to you.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send the inquiry."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        className="space-y-5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
        onSubmit={onSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateFormField("name", value);
              }}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
              placeholder="Corey Baines"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateFormField("email", value);
              }}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
              placeholder="you@company.com"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm">Company</span>
            <input
              value={form.company}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateFormField("company", value);
              }}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
              placeholder="Company or product"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm">Website</span>
            <input
              value={form.website}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateFormField("website", value);
              }}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
              placeholder="https://example.com"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="inline-flex min-h-5 items-center text-sm">
            What would you like to discuss?
          </span>
          <input
            tabIndex={-1}
            autoComplete="off"
            name="website-confirm"
            value={botField}
            onChange={(event) => setBotField(event.currentTarget.value)}
            className="hidden"
            aria-hidden="true"
          />
          <textarea
            required
            rows={7}
            minLength={CONTACT_MESSAGE_MIN}
            value={form.message}
            onChange={(event) => {
              const value = event.currentTarget.value;
              updateFormField("message", value);
            }}
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
            placeholder="Describe the product, current stage, timeline, and the kind of help you need."
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-2 text-sm font-medium transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send inquiry"}
          </button>
        </div>
      </form>

      {errorMessage ? (
        <p className="rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="rounded-xl border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
          {statusMessage}
        </p>
      ) : null}

      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        Share a few details on the product, timeline, and the kind of help you
        need, and I&apos;ll follow up directly.
      </p>
    </div>
  );
}
