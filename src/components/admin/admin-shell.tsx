import type { ReactNode } from "react";

import { AdminNav } from "./admin-nav";
import { AdminSessionControls } from "./admin-session-controls";

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AdminShell({ children, title, description }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Admin
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>
          <AdminSessionControls />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-8 md:h-fit">
          <AdminNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
