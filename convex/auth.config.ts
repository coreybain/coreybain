import type { AuthConfig } from "convex/server";
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";

const authConfig = {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;

export default authConfig;
