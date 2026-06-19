/** Roles a chat message can take. `system`/`tool` are reserved for future agents. */
export type MessageRole = "user" | "assistant" | "system" | "tool";

/** Delivery status used to drive UI states (streaming, error, etc.). */
export type MessageStatus = "streaming" | "complete" | "error";

/** A file attached to a message (ChatGPT-style attachments). */
export interface Attachment {
  id: string;
  name: string;
  kind: "pdf" | "docx" | "text" | "image" | "audio" | "unknown";
  size?: number;
  /** Server-side doc id once indexed (text docs only). */
  docId?: string;
  /** True when the backend can't analyze it yet (images/audio). */
  deferred?: boolean;
  /** Browser-local preview URL for visual attachments. */
  previewUrl?: string;
}

/** Reserved shape for future tool/function calling. */
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

/** A single chat message. */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** Retrieved context — hidden by default, revealed via the Sources button. */
  sources?: string[];
  /** Suggested follow-up prompts shown as chips under the last assistant msg. */
  followups?: string[];
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  status?: MessageStatus;
  createdAt: number;
}

/** A full conversation thread. */
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** An uploaded document tracked client-side. */
export interface UploadedDocument {
  id: string;
  filename: string;
  docId?: string;
  kind?: string;
  size?: number;
  uploadedAt: number;
}

/** Backend connectivity status. */
export type BackendStatus = "online" | "offline" | "checking";
