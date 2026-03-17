"use client";

const CACHE_REFRESH_ERROR =
  "Content saved, but the public site cache could not be refreshed immediately.";

export async function refreshPublicSiteContent() {
  try {
    const response = await fetch("/api/internal/revalidate-site", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Revalidation failed with status ${response.status}.`);
    }

    return { ok: true as const, message: null };
  } catch (error) {
    console.error(CACHE_REFRESH_ERROR, error);
    return { ok: false as const, message: CACHE_REFRESH_ERROR };
  }
}
