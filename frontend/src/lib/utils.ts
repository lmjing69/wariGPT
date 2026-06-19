import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a byte count into a human-readable string. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Generate a reasonably-unique id without external deps. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/** Format a timestamp (ms) into a short local time string. */
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

import type { Attachment } from "@/types";

/** Map a filename to a coarse attachment kind for icon/handling decisions. */
export function attachmentKind(filename: string): Attachment["kind"] {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if ([".txt", ".md", ".markdown", ".csv", ".log"].includes(ext)) return "text";
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"].includes(ext))
    return "image";
  if ([".mp3", ".wav", ".m4a", ".ogg"].includes(ext)) return "audio";
  return "unknown";
}

/** Whether an attachment kind can be ingested into RAG right now. */
export function isIngestableKind(kind: Attachment["kind"]): boolean {
  return kind === "pdf" || kind === "docx" || kind === "text";
}
