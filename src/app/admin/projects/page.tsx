import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";
import { AdminProjectsManager } from "@/components/admin/admin-projects-manager";
import { PageHeader } from "@/components/admin/admin-primitives";

export default async function AdminProjectsPage() {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});
  const projects = viewer.isAdmin
    ? await authServer.fetchAuthQuery(api.content.listProjectsAdmin, {})
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create, edit, publish, feature, and order project case studies."
        title="Projects"
      />

      <AdminProjectsManager initialProjects={projects} />
    </div>
  );
}
