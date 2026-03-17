import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";

const siteName = "Corey Baines";
const defaultOgImage = "/og-default.png";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
};

export function buildMetadata({
  title,
  description,
  path,
  type = "website",
}: MetadataInput): Metadata {
  const canonical = new URL(path, siteUrl).toString();
  const ogImage = new URL(defaultOgImage, siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type,
      url: canonical,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteName} site preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
