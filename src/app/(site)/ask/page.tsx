import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { SectionHeading } from "@/components/site/section-heading";
import { AskChat } from "@/components/site/ask-chat";

export const metadata: Metadata = buildMetadata({
  title: "Ask Corey - Interactive Resume",
  description:
    "Ask grounded questions about Corey’s projects, writing, leadership, and engineering experience.",
  path: "/ask",
});

export default function AskPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Ask Corey"
        title="Grounded Q&A over projects, writing, and experience."
        description="Ask about architecture, product work, leadership, iOS, or AI integration. Responses are grounded in published site content and surface direct citations."
      />
      <AskChat />
    </div>
  );
}
