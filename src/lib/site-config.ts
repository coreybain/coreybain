export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "http://localhost:3000";

export const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export const convexSiteUrl =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL;

export function toAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
