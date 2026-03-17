import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";
import { AdminPostsManager } from "@/components/admin/admin-posts-manager";
import { PageHeader } from "@/components/admin/admin-primitives";

export default async function AdminPostsPage() {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});
  const posts = viewer.isAdmin
    ? await authServer.fetchAuthQuery(api.content.listPostsAdmin, {})
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create, edit, publish, and tag blog posts."
        title="Posts"
      />

      <AdminPostsManager initialPosts={posts} />
    </div>
  );
}
