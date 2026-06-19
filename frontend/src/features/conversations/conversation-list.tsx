"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageSquare, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConversations } from "./conversation-store";

function groupLabel(updatedAt: number): string {
  const now = new Date();
  const d = new Date(updatedAt);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const dayMs = 86_400_000;
  if (updatedAt >= startOfToday) return "Today";
  if (updatedAt >= startOfToday - dayMs) return "Yesterday";
  if (updatedAt >= startOfToday - 7 * dayMs) return "Previous 7 days";
  void d;
  return "Older";
}

export function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const {
    conversations,
    activeId,
    selectChat,
    renameChat,
    deleteChat,
  } = useConversations();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  if (conversations.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        No conversations yet. Start a new chat to begin.
      </p>
    );
  }

  // Preserve order (already newest-first) but bucket by group label.
  const groups: { label: string; items: typeof conversations }[] = [];
  for (const conv of conversations) {
    const label = groupLabel(conv.updatedAt);
    const bucket = groups.find((g) => g.label === label);
    if (bucket) bucket.items.push(conv);
    else groups.push({ label, items: [conv] });
  }

  const commitRename = (id: string) => {
    renameChat(id, editValue);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            <AnimatePresence initial={false}>
              {group.items.map((conv) => {
                const isActive = conv.id === activeId;
                const isEditing = editingId === conv.id;
                return (
                  <motion.li
                    key={conv.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      isActive ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    {isEditing ? (
                      <div className="flex flex-1 items-center gap-1">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename(conv.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-sm outline-none focus:border-brand"
                        />
                        <button
                          onClick={() => commitRename(conv.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Save"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Cancel"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            selectChat(conv.id);
                            onNavigate?.();
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{conv.title}</span>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                              aria-label="Conversation options"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingId(conv.id);
                                setEditValue(conv.title);
                              }}
                            >
                              <Pencil className="size-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              destructive
                              onClick={() => deleteChat(conv.id)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      ))}
    </div>
  );
}
