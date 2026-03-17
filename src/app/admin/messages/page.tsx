import { AdminMessageInbox } from "@/components/admin/admin-message-inbox";
import { PageHeader } from "@/components/admin/admin-primitives";
import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";

export default async function AdminMessagesPage() {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});
  const messages = viewer.isAdmin
    ? await authServer.fetchAuthQuery(api.site.adminMessages, {})
    : [];
  const messageList = messages.map((message: (typeof messages)[number]) => ({
    _id: String(message._id),
    name: message.name,
    email: message.email,
    company: message.company,
    website: message.website,
    message: message.message,
    aiBrief: message.aiBrief,
    matchedProjectSlugs: message.matchedProjectSlugs,
    matchedPostSlugs: message.matchedPostSlugs,
    status: message.status,
    createdAt: message.createdAt,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Review inquiries, inspect AI summaries, and manage message workflow state."
        title="Messages"
      />

      <AdminMessageInbox initialMessages={messageList} />
    </div>
  );
}
