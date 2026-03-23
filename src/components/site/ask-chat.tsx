"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { ASK_COREY_HANDOFF_KEY, askCoreyPrompts } from "@/lib/site/ask-prompts";

type DisplayMessage = Pick<UIMessage, "id" | "role" | "parts">;
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
  const seen = new Set<string>();

  return message.parts.filter(isSourceUrlPart).filter((part) => {
    const key = `${part.sourceId}:${part.url}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function coalesceMessages(messages: UIMessage[]): DisplayMessage[] {
  return messages.reduce<DisplayMessage[]>((acc, message) => {
    const previous = acc.at(-1);

    if (previous && previous.role === message.role) {
      previous.parts = [...previous.parts, ...message.parts];
      return acc;
    }

    acc.push({
      id: message.id,
      role: message.role,
      parts: [...message.parts],
    });
    return acc;
  }, []);
}

const TEXTAREA_MAX_LINES = 4;

function clampTextareaHeight(el: HTMLTextAreaElement, maxLines: number) {
  el.style.height = "auto";
  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize);
  let lineHeight = parseFloat(cs.lineHeight);
  if (Number.isNaN(lineHeight) || lineHeight <= 0) {
    lineHeight = fontSize * 1.625;
  }
  const paddingTop = parseFloat(cs.paddingTop);
  const paddingBottom = parseFloat(cs.paddingBottom);
  const borderTop = parseFloat(cs.borderTopWidth);
  const borderBottom = parseFloat(cs.borderBottomWidth);
  const maxHeight =
    lineHeight * maxLines + paddingTop + paddingBottom + borderTop + borderBottom;
  const next = Math.min(el.scrollHeight, maxHeight);
  el.style.height = `${next}px`;
  el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
}

export function AskChat() {
  const [input, setInput] = useState("");
  const hasConsumedHandoff = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ask",
    }),
  });

  const submitPrompt = (prompt: string) => {
    if (!prompt.trim() || status === "streaming") {
      return;
    }

    sendMessage({ text: prompt });
    setInput("");
  };

  useEffect(() => {
    document.documentElement.classList.add("ask-page");
    document.body.classList.add("ask-page");

    return () => {
      document.documentElement.classList.remove("ask-page");
      document.body.classList.remove("ask-page");
    };
  }, []);

  useEffect(() => {
    if (hasConsumedHandoff.current) {
      return;
    }

    hasConsumedHandoff.current = true;

    const handoffPrompt = sessionStorage.getItem(ASK_COREY_HANDOFF_KEY)?.trim();
    sessionStorage.removeItem(ASK_COREY_HANDOFF_KEY);

    if (handoffPrompt) {
      sendMessage({ text: handoffPrompt });
    }
  }, [sendMessage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !shouldAutoScrollRef.current) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight });
  }, [messages, status]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    clampTextareaHeight(el, TEXTAREA_MAX_LINES);
  }, [input]);

  const displayMessages = coalesceMessages(messages);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_1px_0_0_color-mix(in_oklab,var(--color-foreground)_6%,transparent)]">
      <header className="shrink-0 border-b border-[color:var(--color-border)] bg-[color:color-mix(in_oklab,var(--color-surface-alt)_65%,transparent)] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
              Ask about my work
            </h3>
            <p className="max-w-xl text-sm text-[color:var(--color-muted-foreground)]">
              Projects, architecture, leadership, iOS, and AI—grounded in what’s
              published here, with citations when available.
            </p>
          </div>
          <div
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]"
            aria-live="polite"
          >
            {status === "streaming" ? "Answering…" : "Ready"}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
          shouldAutoScrollRef.current = distanceFromBottom <= 24;
        }}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-3 sm:px-5"
      >
        {displayMessages.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="max-w-md space-y-2">
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                Start the conversation
              </p>
              <p className="text-pretty text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
                Pick a starter below or write your own question. I’ll pull from site
                content so answers stay specific and citeable.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {displayMessages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[min(100%,28rem)] rounded-2xl rounded-br-md border border-[color:color-mix(in_oklab,var(--color-accent)_35%,var(--color-border))] bg-[color:var(--color-surface-alt)] px-4 py-3 shadow-sm"
                    : "mr-auto max-w-[min(100%,36rem)] rounded-2xl rounded-bl-md border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 shadow-sm"
                }
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-muted-foreground)]">
                  {message.role === "user" ? "You" : "Corey"}
                </p>

                <div className="mt-2 text-sm leading-7 text-[color:var(--color-foreground)] [&>*+*]:mt-3 [&_a]:font-medium [&_a]:underline [&_code]:rounded-md [&_code]:bg-[color:var(--color-surface-alt)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_li]:whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[color:var(--color-surface-alt)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                  {getTextParts(message).map((part, index) => (
                    <ReactMarkdown key={`${message.id}-text-${index}`}>
                      {part.text}
                    </ReactMarkdown>
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
        )}
      </div>

      <div className="shrink-0 border-t border-[color:var(--color-border)] bg-[color:color-mix(in_oklab,var(--color-background)_88%,transparent)] px-4 py-3 sm:px-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {displayMessages.length === 0 ? (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {askCoreyPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitPrompt(prompt)}
                    disabled={status === "streaming"}
                    className="cursor-pointer rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-left text-xs leading-snug text-[color:var(--color-foreground)] transition-all hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitPrompt(input);
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Your question</span>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submitPrompt(input);
                    }
                  }}
                  placeholder="e.g. Which projects best match an internal SaaS rebuild?"
                  className="w-full resize-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-[color:color-mix(in_oklab,var(--color-muted-foreground)_75%,transparent)] focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--color-accent)_35%,transparent)]"
                />
              </label>
              <button
                type="submit"
                disabled={!input.trim() || status === "streaming"}
                className="shrink-0 rounded-2xl border border-[color:color-mix(in_oklab,var(--color-accent)_45%,var(--color-border))] bg-[color:var(--color-surface-alt)] px-5 py-2 text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-end"
              >
                {status === "streaming" ? "Sending…" : "Send"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[color:var(--color-muted-foreground)]">
              <p>
                {status === "streaming"
                  ? "Searching published site knowledge…"
                  : "Enter to send · Shift+Enter for a new line"}
              </p>
            </div>
          </form>

          {error ? (
            <p className="rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
              {error.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
