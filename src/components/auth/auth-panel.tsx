"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Something went wrong. Please try again.";
}

function parseResultError(result: unknown): string | null {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    result.error &&
    typeof result.error === "object" &&
    "message" in result.error &&
    typeof result.error.message === "string"
  ) {
    return result.error.message;
  }
  return null;
}

export function AuthPanel() {
  const router = useRouter();
  const session = authClient.useSession?.();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const canSignInEmail = typeof authClient.signIn?.email === "function";
  const hasConfiguredMethods = canSignInEmail;

  const sessionUser = session?.data?.user;
  const hasSession = Boolean(sessionUser);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!canSignInEmail) {
      setErrorMessage("Email sign in is not enabled yet.");
      return;
    }

    startTransition(async () => {
      setIsSubmitting(true);
      try {
        const response = await authClient.signIn!.email!({
          email,
          password,
          rememberMe,
        });

        const apiErrorMessage = parseResultError(response);
        if (apiErrorMessage) {
          setErrorMessage(apiErrorMessage);
          return;
        }

        setStatusMessage("Signed in. Redirecting to admin...");
        router.push("/admin");
        router.refresh();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const onSignOut = () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (typeof authClient.signOut !== "function") {
      setErrorMessage("Sign out is not available in this auth client.");
      return;
    }

    startTransition(async () => {
      setIsSigningOut(true);
      try {
        await authClient.signOut();
        setStatusMessage("Signed out.");
        router.refresh();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsSigningOut(false);
      }
    });
  };

  if (!hasConfiguredMethods) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          Auth Setup Needed
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">No providers are active yet.</h2>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          This page is ready, but the auth client has no enabled methods. Once
          Better Auth providers are configured, this panel will automatically
          show the correct sign-in options.
        </p>
        <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-4 text-sm text-[color:var(--color-muted-foreground)]">
          Expected client method: <code>signIn.email</code>.
        </div>
      </div>
    );
  }

  if (hasSession) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          Active Session
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          You are already signed in.
        </h2>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Signed in as {sessionUser?.name ?? sessionUser?.email ?? "admin user"}.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-2 text-sm font-medium transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            Open admin
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-foreground)]"
          >
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          Account
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Use the configured admin account to access site operations.
        </p>
      </header>

      <form onSubmit={onSubmit} aria-busy={isSubmitting} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm">Email</span>
          <input
            type="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm">Password</span>
          <input
            type="password"
            required
            minLength={8}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
            placeholder="At least 8 characters"
            autoComplete="current-password"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]">
          <input
            type="checkbox"
            disabled={isSubmitting}
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.currentTarget.checked)}
            className="h-4 w-4 rounded border-[color:var(--color-border)] bg-[color:var(--color-background)]"
          />
          Keep me signed in on this device
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-live="polite"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-2.5 text-sm font-medium transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="space-y-2">
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
        {session?.isPending ? (
          <p className="text-xs text-[color:var(--color-muted-foreground)]">
            Checking session...
          </p>
        ) : null}
      </div>
    </div>
  );
}
