import { fetchMutation, fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { approximateTokens, logAiEvent } from "@/lib/ai/observability";
import { CONTACT_BOT_BLOCK_MESSAGE } from "@/lib/botid";
import { contactBriefSchema } from "@/lib/ai/contact-brief";
import { CONTACT_MESSAGE_MIN, normalizeContactWebsite } from "@/lib/contact";
import { verifyBotId } from "@/lib/server/botid";
import { getRequestIp } from "@/lib/server/request-context";
import { checkRateLimit } from "@/lib/server/rate-limit";

const inputSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  company: z.string().max(160).optional(),
  website: z.preprocess(
    (value) =>
      typeof value === "string" ? normalizeContactWebsite(value) : value,
    z.string().url().optional()
  ),
  message: z.string().min(CONTACT_MESSAGE_MIN).max(5000),
  aiBrief: contactBriefSchema
    .pick({
      summary: true,
      goals: true,
      scopeSignals: true,
      nextSteps: true,
    })
    .optional(),
  matchedProjectSlugs: z.array(z.string()).max(5).optional(),
  matchedPostSlugs: z.array(z.string()).max(5).optional(),
  botField: z.string().max(0).optional(),
  startedAt: z.number().int().positive(),
});

function getValidationErrorMessage(error: z.ZodError) {
  const issue = error.issues[0];

  if (!issue) {
    return "Please check the inquiry details and try again.";
  }

  if (issue.path[0] === "message" && issue.code === "too_small") {
    return `Project notes need at least ${CONTACT_MESSAGE_MIN} characters.`;
  }

  if (issue.path[0] === "website") {
    return "Add a valid website URL or leave the field blank.";
  }

  if (issue.path[0] === "email") {
    return "Add a valid email address so I can reply.";
  }

  if (issue.path[0] === "name") {
    return "Add your name before sending the inquiry.";
  }

  return "Please check the inquiry details and try again.";
}

async function sendContactNotification(args: {
  notificationEmail: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  message: string;
  aiBrief?: {
    summary: string;
    goals: string[];
    scopeSignals: string[];
    nextSteps: string[];
  };
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info(
      JSON.stringify({
        scope: "email",
        ts: new Date().toISOString(),
        route: "/api/contact/submit",
        status: "skipped",
        reason: "missing-resend-api-key",
      })
    );
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Corey Baines <onboarding@resend.dev>";
  const bodyLines = [
    `New work inquiry from ${args.name} (${args.email})`,
    args.company ? `Company: ${args.company}` : null,
    args.website ? `Website: ${args.website}` : null,
    "",
    "Project notes:",
    args.message,
    args.aiBrief
      ? [
          "",
          "AI brief summary:",
          args.aiBrief.summary,
          "",
          `Goals: ${args.aiBrief.goals.join(", ")}`,
          `Scope signals: ${args.aiBrief.scopeSignals.join(", ")}`,
          `Suggested next steps: ${args.aiBrief.nextSteps.join(", ")}`,
        ].join("\n")
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.notificationEmail],
      reply_to: args.email,
      subject: `New work inquiry from ${args.name}`,
      text: bodyLines,
    }),
  });

  if (!response.ok) {
    const failure = await response.text();
    throw new Error(`Resend request failed: ${failure}`);
  }
}

export const maxDuration = 30;

export async function POST(request: Request) {
  const ipAddress = getRequestIp(request);
  const rateLimit = checkRateLimit({
    route: "contact-submit",
    identifier: ipAddress,
    limit: 4,
    windowMs: 5 * 60_000,
  });

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error:
          "Too many submissions right now. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  const botCheck = await verifyBotId(request);

  if (botCheck.isBot) {
    return Response.json({ error: CONTACT_BOT_BLOCK_MESSAGE }, { status: 403 });
  }

  const parsed = inputSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      {
        error: getValidationErrorMessage(parsed.error),
      },
      { status: 400 }
    );
  }

  const body = parsed.data;

  if (body.botField?.trim()) {
    return Response.json({ ok: true });
  }

  if (Date.now() - body.startedAt < 2_000) {
    return Response.json(
      { error: "Please take a moment to review your inquiry before sending it." },
      { status: 400 }
    );
  }

  const startedAt = Date.now();

  try {
    await fetchMutation(api.site.createContactSubmission, {
      name: body.name.trim(),
      email: body.email.trim(),
      company: body.company?.trim() || undefined,
      website: body.website?.trim() || undefined,
      message: body.message.trim(),
      aiBrief: body.aiBrief,
      matchedProjectSlugs: body.matchedProjectSlugs,
      matchedPostSlugs: body.matchedPostSlugs,
    });

    const notificationEmail = await fetchQuery(api.content.getNotificationEmail, {});

    await sendContactNotification({
      notificationEmail,
      name: body.name.trim(),
      email: body.email.trim(),
      company: body.company?.trim() || undefined,
      website: body.website,
      message: body.message.trim(),
      aiBrief: body.aiBrief,
    });

    logAiEvent({
      route: "/api/contact/submit",
      operation: "submit-inquiry",
      status: "succeeded",
      latencyMs: Date.now() - startedAt,
      promptChars: body.message.length,
      approxInputTokens: approximateTokens(body.message),
    });

    return Response.json({ ok: true });
  } catch (error) {
    logAiEvent({
      route: "/api/contact/submit",
      operation: "submit-inquiry",
      status: "failed",
      latencyMs: Date.now() - startedAt,
      promptChars: body.message.length,
      approxInputTokens: approximateTokens(body.message),
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Could not send the inquiry right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
