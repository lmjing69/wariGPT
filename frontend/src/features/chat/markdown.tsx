"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

interface MarkdownProps {
  content: string;
  className?: string;
}

/** Renders assistant markdown with GFM tables, lists, and highlighted code. */
export const Markdown = React.memo(function Markdown({
  content,
  className,
}: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose-chat text-sm leading-relaxed text-foreground/90",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 whitespace-pre-wrap">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="marker:text-muted-foreground">{children}</li>,
          h1: ({ children }) => (
            <h1 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h3>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-border pl-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted/50 px-3 py-2 font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/50 px-3 py-2">{children}</td>
          ),
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const raw = String(children).replace(/\n$/, "");
            const isInline = !codeClassName && !raw.includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const language = match?.[1] ?? "text";

            return (
              <div className="group/code relative mb-3 overflow-hidden rounded-lg border border-border bg-[#282c34]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
                  <span className="text-[0.7rem] font-medium uppercase tracking-wide text-white/50">
                    {language}
                  </span>
                  <CopyButton
                    value={raw}
                    className="size-6 text-white/60 hover:text-white"
                  />
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    padding: "0.875rem 1rem",
                    fontSize: "0.8125rem",
                  }}
                >
                  {raw}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
