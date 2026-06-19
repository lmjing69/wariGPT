"use client";

import * as React from "react";
import {
  ChevronDown,
  FileText,
  PanelLeftClose,
  Plus,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { ConversationList } from "@/features/conversations/conversation-list";
import { DocumentList } from "@/features/documents/document-list";
import { useConversations } from "@/features/conversations/conversation-store";
import { useDocuments } from "@/features/documents/use-documents";
import type { BackendStatus } from "@/types";

interface SidebarProps {
  backendStatus: BackendStatus;
  onOpenSettings: () => void;
  onClose?: () => void;
}

export function Sidebar({
  backendStatus,
  onOpenSettings,
  onClose,
}: SidebarProps) {
  const { newChat } = useConversations();
  const { documents, removeDocument } = useDocuments();
  const [filesOpen, setFilesOpen] = React.useState(true);

  return (
    <aside className="flex h-full w-full flex-col bg-card/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand/70 text-brand-foreground shadow-sm">
            <Sparkles className="size-4.5" />
          </div>
          <span className="text-[0.95rem] font-semibold tracking-tight">
            WariGPT
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {/* New chat */}
      <div className="px-3 pb-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 rounded-xl border-border bg-background/50"
          onClick={() => {
            newChat();
            onClose?.();
          }}
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      {/* Scrollable middle */}
      <ScrollArea className="flex-1 px-3">
        <div className="py-2">
          <ConversationList onNavigate={onClose} />
        </div>
      </ScrollArea>

      {/* Files section */}
      <div className="px-3">
        <Separator className="mb-2" />
        <button
          onClick={() => setFilesOpen((o) => !o)}
          className="mb-1 flex w-full items-center justify-between px-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            Files {documents.length > 0 && `(${documents.length})`}
          </span>
          <ChevronDown
            className={`size-3.5 transition-transform ${filesOpen ? "" : "-rotate-90"}`}
          />
        </button>
        {filesOpen && (
          <div className="max-h-44 overflow-y-auto pb-2">
            <DocumentList documents={documents} onRemove={removeDocument} />
          </div>
        )}
      </div>

      {/* Footer: profile + status */}
      <div className="px-3 py-3">
        <Separator className="mb-2" />
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-1 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-accent">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-brand/20 text-brand">
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">You</p>
                  <p className="truncate text-[0.7rem] text-muted-foreground">
                    Local workspace
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Signed in locally</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </div>
        <div className="mt-2 flex justify-center">
          <StatusBadge status={backendStatus} />
        </div>
      </div>
    </aside>
  );
}
