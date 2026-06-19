/** Mirrors the FastAPI backend response shapes. */

/** GET / */
export interface HealthResponse {
  status: string;
}

/** POST /upload (multipart/form-data, field: file) */
export interface UploadResponse {
  message: string;
  filename: string;
  doc_id: string;
  kind: string;
  path: string;
  chunks_indexed: number;
}

/** A single turn sent to /chat-stream. */
export interface ChatStreamMessage {
  role: "user" | "assistant";
  content: string;
}

/** POST /chat-stream request body. */
export interface ChatStreamRequest {
  messages: ChatStreamMessage[];
  doc_ids?: string[];
}

/** SSE events emitted by /chat-stream (each `data:` line is one of these). */
export type ChatStreamEvent =
  | { type: "token"; text: string }
  | { type: "sources"; sources: string[] }
  | { type: "followups"; items: string[] }
  | { type: "done" }
  | { type: "error"; message: string };

/** Legacy: POST /ask-pdf response (kept for reference/back-compat). */
export interface AskPdfResponse {
  answer: string;
  context: string[];
}
