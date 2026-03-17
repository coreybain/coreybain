"use client";

import { startTransition, useState } from "react";
import { ChevronDown, House, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminSessionControls() {
  const router = useRouter();
  const session = authClient.useSession?.();
  const [status, setStatus] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userLabel =
    session?.data?.user?.email ?? session?.data?.user?.name ?? "admin";

  const canSignOut = typeof authClient.signOut === "function";

  const handleSignOut = () => {
    setStatus(null);

    if (!canSignOut) {
      setStatus("Sign-out is unavailable in the current auth client.");
      return;
    }

    startTransition(async () => {
      setIsSigningOut(true);
      try {
        await authClient.signOut?.();
        router.push("/auth/sign-in");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sign out.";
        setStatus(message);
      } finally {
        setIsSigningOut(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex max-w-[220px] items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
          >
            <span className="truncate">{userLabel}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-slate-500 dark:text-slate-400"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => router.push("/")}>
            <House aria-hidden="true" className="size-4" />
            Back to site
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isSigningOut} onSelect={handleSignOut}>
            <LogOut aria-hidden="true" className="size-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {status ? (
        <p className="max-w-[220px] text-right text-xs text-amber-700 dark:text-amber-300">
          {status}
        </p>
      ) : null}
    </div>
  );
}
