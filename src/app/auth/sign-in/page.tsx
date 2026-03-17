import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { AuthPanel } from "@/components/auth/auth-panel";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = buildMetadata({
  title: "Admin Sign In - Corey Baines",
  description: "Sign in to access admin content and site operations.",
  path: "/auth/sign-in",
});

export default function SignInPage() {
  return (
    <AuthShell>
      <AuthPanel />
    </AuthShell>
  );
}
