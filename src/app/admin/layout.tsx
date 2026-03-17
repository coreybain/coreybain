import type { ReactNode } from "react";

import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell
      description="Content, messaging, and AI workflows for the site."
      title="Site Control Center"
    >
      <AdminAuthGate>{children}</AdminAuthGate>
    </AdminShell>
  );
}
