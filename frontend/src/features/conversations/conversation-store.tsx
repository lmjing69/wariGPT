"use client";

import * as React from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import { uid } from "@/lib/utils";
import type { ChatMessage, Conversation } from "@/types";

interface ConversationState {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  hydrated: boolean;

  newChat: () => string;
  selectChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  clearAll: () => void;

  /** Ensure a conversation exists to write into; returns its id. */
  ensureActive: () => string;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<ChatMessage>
  ) => void;
  removeMessagesFrom: (conversationId: string, messageId: string) => void;
}

const ConversationContext = React.createContext<ConversationState | null>(null);

function titleFromMessage(content: string): string {
  const clean = content.trim().replace(/\s+/g, " ");
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean || "New chat";
}

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage on mount.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.conversations);
      const parsed: Conversation[] = raw ? JSON.parse(raw) : [];
      const active = window.localStorage.getItem(
        STORAGE_KEYS.activeConversation
      );
      setConversations(parsed);
      setActiveId(active && parsed.some((c) => c.id === active) ? active : null);
    } catch {
      /* ignore corrupt storage */
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist conversations.
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.conversations,
        JSON.stringify(conversations)
      );
    } catch {
      /* storage full / unavailable */
    }
  }, [conversations, hydrated]);

  // Persist active id.
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      if (activeId) {
        window.localStorage.setItem(STORAGE_KEYS.activeConversation, activeId);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.activeConversation);
      }
    } catch {
      /* ignore */
    }
  }, [activeId, hydrated]);

  const newChat = React.useCallback(() => {
    // Reuse an existing empty conversation rather than creating a duplicate.
    setConversations((prev) => {
      const empty = prev.find((c) => c.messages.length === 0);
      if (empty) {
        setActiveId(empty.id);
        return prev;
      }
      const id = uid("conv");
      const now = Date.now();
      const conversation: Conversation = {
        id,
        title: "New chat",
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      setActiveId(id);
      return [conversation, ...prev];
    });
    // Return value is best-effort; callers rarely use it.
    return "";
  }, []);

  const ensureActive = React.useCallback((): string => {
    if (activeId && conversations.some((c) => c.id === activeId)) {
      return activeId;
    }
    return newChat();
  }, [activeId, conversations, newChat]);

  const selectChat = React.useCallback((id: string) => setActiveId(id), []);

  const renameChat = React.useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: title.trim() || c.title } : c
      )
    );
  }, []);

  const deleteChat = React.useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setActiveId((curr) => (curr === id ? null : curr));
    },
    []
  );

  const clearAll = React.useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, []);

  const appendMessage = React.useCallback(
    (conversationId: string, message: ChatMessage) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const isFirstUser =
            message.role === "user" &&
            c.messages.filter((m) => m.role === "user").length === 0;
          return {
            ...c,
            title: isFirstUser ? titleFromMessage(message.content) : c.title,
            messages: [...c.messages, message],
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  const updateMessage = React.useCallback(
    (
      conversationId: string,
      messageId: string,
      patch: Partial<ChatMessage>
    ) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== conversationId
            ? c
            : {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, ...patch } : m
                ),
                updatedAt: Date.now(),
              }
        )
      );
    },
    []
  );

  const removeMessagesFrom = React.useCallback(
    (conversationId: string, messageId: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const idx = c.messages.findIndex((m) => m.id === messageId);
          if (idx === -1) return c;
          return { ...c, messages: c.messages.slice(0, idx) };
        })
      );
    },
    []
  );

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

  const value: ConversationState = {
    conversations,
    activeId,
    activeConversation,
    hydrated,
    newChat,
    selectChat,
    renameChat,
    deleteChat,
    clearAll,
    ensureActive,
    appendMessage,
    updateMessage,
    removeMessagesFrom,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations(): ConversationState {
  const ctx = React.useContext(ConversationContext);
  if (!ctx) {
    throw new Error(
      "useConversations must be used within a ConversationProvider"
    );
  }
  return ctx;
}
