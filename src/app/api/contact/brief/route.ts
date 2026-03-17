import { generateText, Output } from "ai";
import { z } from "zod";
import { contactBriefSchema } from "@/lib/ai/contact-brief";
import { retrieveKnowledge } from "@/lib/ai/knowledge";
import { getTextModel, getTextModelInfo } from "@/lib/ai/model";
import { approximateTokens, logAiEvent } from "@/lib/ai/observability";
import { getRequestIp } from "@/lib/server/request-context";
import { checkRateLimit } from "@/lib/server/rate-limit";

const inputSchema = z.object({
  description: z.string().min(20).max(4000),
});

export const maxDuration = 30;

export async function POST(request: Request) {
  const ipAddress = getRequestIp(request);
  const rateLimit = checkRateLimit({
    route: "contact-brief",
    identifier: ipAddress,
    limit: 6,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error:
          "Too many brief requests right now. Please wait a minute and try again.",
      },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  const startedAt = Date.now();
  const body = inputSchema.parse(await request.json());
  const relatedDocuments = await retrieveKnowledge(body.description, 5);
  const modelInfo = getTextModelInfo();

  try {
    const { output, usage } = await generateText({
      model: getTextModel(),
      output: Output.object({
        schema: contactBriefSchema,
      }),
      prompt: [
        "Turn the rough project inquiry into a concise, useful work brief.",
        "Do not fabricate scope or budget details.",
        "Use the related site content to recommend only the most relevant projects and posts.",
        "Return clean, direct language appropriate for a work inquiry.",
        "",
        `Inquiry:\n${body.description}`,
        "",
        "Related site content:",
        ...relatedDocuments.map(
          (document) =>
            `- ${document.title} (${document.sourceType}, ${document.url}): ${document.plainText}`
        ),
      ].join("\n"),
      maxOutputTokens: 700,
      timeout: { totalMs: 20_000 },
    });

    logAiEvent({
      route: "/api/contact/brief",
      operation: "generate-brief",
      status: "succeeded",
      latencyMs: Date.now() - startedAt,
      promptChars: body.description.length,
      approxInputTokens:
        usage?.inputTokens ?? approximateTokens(body.description),
      approxOutputTokens: usage?.outputTokens,
      resultCount: relatedDocuments.length,
      modelId: modelInfo.modelId,
      provider: modelInfo.provider,
    });

    return Response.json(output);
  } catch (error) {
    logAiEvent({
      route: "/api/contact/brief",
      operation: "generate-brief",
      status: "failed",
      latencyMs: Date.now() - startedAt,
      promptChars: body.description.length,
      approxInputTokens: approximateTokens(body.description),
      resultCount: relatedDocuments.length,
      modelId: modelInfo.modelId,
      provider: modelInfo.provider,
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error:
          "Could not generate the AI brief right now. You can still send your inquiry without it.",
      },
      { status: 500 }
    );
  }
}
