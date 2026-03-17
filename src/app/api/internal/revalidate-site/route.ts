import { revalidatePath, revalidateTag } from "next/cache";
import { api } from "@convex/_generated/api";
import { authServer } from "@/lib/auth-server";

const PUBLIC_SITE_PATHS = [
  "/",
  "/about",
  "/ask",
  "/blog",
  "/contact",
  "/experiments",
  "/work",
] as const;

const PUBLIC_SITE_DYNAMIC_PATHS = [
  "/blog/[slug]",
  "/work/[slug]",
] as const;

const PUBLIC_SITE_TAGS = [
  "site-content",
  "site-home",
  "site-about",
  "site-profile",
  "site-capabilities",
  "site-experience",
  "site-projects",
  "site-posts",
  "site-experiments",
] as const;

export async function POST() {
  const viewer = await authServer.fetchAuthQuery(api.auth.viewer, {});

  if (!viewer.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  for (const tag of PUBLIC_SITE_TAGS) {
    revalidateTag(tag, "max");
  }

  for (const path of PUBLIC_SITE_PATHS) {
    revalidatePath(path);
  }

  for (const path of PUBLIC_SITE_DYNAMIC_PATHS) {
    revalidatePath(path, "page");
  }

  return Response.json({ ok: true });
}
