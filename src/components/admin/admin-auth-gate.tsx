import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";

type AdminAuthGateProps = {
  children: ReactNode;
};
export async function AdminAuthGate({ children }: AdminAuthGateProps) {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});

  if (!viewer.isAuthenticated) {
    redirect("/auth/sign-in");
  }

  if (!viewer.isAdmin) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            Admin access
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Access is restricted
          </h2>
          <p className="mt-3 text-sm opacity-90">
            You are signed in as {viewer.user?.email ?? "an authenticated user"},
            but that account is not listed in <code>ADMIN_EMAILS</code>.
          </p>
          <Link
            className="mt-5 inline-flex rounded-full border border-amber-700/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-amber-100 dark:border-amber-200/40 dark:hover:bg-amber-900/50"
            href="/"
          >
            Return to site
          </Link>
        </div>
      </div>
    );
  }

  return <div className="space-y-5">{children}</div>;
}
