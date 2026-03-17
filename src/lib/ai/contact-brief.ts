import { z } from "zod";

export const contactBriefSchema = z.object({
  summary: z.string(),
  goals: z.array(z.string()).min(1).max(4),
  scopeSignals: z.array(z.string()).max(4),
  recommendedProjects: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        href: z.string(),
        reason: z.string(),
      })
    )
    .max(3),
  recommendedWriting: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        href: z.string(),
        reason: z.string(),
      })
    )
    .max(3),
  nextSteps: z.array(z.string()).min(1).max(4),
});

export type ContactBrief = z.infer<typeof contactBriefSchema>;
