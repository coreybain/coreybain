import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";
import { AdminSettingsManager } from "@/components/admin/admin-settings-manager";
import { PageHeader } from "@/components/admin/admin-primitives";

export default async function AdminSettingsPage() {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});
  const adminSettings = viewer.isAdmin
    ? await authServer.fetchAuthQuery(api.content.getSettingsAdmin, {})
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Edit profile copy, site curation, and capabilities."
        title="Settings"
      />

      <AdminSettingsManager
        initialProfile={adminSettings?.profile ?? null}
        initialSiteSettings={adminSettings?.siteSettings ?? null}
        initialCapabilities={adminSettings?.capabilities ?? []}
      />
    </div>
  );
}
