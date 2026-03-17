import {
  NoteBlock,
  PageHeader,
  StatCard,
} from "@/components/admin/admin-primitives";
import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";

export default async function AdminDashboardPage() {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});
  const dashboard = viewer.isAdmin
    ? await authServer.fetchAuthQuery(api.site.adminDashboard, {})
    : {
        messageCount: 0,
        newMessageCount: 0,
        repliedCount: 0,
        latestMessageAt: null,
      };
  const [projects, posts] = viewer.isAdmin
    ? await Promise.all([
        authServer.fetchAuthQuery(api.content.listProjectsAdmin, {}),
        authServer.fetchAuthQuery(api.content.listPostsAdmin, {}),
      ])
    : [[], []];

  const dashboardStats = [
    {
      label: "Published projects",
      value: String(projects.filter((project) => project.published).length),
      hint: "Projects loaded from `api.content.listProjectsAdmin`.",
    },
    {
      label: "Published posts",
      value: String(posts.filter((post) => post.published).length),
      hint: "Posts loaded from `api.content.listPostsAdmin`.",
    },
    {
      label: "New messages",
      value: String(dashboard.newMessageCount),
      hint: "Fresh inquiries waiting for review.",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Overview of content, AI-assisted inquiries, and the current admin session."
        title="Dashboard"
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard hint={stat.hint} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <NoteBlock
        body={`Signed in as ${viewer.user?.email ?? "unknown"}. ${
          dashboard.latestMessageAt
            ? `Latest inquiry received ${new Date(
                dashboard.latestMessageAt
              ).toLocaleString()}.`
            : "No inquiries have been received yet."
        }`}
        title="Session status"
      />
    </div>
  );
}
