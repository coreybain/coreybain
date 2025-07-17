import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corey Baines – React Developer & iOS Hobbyist",
  description:
    "Personal developer site for Corey Baines, Lead Software Engineer, React specialist, and iOS hobbyist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800`}
      >
        {children}
      </body>
    </html>
  );
}
