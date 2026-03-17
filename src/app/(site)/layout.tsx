import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/site-shell";

export const revalidate = 3600;

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
