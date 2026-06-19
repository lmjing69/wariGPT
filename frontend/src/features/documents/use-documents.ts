"use client";

import { useCallback } from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { UploadedDocument } from "@/types";

/** Tracks the list of uploaded documents, persisted to localStorage. */
export function useDocuments() {
  const [documents, setDocuments] = useLocalStorage<UploadedDocument[]>(
    STORAGE_KEYS.documents,
    []
  );

  const addDocument = useCallback(
    (doc: UploadedDocument) => {
      setDocuments((prev) => {
        // De-dupe by filename, keeping the most recent entry on top.
        const filtered = prev.filter((d) => d.filename !== doc.filename);
        return [doc, ...filtered];
      });
    },
    [setDocuments]
  );

  const removeDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    },
    [setDocuments]
  );

  const clearDocuments = useCallback(() => setDocuments([]), [setDocuments]);

  return { documents, addDocument, removeDocument, clearDocuments };
}
