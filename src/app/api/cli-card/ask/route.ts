import { generateText } from "ai";
import { retrieveKnowledge } from "@/lib/ai/knowledge";
import { approximateTokens, logAiEvent } from "@/lib/ai/observability";
import { getTextModel, getTextModelInfo } from "@/lib/ai/model";
import { getRequestIp } from "@/lib/server/request-context";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { toAbsoluteUrl } from "@/lib/site-config";

export const maxDuration = 30;

function buildCliKnowledgeContext(
  citations: Awaited<ReturnType<typeof retrieveKnowledge>>
) {
  return citations
    .map(
      (citation) =>
        `- ${citation.title} (${citation.sourceType}, ${citation.url}): ${citation.plainText}`
    )
    .join("\n");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!question) {
    return Response.json(
      {
        error: "A question is required.",
      },
      {
        status: 400,
      }
    );
  }

  const ipAddress = getRequestIp(request);
  const rateLimit = checkRateLimit({
    route: "cli-ask",
    identifier: ipAddress,
    limit: 8,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error:
          "Too many Ask Corey requests right now. Please wait a minute and try again.",
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
  const modelInfo = getTextModelInfo();
  const citations = await retrieveKnowledge(question);

  logAiEvent({
    route: "/api/cli-card/ask",
    operation: "retrieve-knowledge",
    status: citations.length > 0 ? "succeeded" : "degraded",
    latencyMs: Date.now() - startedAt,
    promptChars: question.length,
    approxInputTokens: approximateTokens(question),
    resultCount: citations.length,
    modelId: modelInfo.modelId,
    provider: modelInfo.provider,
  });

  try {
    const result = await generateText({
      model: getTextModel(),
      system: [
        "You are Ask Corey, an assistant for Corey Baines' personal site and CLI.",
        "Answer only from the provided site knowledge.",
        "Keep answers concise, concrete, and grounded in the site content.",
        "If the answer is not supported by the knowledge, say that directly instead of guessing.",
        "Do not invent projects, employers, or metrics.",
        "",
        "Relevant site knowledge:",
        buildCliKnowledgeContext(citations),
      ].join(" "),
      prompt: question,
      maxOutputTokens: 350,
    });

    logAiEvent({
      route: "/api/cli-card/ask",
      operation: "generate-text",
      status: "succeeded",
      latencyMs: Date.now() - startedAt,
      promptChars: question.length,
      approxInputTokens: approximateTokens(question),
      approxOutputTokens: approximateTokens(result.text),
      resultCount: citations.length,
      modelId: modelInfo.modelId,
      provider: modelInfo.provider,
    });

    return Response.json({
      answer: result.text.trim(),
      citations: citations.map((citation) => ({
        title: citation.title,
        url: toAbsoluteUrl(citation.url),
        sourceType: citation.sourceType,
      })),
    });
  } catch (error) {
    logAiEvent({
      route: "/api/cli-card/ask",
      operation: "generate-text",
      status: "failed",
      latencyMs: Date.now() - startedAt,
      promptChars: question.length,
      approxInputTokens: approximateTokens(question),
      resultCount: citations.length,
      modelId: modelInfo.modelId,
      provider: modelInfo.provider,
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Ask Corey is unavailable right now.",
      },
      {
        status: 503,
      }
    );
  }
}
