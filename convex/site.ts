import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, isAdminEmail } from "./auth";

async function requireAdmin(ctx: Parameters<typeof authComponent.safeGetAuthUser>[0]) {
  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }

  return user;
}

export const createContactSubmission = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    message: v.string(),
    aiBrief: v.optional(
      v.object({
        summary: v.string(),
        goals: v.array(v.string()),
        scopeSignals: v.array(v.string()),
        nextSteps: v.array(v.string()),
      })
    ),
    matchedProjectSlugs: v.optional(v.array(v.string())),
    matchedPostSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactSubmissions", {
      ...args,
      company: args.company?.trim() || undefined,
      website: args.website?.trim() || undefined,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const adminDashboard = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const messages = await ctx.db
      .query("contactSubmissions")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);

    const newMessages = messages.filter((message) => message.status === "new");

    return {
      messageCount: messages.length,
      newMessageCount: newMessages.length,
      repliedCount: messages.filter((message) => message.status === "replied")
        .length,
      latestMessageAt: messages[0]?.createdAt ?? null,
    };
  },
});

export const adminMessages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("contactSubmissions")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);
  },
});
