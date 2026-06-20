"use client";

import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/features/conversations/conversation-store";
import { useChatStream } from "./use-chat-stream";
import { Message } from "./message";
import { Composer } from "./composer";
import { Greeting } from "./greeting";
import { FollowUpChips } from "./follow-up-chips";
import type { Attachment } from "@/types";

interface ChatViewProps {}

export function ChatView({}: ChatViewProps) {
  const { activeConversation } = useConversations();
  const { send, regenerate, stop, isStreaming } = useChatStream();
  const [draft, setDraft] = React.useState("");

  const viewportRef = React.useRef<HTMLDivElement>(null);
  const stickToBottom = React.useRef(true);

  const messages = activeConversation?.messages ?? [];

  // Track whether the user is near the bottom; only auto-scroll if so.
  const onScroll = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < 120;
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = React.useCallback(
    (text: string, attachments: Attachment[]) => {
      stickToBottom.current = true;
      void send(text, attachments);
    },
    [send]
  );

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const showFollowups =
    !isStreaming &&
    lastAssistant?.status === "complete" &&
    (lastAssistant.followups?.length ?? 0) > 0;

  return (
    <div className="flex h-full flex-col">
      <ScrollArea
        className="flex-1"
        viewportRef={viewportRef}
        onViewportScroll={onScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full min-h-[calc(100dvh-13rem)]">
            <Greeting onPick={(t) => setDraft(t)} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8">
            {messages.map((m, i) => (
              <Message
                key={m.id}
                message={m}
                isLast={i === messages.length - 1}
                isStreaming={isStreaming}
                onRegenerate={regenerate}
              />
            ))}

            {showFollowups && lastAssistant?.followups && (
              <FollowUpChips
                items={lastAssistant.followups}
                onPick={(t) => handleSend(t, [])}
                disabled={isStreaming}
              />
            )}
          </div>
        )}
      </ScrollArea>

      <div className="px-4 pb-4 pt-2">
        <Composer
          value={draft}
          onValueChange={setDraft}
          onSend={handleSend}
          onStop={stop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
