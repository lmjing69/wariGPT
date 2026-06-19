"use client";

import * as React from "react";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import { toast } from "sonner";

import { cn, attachmentKind, uid } from "@/lib/utils";
import { ACCEPT_ATTR } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/features/upload/use-upload";
import type { Attachment } from "@/types";
import { FileChip } from "@/features/upload/file-chip";

interface ComposerProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  /** Controlled draft (lets greeting/follow-ups inject text). */
  value: string;
  onValueChange: (v: string) => void;
}

const MAX_HEIGHT = 220;

export function Composer({
  onSend,
  onStop,
  isStreaming,
  disabled,
  value,
  onValueChange,
}: ComposerProps) {
  const { upload, isUploading } = useUpload();
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const draftPreviewUrlsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const handleFiles = React.useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      try {
        for (const file of Array.from(files)) {
          const kind = attachmentKind(file.name);
          const placeholderId = uid("att");
          const previewUrl =
            kind === "image" ? URL.createObjectURL(file) : undefined;
          if (previewUrl) draftPreviewUrlsRef.current.add(previewUrl);
          // Show the chip immediately in a pending state.
          setAttachments((prev) => [
            ...prev,
            {
              id: placeholderId,
              name: file.name,
              kind,
              size: file.size,
              previewUrl,
            },
          ]);

          const res = await upload(file);
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === placeholderId
                ? {
                    ...a,
                    docId: res?.doc_id,
                    kind: (res?.kind as Attachment["kind"]) ?? kind,
                    deferred: !res,
                  }
                : a
            )
          );
        }
      } catch (err) {
        console.error("handleFiles error:", err);
      }
    },
    [upload]
  );

  React.useEffect(() => {
    return () => {
      for (const url of draftPreviewUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const submit = () => {
    const text = value.trim();
    if ((!text && attachments.length === 0) || disabled || isStreaming) return;
    if (!text) {
      toast.info("Add a message", {
        description: "Type a question to go with your attachment.",
      });
      return;
    }
    onSend(text, attachments);
    for (const attachment of attachments) {
      if (attachment.previewUrl) {
        draftPreviewUrlsRef.current.delete(attachment.previewUrl);
      }
    }
    onValueChange("");
    setAttachments([]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
        draftPreviewUrlsRef.current.delete(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) &&
    !disabled &&
    !isStreaming;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-3xl border border-border bg-card p-2 shadow-sm backdrop-blur transition-colors focus-within:border-foreground/20",
          dragging && "border-foreground/30 bg-muted/30"
        )}
      >
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
            {attachments.map((a) => (
              <FileChip
                key={a.id}
                attachment={a}
                onRemove={() => removeAttachment(a.id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mb-0.5 size-9 shrink-0 rounded-xl text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            aria-label="Attach file"
          >
            <Paperclip className="size-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder={
              disabled ? "The assistant is offline right now…" : "Ask me anything…"
            }
            className="max-h-[220px] flex-1 py-2.5"
            aria-label="Message"
          />

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onStop}
              className="mb-0.5 size-9 shrink-0 rounded-xl"
              aria-label="Stop generating"
            >
              <Square className="size-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="brand"
              onClick={submit}
              disabled={!canSend}
              className="mb-0.5 size-9 shrink-0 rounded-xl"
              aria-label="Send message"
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p className="mt-2 text-center text-[0.68rem] text-muted-foreground/70">
        WariGPT can make mistakes — double-check anything important.
      </p>
    </div>
  );
}

// Re-export icon used elsewhere if needed.
export { X };
