import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { siteUrl } from "./site-config";

export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? siteUrl : window.location.origin,
  plugins: [convexClient()],
});
