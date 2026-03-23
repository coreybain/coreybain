"use client";

import * as React from "react";
import ReactMarkdownImport from "react-markdown";

type MarkdownProps = React.PropsWithChildren<{
  className?: string;
}>;

const ReactMarkdown = ReactMarkdownImport as unknown as (
  props: MarkdownProps
) => React.ReactNode;

export function Markdown(props: MarkdownProps) {
  return <>{ReactMarkdown(props)}</>;
}
