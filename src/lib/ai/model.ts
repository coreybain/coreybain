import { anthropic } from "@ai-sdk/anthropic";
import { gateway } from "@ai-sdk/gateway";

const gatewayModelId = "openai/gpt-5.4-mini";
const anthropicModelId = "claude-sonnet-4-6";

export function getTextModelInfo() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return {
      provider: "vercel-ai-gateway",
      modelId: gatewayModelId,
      fallback: false,
    };
  }

  return {
    provider: "anthropic-direct",
    modelId: anthropicModelId,
    fallback: true,
  };
}

export function getTextModel() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway(gatewayModelId);
  }

  if (process.env.NODE_ENV !== "production" && process.env.ANTHROPIC_API_KEY) {
    return anthropic(anthropicModelId);
  }

  throw new Error(
    "AI_GATEWAY_API_KEY is required in production. Set it or enable a development fallback locally.",
  );
}
