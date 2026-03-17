import { APIError, betterAuth, type BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const authComponent = createClient<DataModel>(components.betterAuth);

function getPublicSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000"
  );
}

function getAuthBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    process.env.CONVEX_SITE_URL ??
    getPublicSiteUrl()
  );
}

function getTrustedOrigins() {
  return [...new Set([getAuthBaseUrl(), getPublicSiteUrl()])];
}

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmails().has(email.trim().toLowerCase());
}

function getEmailFromBody(body: unknown) {
  if (!body || typeof body !== "object" || !("email" in body)) {
    return null;
  }

  return typeof body.email === "string" ? body.email : null;
}

function requireAdminEmail(email: string | null | undefined) {
  if (isAdminEmail(email)) {
    return;
  }

  throw APIError.from("FORBIDDEN", {
    code: "ADMIN_ONLY_AUTH",
    message: "Only configured admin accounts can access this site admin.",
  });
}

function adminOnlyAuth(): BetterAuthPlugin {
  return {
    id: "admin-only-auth",
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                async before(user) {
                  requireAdminEmail("email" in user ? String(user.email) : null);

                  return {
                    data: user,
                  };
                },
              },
            },
          },
        },
      };
    },
    hooks: {
      before: [
        {
          matcher(context) {
            return (
              context.path === "/sign-in/email" || context.path === "/sign-up/email"
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            requireAdminEmail(getEmailFromBody(ctx.body));
          }),
        },
      ],
    },
  };
}

export const createAuth = (ctx: Parameters<typeof authComponent.adapter>[0]) => {
  const githubConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  return betterAuth({
    secret:
      process.env.BETTER_AUTH_SECRET ??
      "development-only-better-auth-secret-change-me",
    baseURL: getAuthBaseUrl(),
    trustedOrigins: getTrustedOrigins(),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    ...(githubConfigured
      ? {
          socialProviders: {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID!,
              clientSecret: process.env.GITHUB_CLIENT_SECRET!,
              disableImplicitSignUp: true,
              disableSignUp: true,
            },
          },
        }
      : {}),
    database: authComponent.adapter(ctx),
    plugins: [
      adminOnlyAuth(),
      convex({
        authConfig,
      }),
    ],
  });
};

export const { getAuthUser } = authComponent.clientApi();

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    return {
      isAuthenticated: Boolean(user),
      isAdmin: isAdminEmail(user?.email),
      auth: {
        emailPasswordEnabled: true,
        githubEnabled: Boolean(
          process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ),
      },
      user: user
        ? {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
          }
        : null,
    };
  },
});

export { authComponent };
