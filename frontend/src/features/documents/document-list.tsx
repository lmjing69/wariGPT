"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Trash2 } from "lucide-react";

import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UploadedDocument } from "@/types";

interface DocumentListProps {
  documents: UploadedDocument[];
  onRemove: (id: string) => void;
}

export function DocumentList({ documents, onRemove }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="px-1 py-3 text-xs text-muted-foreground">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      <AnimatePresence initial={false}>
        {documents.map((doc) => (
          <motion.li
            key={doc.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="group flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-2"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" title={doc.filename}>
                {doc.filename}
              </p>
              {doc.size ? (
                <p className="text-[0.65rem] text-muted-foreground">
                  {formatBytes(doc.size)}
                </p>
              ) : null}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  onClick={() => onRemove(doc.id)}
                  aria-label={`Remove ${doc.filename}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove from list</TooltipContent>
            </Tooltip>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
