"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { uploadFile } from "@/services/api";
import { ApiError } from "@/services/http";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { attachmentKind, formatBytes, isIngestableKind, uid } from "@/lib/utils";
import { useDocuments } from "@/features/documents/use-documents";
import type { UploadResponse } from "@/types/api";

function validate(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large (max ${formatBytes(MAX_UPLOAD_BYTES, 0)}).`;
  }
  return null;
}

/** Handles validation, progress, and indexing for a single file. */
export function useUpload() {
  const { addDocument } = useDocuments();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, setProgress),
  });

  /** Upload a file; returns the indexed doc info or null on failure/deferral. */
  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      const validationError = validate(file);
      if (validationError) {
        toast.error("Upload failed", { description: validationError });
        return null;
      }

      const kind = attachmentKind(file.name);
      if (!isIngestableKind(kind)) {
        return null;
      }

      setProgress(0);
      const toastId = toast.loading(`Uploading ${file.name}…`);

      try {
        const res = await mutation.mutateAsync(file);
        addDocument({
          id: uid("doc"),
          filename: res.filename ?? file.name,
          docId: res.doc_id,
          kind: res.kind,
          size: file.size,
          uploadedAt: Date.now(),
        });
        toast.success("Ready", {
          id: toastId,
          description: `${res.filename ?? file.name} is ready to reference.`,
        });
        return res;
      } catch (error) {
        const description =
          error instanceof ApiError
            ? error.message
            : "Could not upload the file.";
        toast.error("Upload failed", { id: toastId, description });
        return null;
      } finally {
        setProgress(0);
      }
    },
    [addDocument, mutation]
  );

  return { upload, isUploading: mutation.isPending, progress };
}
