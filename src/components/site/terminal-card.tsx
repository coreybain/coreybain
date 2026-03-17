"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RUNNERS = [
  { label: "npx", command: "npx coreybaines" },
  { label: "bunx", command: "bunx coreybaines" },
  { label: "pnpm dlx", command: "pnpm dlx coreybaines" },
  { label: "yarn dlx", command: "yarn dlx coreybaines" },
] as const;

export function TerminalCard() {
  const [activeRunner, setActiveRunner] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const command = RUNNERS[activeRunner].command;

  const copyCommand = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable */
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-[0.14em] text-[color:var(--color-muted-foreground)] uppercase">
          Try it out
        </p>
        <h2 className="text-balance text-2xl font-semibold sm:text-3xl">
          Run in your terminal.
        </h2>
        <p className="max-w-3xl text-pretty text-[color:var(--color-muted-foreground)]">
          An interactive CLI profile card — one command away.
        </p>
      </header>

      {/* ── terminal chrome ── */}
      <div className="terminal-card group relative overflow-hidden rounded-xl border border-[color:var(--color-border)]">
        {/* title bar */}
        <div className="terminal-titlebar flex items-center gap-2 border-b border-[color:var(--color-border)] px-4 py-2.5">
          <span className="terminal-dot terminal-dot--red" />
          <span className="terminal-dot terminal-dot--yellow" />
          <span className="terminal-dot terminal-dot--green" />
          <span className="ml-3 select-none font-mono text-[11px] tracking-wide text-[color:var(--color-muted-foreground)] opacity-60">
            ~/terminal
          </span>
        </div>

        {/* body */}
        <div className="terminal-body relative flex items-center gap-3 px-5 py-5 sm:px-6 sm:py-6">
          {/* prompt indicator */}
          <span
            className="terminal-prompt select-none font-mono text-sm font-bold"
            aria-hidden="true"
          >
            ❯
          </span>

          {/* command text */}
          <code className="terminal-command flex-1 font-mono text-sm sm:text-base">
            <span className="terminal-runner">{RUNNERS[activeRunner].label}</span>{" "}
            <span className="text-[color:var(--term-command)]">coreybaines</span>
          </code>

          {/* copy + dropdown cluster */}
          <div className="relative flex items-center">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="terminal-copy-btn flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[color:var(--color-border)] px-3 font-mono text-xs leading-none transition-all duration-200"
                  aria-label="Choose package runner to copy"
                >
                  <CopyIcon />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="terminal-dropdown min-w-[220px] border-[color:var(--color-border)] p-1 shadow-lg"
              >
                {RUNNERS.map((runner, i) => (
                  <DropdownMenuItem
                    key={runner.label}
                    onSelect={() => {
                      setActiveRunner(i);
                      void copyCommand(runner.command);
                    }}
                    className={`terminal-dropdown-item flex w-full cursor-pointer items-center gap-3 px-3 py-2 font-mono text-xs transition-colors data-[highlighted]:bg-[color:var(--term-dropdown-hover-bg)] data-[highlighted]:text-[color:var(--term-dropdown-hover-text)] ${
                      i === activeRunner ? "terminal-dropdown-item--active" : ""
                    }`}
                  >
                    <span className="flex-1">{runner.command}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* scanline effect */}
        <div className="terminal-scanline pointer-events-none absolute inset-0" />
      </div>
    </section>
  );
}

/* ── inline SVG icons ── */

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
