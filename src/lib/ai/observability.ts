type AiLogStatus = "started" | "succeeded" | "failed" | "degraded";

type AiLogEvent = {
  route: string;
  operation: string;
  status: AiLogStatus;
  latencyMs?: number;
  promptChars?: number;
  approxInputTokens?: number;
  approxOutputTokens?: number;
  resultCount?: number;
  modelId?: string;
  provider?: string;
  error?: string;
};

export function approximateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}

export function logAiEvent(event: AiLogEvent) {
  const payload = {
    scope: "ai",
    ts: new Date().toISOString(),
    ...event,
  };

  if (event.status === "failed") {
    console.error(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}
