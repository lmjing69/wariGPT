"use client";

import { FileText, Image as ImageIcon, Loader2, Music, X } from "lucide-react";

import { cn, formatBytes } from "@/lib/utils";
import type { Attachment } from "@/types";

function iconFor(kind: Attachment["kind"]) {
  if (kind === "image") return ImageIcon;
  if (kind === "audio") return Music;
  return FileText;
}

interface FileChipProps {
  attachment: Attachment;
  onRemove?: () => void;
  pending?: boolean;
}

/** Compact attachment chip shown in the composer. */
export function FileChip({ attachment, onRemove, pending }: FileChipProps) {
  const Icon = iconFor(attachment.kind);
  const isPending = pending ?? (!attachment.docId && !attachment.deferred);
  const hasImagePreview = attachment.kind === "image" && attachment.previewUrl;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 py-1.5 pl-2.5 pr-1.5 text-xs">
      <div className="relative size-8 overflow-hidden rounded-lg">
        {hasImagePreview ? (
          <img
            src={attachment.previewUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center",
              attachment.deferred
                ? "bg-muted text-muted-foreground"
                : "bg-brand/15 text-brand"
            )}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Icon className="size-3.5" />
            )}
          </div>
        )}
        {hasImagePreview && isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/45">
            <Loader2 className="size-3.5 animate-spin text-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="max-w-[10rem] truncate font-medium">{attachment.name}</p>
        <p className="text-[0.65rem] text-muted-foreground">
          {attachment.deferred
            ? "Not analyzed yet"
            : attachment.size
            ? formatBytes(attachment.size)
            : "Ready"}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
