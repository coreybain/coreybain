import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="space-y-6">
          <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
            Admin Access
          </p>
          <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to manage projects, writing, and inbound work leads.
          </h1>
          <p className="max-w-xl text-pretty text-[color:var(--color-muted-foreground)]">
            This admin session is scoped to site operations only. Public pages
            remain fully accessible without authentication.
          </p>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
            <p className="text-sm font-medium">What lives behind admin</p>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-muted-foreground)]">
              <li>Publish and update projects</li>
              <li>Draft and release blog posts</li>
              <li>Review contact submissions and AI briefs</li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)]"
          >
            Back to site
          </Link>
        </section>

        <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
          {children}
        </section>
      </div>
    </div>
  );
}
