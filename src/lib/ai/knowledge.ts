import "server-only";

import { embed } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export type KnowledgeCitation = {
  id: string;
  title: string;
  url: string;
  plainText: string;
  sourceType: "project" | "post" | "page";
};

async function getQueryEmbedding(queryText: string) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return undefined;
  }

  try {
    const { embedding } = await embed({
      model: gateway.embedding("openai/text-embedding-3-large"),
      value: queryText,
    });

    return embedding;
  } catch (error) {
    console.error("Failed to create query embedding.", error);
    return undefined;
  }
}

export async function retrieveKnowledge(queryText: string, limit = 4) {
  const embedding = await getQueryEmbedding(queryText);
  const documents = await fetchQuery(api.content.searchKnowledgeDocuments, {
    queryText,
    limit,
    embedding,
  });

  return documents.map(
    (document): KnowledgeCitation => ({
      id: `${document.sourceType}:${document.sourceSlug}`,
      title: document.title,
      url: document.url,
      plainText: document.plainText,
      sourceType: document.sourceType,
    })
  );
}

export async function buildKnowledgeContext(queryText: string, limit = 4) {
  const documents = await retrieveKnowledge(queryText, limit);

  return documents
    .map(
      (document) =>
        `- ${document.title} (${document.sourceType}, ${document.url}): ${document.plainText}`
    )
    .join("\n");
}
