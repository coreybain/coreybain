import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { convexSiteUrl, convexUrl } from "./site-config";

function getRequiredValue(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export const authServer = convexBetterAuthNextJs({
  convexUrl: getRequiredValue(convexUrl, "NEXT_PUBLIC_CONVEX_URL"),
  convexSiteUrl: getRequiredValue(
    convexSiteUrl,
    "NEXT_PUBLIC_CONVEX_SITE_URL"
  ),
});
