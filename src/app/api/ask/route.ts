import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { getTextModel, getTextModelInfo } from "@/lib/ai/model";
import { logAiEvent, approximateTokens } from "@/lib/ai/observability";
import { buildKnowledgeContext, retrieveKnowledge } from "@/lib/ai/knowledge";
import { getRequestIp } from "@/lib/server/request-context";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { toAbsoluteUrl } from "@/lib/site-config";

export const maxDuration = 30;

function getLatestUserText(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  const latestTextPart = latestUserMessage?.parts.find(
    (part) => part.type === "text"
  );

  return latestTextPart?.type === "text" ? latestTextPart.text : "";
}

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const latestUserText = getLatestUserText(messages);
  const ipAddress = getRequestIp(request);
  const rateLimit = checkRateLimit({
    route: "ask",
    identifier: ipAddress,
    limit: 12,
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
  const citations = await retrieveKnowledge(latestUserText);

  logAiEvent({
    route: "/api/ask",
    operation: "retrieve-knowledge",
    status: citations.length > 0 ? "succeeded" : "degraded",
    latencyMs: Date.now() - startedAt,
    promptChars: latestUserText.length,
    approxInputTokens: approximateTokens(latestUserText),
    resultCount: citations.length,
    modelId: modelInfo.modelId,
    provider: modelInfo.provider,
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      for (const citation of citations) {
        writer.write({
          type: "source-url",
          sourceId: citation.id,
          url: toAbsoluteUrl(citation.url),
          title: citation.title,
        });
      }

      const result = streamText({
        model: getTextModel(),
        system: [
          "You are Ask Corey, an assistant for Corey Baines' personal site.",
          "Answer only from the provided site knowledge.",
          "Keep answers concise, concrete, and grounded in the site content.",
          "If the answer is not supported by the knowledge, say that directly instead of guessing.",
          "Do not invent projects, employers, or metrics.",
          "Prefer mentioning the relevant page titles in the answer when helpful.",
          "",
          "Relevant site knowledge:",
          await buildKnowledgeContext(latestUserText, 4),
        ].join(" "),
        maxOutputTokens: 700,
        timeout: { totalMs: 20_000, chunkMs: 8_000 },
        messages: await convertToModelMessages(messages),
        onFinish: ({ totalUsage }) => {
          logAiEvent({
            route: "/api/ask",
            operation: "stream-text",
            status: "succeeded",
            latencyMs: Date.now() - startedAt,
            promptChars: latestUserText.length,
            approxInputTokens:
              totalUsage?.inputTokens ?? approximateTokens(latestUserText),
            approxOutputTokens: totalUsage?.outputTokens,
            resultCount: citations.length,
            modelId: modelInfo.modelId,
            provider: modelInfo.provider,
          });
        },
      });

      writer.merge(result.toUIMessageStream());
    },
    onError: (error) => {
      logAiEvent({
        route: "/api/ask",
        operation: "stream-text",
        status: "failed",
        latencyMs: Date.now() - startedAt,
        promptChars: latestUserText.length,
        approxInputTokens: approximateTokens(latestUserText),
        resultCount: citations.length,
        modelId: modelInfo.modelId,
        provider: modelInfo.provider,
        error: error instanceof Error ? error.message : String(error),
      });
      return "I hit a snag while searching the site knowledge.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
