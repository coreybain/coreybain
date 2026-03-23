import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { GridCursorGlow } from "@/components/grid-cursor-glow";
import { ReactGrabDev } from "@/components/react-grab-dev";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${plexMono.variable} antialiased`}>
        {process.env.NODE_ENV === "development" && <ReactGrabDev />}
        <GridCursorGlow />
        {children}
      </body>
    </html>
  );
}
