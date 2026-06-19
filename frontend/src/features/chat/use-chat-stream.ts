"use client";

import * as React from "react";

import { streamChat } from "@/services/chat-stream";
import { uid } from "@/lib/utils";
import { useConversations } from "@/features/conversations/conversation-store";
import type { Attachment, ChatMessage } from "@/types";
import type { ChatStreamMessage } from "@/types/api";

/** Build the wire history (user/assistant text only) from stored messages. */
function toWireMessages(messages: ChatMessage[]): ChatStreamMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

export function useChatStream() {
  const {
    activeConversation,
    ensureActive,
    appendMessage,
    updateMessage,
    removeMessagesFrom,
    conversations,
  } = useConversations();

  const [isStreaming, setIsStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const runStream = React.useCallback(
    async (
      conversationId: string,
      history: ChatMessage[],
      docIds: string[]
    ) => {
      const assistantId = uid("asst");
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
        createdAt: Date.now(),
      };
      appendMessage(conversationId, assistantMsg);

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      let acc = "";
      await streamChat(
        { messages: toWireMessages(history), doc_ids: docIds.length ? docIds : undefined },
        {
          signal: controller.signal,
          onToken: (text) => {
            acc += text;
            updateMessage(conversationId, assistantId, {
              content: acc,
              status: "streaming",
            });
          },
          onSources: (sources) => {
            updateMessage(conversationId, assistantId, { sources });
          },
          onFollowups: (items) => {
            updateMessage(conversationId, assistantId, { followups: items });
          },
          onError: (message) => {
            updateMessage(conversationId, assistantId, {
              content: acc || message,
              status: "error",
            });
          },
          onDone: () => {
            updateMessage(conversationId, assistantId, {
              content: acc,
              status: "complete",
            });
          },
        }
      );

      setIsStreaming(false);
      abortRef.current = null;
    },
    [appendMessage, updateMessage]
  );

  /** Send a new user message (optionally with attachments) and stream a reply. */
  const send = React.useCallback(
    async (content: string, attachments: Attachment[] = []) => {
      const text = content.trim();
      if (!text || isStreaming) return;

      const conversationId = ensureActive();
      // Read the freshest message list for this conversation.
      const current =
        conversations.find((c) => c.id === conversationId)?.messages ?? [];

      const userMsg: ChatMessage = {
        id: uid("user"),
        role: "user",
        content: text,
        attachments: attachments.length ? attachments : undefined,
        status: "complete",
        createdAt: Date.now(),
      };
      appendMessage(conversationId, userMsg);

      const docIds = collectDocIds(current, attachments);
      try {
        await runStream(conversationId, [...current, userMsg], docIds);
      } catch (err) {
        console.error("Stream error:", err);
      }
    },
    [appendMessage, conversations, ensureActive, isStreaming, runStream]
  );

  /** Regenerate the reply to the last user message. */
  const regenerate = React.useCallback(async () => {
    if (isStreaming || !activeConversation) return;
    const msgs = activeConversation.messages;

    // Find the last assistant message and truncate it, keeping the user turn.
    const lastAssistantIdx = [...msgs]
      .reverse()
      .findIndex((m) => m.role === "assistant");
    if (lastAssistantIdx === -1) return;
    const realIdx = msgs.length - 1 - lastAssistantIdx;
    const assistantMsg = msgs[realIdx];

    removeMessagesFrom(activeConversation.id, assistantMsg.id);
    const history = msgs.slice(0, realIdx);
    const docIds = collectDocIds(history, []);
    try {
      await runStream(activeConversation.id, history, docIds);
    } catch (err) {
      console.error("Stream error in regenerate:", err);
    }
  }, [activeConversation, isStreaming, removeMessagesFrom, runStream]);

  /** Stop an in-progress generation. */
  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    if (activeConversation) {
      const streamingMsg = activeConversation.messages.find(
        (m) => m.status === "streaming"
      );
      if (streamingMsg) {
        updateMessage(activeConversation.id, streamingMsg.id, {
          status: "complete",
        });
      }
    }
  }, [activeConversation, updateMessage]);

  return { send, regenerate, stop, isStreaming };
}

/** Gather doc ids from message attachments (scopes retrieval when present). */
function collectDocIds(
  messages: ChatMessage[],
  attachments: Attachment[]
): string[] {
  const ids = new Set<string>();
  for (const m of messages) {
    for (const a of m.attachments ?? []) {
      if (a.docId) ids.add(a.docId);
    }
  }
  for (const a of attachments) {
    if (a.docId) ids.add(a.docId);
  }
  return [...ids];
}
