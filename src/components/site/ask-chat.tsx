"use client";

import { useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

const suggestedPrompts = [
  "Which projects best match an internal SaaS rebuild?",
  "How does Corey approach architecture decisions in small teams?",
  "What AI integrations has Corey worked on?",
  "What experience is most relevant for product leadership?",
];

type TextPart = Extract<UIMessage["parts"][number], { type: "text" }>;
type SourceUrlPart = Extract<UIMessage["parts"][number], { type: "source-url" }>;

function isTextPart(part: UIMessage["parts"][number]): part is TextPart {
  return part.type === "text";
}

function isSourceUrlPart(
  part: UIMessage["parts"][number]
): part is SourceUrlPart {
  return part.type === "source-url";
}

function getTextParts(message: UIMessage) {
  return message.parts.filter(isTextPart);
}

function getSourceParts(message: UIMessage) {
  return message.parts.filter(isSourceUrlPart);
}

export function AskChat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ask",
    }),
  });

  const submitPrompt = (prompt: string) => {
    if (!prompt.trim()) {
      return;
    }

    sendMessage({ text: prompt });
    setInput("");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
        <div className="grid gap-3">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitPrompt(prompt)}
              className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-left text-sm transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-5 text-sm text-[color:var(--color-muted-foreground)]">
              Ask about projects, architecture, leadership, iOS work, or AI
              product thinking. Answers stay grounded in the published site
              content.
            </div>
          ) : null}

          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-3xl rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-3"
                  : "max-w-3xl rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3"
              }
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                {message.role === "user" ? "You" : "Ask Corey"}
              </p>

              <div className="mt-3 space-y-3 text-sm leading-7">
                {getTextParts(message).map((part, index) => (
                  <p key={`${message.id}-text-${index}`} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                ))}
              </div>

              {message.role === "assistant" && getSourceParts(message).length > 0 ? (
                <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                    Sources
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                    {getSourceParts(message).map((part, index) => (
                      <li key={`${message.id}-source-${part.sourceId}-${index}`}>
                        <a
                          href={part.url}
                          className="inline-flex rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-[color:var(--color-muted-foreground)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
                        >
                          {part.title ?? part.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitPrompt(input);
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm text-[color:var(--color-muted-foreground)]">
              Ask a question
            </span>
            <textarea
              rows={4}
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder="What kind of work is Corey strongest at for a growing product team?"
              className="w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)]"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              {status === "streaming"
                ? "Searching published site knowledge..."
                : "Responses stay grounded in projects, writing, and experience."}
            </p>
            <button
              type="submit"
              disabled={!input.trim() || status === "streaming"}
              className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-5 py-2 text-sm font-medium transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "streaming" ? "Thinking..." : "Ask"}
            </button>
          </div>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
            {error.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}
