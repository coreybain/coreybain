import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { AskChat } from "@/components/site/ask-chat";

export const metadata: Metadata = buildMetadata({
  title: "Ask Corey - Interactive Resume",
  description:
    "Ask grounded questions about Corey’s projects, writing, leadership, and engineering experience.",
  path: "/ask",
});

export default function AskPage() {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-3">
      <AskChat />
    </div>
  );
}
