"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle, FileText, Image as ImageIcon,
  Loader2, Pause, Play, RefreshCw, User,
} from "lucide-react";
import { useTTS } from "@/hooks/use-tts";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatMessage } from "@/types";
import { Markdown } from "./markdown";
import { SourcesButton } from "@/features/citations/sources-button";

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate: () => void;
}

export function Message({ message, isLast, isStreaming, onRegenerate }: MessageProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isThinking = message.status === "streaming" && message.content.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group/message w-full"
    >
      <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn(
          "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-foreground text-background"
        )}>
          {isUser ? <User className="size-3.5" /> : <span className="text-[10px] font-bold">W</span>}
        </div>

        {/* Body */}
        <div className={cn(
          "flex min-w-0 flex-col max-w-[min(100%,46rem)] flex-1",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn("mb-2 flex flex-wrap gap-2", isUser ? "justify-end" : "justify-start")}>
              {message.attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
                  {a.kind === "image" && a.previewUrl
                    ? <img src={a.previewUrl} alt="" className="size-7 rounded object-cover" />
                    : a.kind === "image"
                    ? <ImageIcon className="size-3.5 text-muted-foreground" />
                    : <FileText className="size-3.5 text-muted-foreground" />}
                  <span className="max-w-[12rem] truncate">{a.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bubble */}
          {isUser ? (
            <div className="rounded-2xl rounded-tr-sm bg-secondary px-4 py-2.5 text-sm">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          ) : isError ? (
            <div className="flex items-start gap-2 rounded-2xl rounded-tl-sm border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{message.content}</span>
            </div>
          ) : isThinking ? (
            <ThinkingDots />
          ) : (
            <div className="w-full">
              <Markdown content={message.content} />
              {message.status === "streaming" && (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-foreground/50 align-middle" />
              )}
            </div>
          )}

          {/* Actions */}
          {!isUser && !isThinking && message.status !== "streaming" && (
            <div
              className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover/message:opacity-100 data-[show=true]:opacity-100"
              data-show={isLast}
            >
              {!isError && <CopyButton value={message.content} />}
              {!isError && <VoiceButton text={message.content} />}
              {isLast && !isStreaming && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={onRegenerate} aria-label="Regenerate">
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
  const label = state === "loading" ? "Generating…" : state === "playing" ? "Pause" : "Play";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={toggle} disabled={state === "loading" || state === "error"} aria-label={label}>
          {state === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : state === "playing" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 rounded-full bg-muted-foreground/50"
          style={{ animation: "blink 1.4s infinite both", animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}
