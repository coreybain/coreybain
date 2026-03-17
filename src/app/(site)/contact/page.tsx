import type { Metadata } from "next";
import { buildMetadata } from "@/app/seo";
import { SectionHeading } from "@/components/site/section-heading";
import { ContactIntake } from "@/components/site/contact-intake";

export const metadata: Metadata = buildMetadata({
  title: "Contact - Corey Baines",
  description:
    "Start a project conversation and share the details of what you are building.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Tell me what you are building."
        description="Describe the product, team, and stage you are at, and I’ll review the details and follow up directly."
      />
      <ContactIntake />
    </div>
  );
}
