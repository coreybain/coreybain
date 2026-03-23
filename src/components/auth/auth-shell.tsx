import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-14 sm:px-8 sm:py-20">
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
        {children}
      </section>

      <Link
        href="/"
        className="inline-flex w-full justify-center text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)]"
      >
        Back to site
      </Link>
    </div>
  );
}
