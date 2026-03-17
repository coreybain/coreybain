import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { GridCursorGlow } from "@/components/grid-cursor-glow";
import { authServer } from "@/lib/auth-server";
import { buildMetadata } from "./seo";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildMetadata({
  title: "Corey Baines - Principal Full-Stack Engineer",
  description:
    "Personal site for Corey Baines featuring project case studies, writing, and AI-assisted ways to evaluate fit and start work conversations.",
  path: "/",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialToken = await authServer.getToken();

  return (
    <html lang="en">
      <body className={`${sora.variable} ${plexMono.variable} antialiased`}>
        <GridCursorGlow />
        <AppProviders initialToken={initialToken}>{children}</AppProviders>
      </body>
    </html>
  );
}
