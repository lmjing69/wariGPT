import type { ChatStreamEvent, ChatStreamRequest } from "@/types/api";

export interface StreamHandlers {
  onToken?: (text: string) => void;
  onSources?: (sources: string[]) => void;
  onFollowups?: (items: string[]) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
  signal?: AbortSignal;
}

/**
 * POST /chat-stream and parse the Server-Sent Events response.
 *
 * Uses fetch + ReadableStream (not EventSource, which can't POST). Abortable
 * via `signal` for stop-generation and regeneration.
 */
export async function streamChat(
  req: ChatStreamRequest,
  handlers: StreamHandlers
): Promise<void> {
  const { onToken, onSources, onFollowups, onDone, onError, signal } = handlers;

  let response: Response;
  try {
    response = await fetch(`/api/chat-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    onError?.(
      "Could not reach the assistant. Make sure the backend is running."
    );
    return;
  }

  if (!response.ok || !response.body) {
    onError?.(`The server returned an error (${response.status}).`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleEvent = (event: ChatStreamEvent) => {
    switch (event.type) {
      case "token":
        onToken?.(event.text);
        break;
      case "sources":
        onSources?.(event.sources);
        break;
      case "followups":
        onFollowups?.(event.items);
        break;
      case "error":
        onError?.(event.message);
        break;
      case "done":
        onDone?.();
        break;
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame
          .split("\n")
          .find((l) => l.startsWith("data:"));
        if (!line) continue;
        const json = line.slice(5).trim();
        if (!json) continue;
        try {
          handleEvent(JSON.parse(json) as ChatStreamEvent);
        } catch {
          // Ignore malformed frames.
        }
      }
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    onError?.("The connection was interrupted.");
  }
}
