"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { ASK_COREY_HANDOFF_KEY } from "@/lib/site/ask-prompts";

type AskPromptButtonsProps = {
  prompts: readonly string[];
};

export function AskPromptButtons({ prompts }: AskPromptButtonsProps) {
  const router = useRouter();

  const handleClick = (prompt: string) => {
    sessionStorage.setItem(ASK_COREY_HANDOFF_KEY, prompt);
    startTransition(() => {
      router.push("/ask");
    });
  };

  return (
    <ul className="grid gap-3 text-sm">
      {prompts.map((prompt) => (
        <li key={prompt}>
          <button
            type="button"
            onClick={() => handleClick(prompt)}
            className="w-full cursor-pointer rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-left transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] focus-visible:border-[color:var(--color-accent)] focus-visible:text-[color:var(--color-accent)] focus-visible:outline-none"
          >
            {prompt}
          </button>
        </li>
      ))}
    </ul>
  );
}
