"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileUp, Loader2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUpload } from "./use-upload";

/** Drag-and-drop + click-to-browse PDF upload zone with progress. */
export function UploadDropzone() {
  const { upload, isUploading, progress } = useUpload();
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      // Upload sequentially to keep progress meaningful.
      Array.from(files).forEach((file) => {
        void upload(file);
      });
    },
    [upload]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (isUploading) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={isUploading}
        className={cn(
          "relative flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center transition-colors",
          dragging && "border-brand bg-brand/10",
          isUploading && "cursor-not-allowed opacity-80",
          !isUploading && "hover:border-brand/50 hover:bg-accent"
        )}
        aria-label="Upload PDF"
      >
        {isUploading ? (
          <Loader2 className="size-6 animate-spin text-brand" />
        ) : (
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full bg-brand/15 text-brand transition-transform",
              dragging && "scale-110"
            )}
          >
            {dragging ? (
              <FileUp className="size-5" />
            ) : (
              <UploadCloud className="size-5" />
            )}
          </div>
        )}

        <div className="text-xs">
          {isUploading ? (
            <span className="font-medium text-foreground">
              Uploading… {progress}%
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground">
                Drop a PDF here
              </span>
              <span className="text-muted-foreground"> or click to browse</span>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </button>

      {/* Progress bar */}
      {isUploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>
      )}
    </div>
  );
}
