export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export const STORAGE_KEYS = {
  conversations: "warigpt:conversations:v2",
  activeConversation: "warigpt:active-conversation:v2",
  documents: "warigpt:documents:v2",
  profile: "warigpt:profile",
} as const;

/** Request timeout in milliseconds for upload calls. */
export const REQUEST_TIMEOUT_MS = 120_000;

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

/** Extensions the backend can ingest as text right now. */
export const INGESTABLE_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

/** Extensions accepted by the attachment UI (images/audio are deferred). */
export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
];

export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");
