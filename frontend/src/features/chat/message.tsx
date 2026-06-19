"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  User,
} from "lucide-react";
import { useTTS } from "@/hooks/use-tts";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ChatMessage } from "@/types";
import { Markdown } from "./markdown";
import { SourcesButton } from "@/features/citations/sources-button";

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate: () => void;
}

export function Message({
  message,
  isLast,
  isStreaming,
  onRegenerate,
}: MessageProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isThinking =
    message.status === "streaming" && message.content.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group/message w-full"
    >
      <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div
          className={cn(
            "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
            isUser
              ? "bg-gradient-to-br from-rose-100 to-orange-100 text-rose-500 shadow-sm dark:from-rose-900/40 dark:to-orange-900/30 dark:text-rose-300"
              : "bg-gradient-to-br from-brand/80 to-brand/40 text-brand-foreground shadow-sm"
          )}
        >
          {isUser ? <User className="size-3.5" /> : <span aria-hidden>✨</span>}
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex min-w-0 flex-col",
            isUser ? "items-end" : "items-start",
            "max-w-[min(100%,46rem)] flex-1"
          )}
        >
          {/* Attachments (above user text) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn("mb-2 flex flex-wrap gap-2", isUser ? "justify-end" : "justify-start")}>
              {message.attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-3 py-1.5 text-xs shadow-sm"
                >
                  {a.kind === "image" && a.previewUrl ? (
                    <img src={a.previewUrl} alt="" className="size-7 rounded-xl object-cover" />
                  ) : a.kind === "image" ? (
                    <ImageIcon className="size-3.5 text-brand" />
                  ) : (
                    <FileText className="size-3.5 text-brand" />
                  )}
                  <span className="max-w-[12rem] truncate">{a.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bubble */}
          {isUser ? (
            <div className="rounded-3xl rounded-tr-md bg-gradient-to-br from-brand/90 to-brand/70 px-4 py-2.5 text-sm text-brand-foreground shadow-sm">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          ) : isError ? (
            <div className="flex items-start gap-2 rounded-2xl rounded-tl-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{message.content}</span>
            </div>
          ) : isThinking ? (
            <ThinkingDots />
          ) : (
            <div className="w-full">
              <Markdown content={message.content} />
              {message.status === "streaming" && (
                <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 rounded-full bg-brand/70 align-middle" style={{ animation: "soft-pulse 1.1s ease-in-out infinite" }} />
              )}
            </div>
          )}

          {/* Action row */}
          {!isUser && !isThinking && message.status !== "streaming" && (
            <div
              className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/message:opacity-100 data-[show=true]:opacity-100"
              data-show={isLast}
            >
              {!isError && <CopyButton value={message.content} />}
              {!isError && <VoiceButton text={message.content} />}
              {isLast && !isStreaming && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-brand"
                      onClick={onRegenerate}
                      aria-label="Regenerate response"
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Regenerate</TooltipContent>
                </Tooltip>
              )}
              {message.sources && <SourcesButton sources={message.sources} />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function VoiceButton({ text }: { text: string }) {
  const { state, toggle } = useTTS(text);
  const label =
    state === "loading" ? "Generating…" : state === "playing" ? "Pause" : "Play";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-brand"
          onClick={toggle}
          disabled={state === "loading" || state === "error"}
          aria-label={label}
        >
          {state === "loading" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : state === "playing" ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ThinkingDots() {
  return (
    <div
      className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3"
      aria-label="Assistant is thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-brand/50"
          style={{ animation: "blink 1.5s ease-in-out infinite", animationDelay: `${i * 0.22}s` }}
        />
      ))}
    </div>
  );
}
