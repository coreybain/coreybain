import type { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";
import { authServer } from "@/lib/auth-server";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialToken = await authServer.getToken();

  return <AppProviders initialToken={initialToken}>{children}</AppProviders>;
}
