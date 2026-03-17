import type { ReactNode } from "react";

import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppProviders } from "@/components/app-providers";
import { authServer } from "@/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialToken = await authServer.getToken();

  return (
    <AppProviders initialToken={initialToken}>
      <AdminShell
        description="Content, messaging, and AI workflows for the site."
        title="Site Control Center"
      >
        <AdminAuthGate>{children}</AdminAuthGate>
      </AdminShell>
    </AppProviders>
  );
}
