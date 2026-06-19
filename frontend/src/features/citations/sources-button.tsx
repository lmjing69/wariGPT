"use client";

import * as React from "react";
import { BookText, FileText } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SourcesButtonProps {
  sources: string[];
}

/**
 * The ONLY surface where retrieved context appears. Hidden behind an explicit
 * "Sources" button so the assistant never feels like a document query box.
 */
export function SourcesButton({ sources }: SourcesButtonProps) {
  const [open, setOpen] = React.useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <BookText className="size-3.5" />
        Sources
        <span className="rounded-full bg-muted px-1.5 text-[0.65rem]">
          {sources.length}
        </span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookText className="size-4 text-brand" />
              Sources
            </SheetTitle>
            <SheetDescription>
              Passages from your documents that informed this answer.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-3 p-5">
              {sources.map((chunk, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-background/60 p-4"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FileText className="size-3.5" />
                    Excerpt {i + 1}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                    {chunk}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
