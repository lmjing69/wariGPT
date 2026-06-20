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
import { ConversationList } from "@/features/conversations/conversation-list";
import { DocumentList } from "@/features/documents/document-list";
import { useConversations } from "@/features/conversations/conversation-store";
import { useDocuments } from "@/features/documents/use-documents";

interface SidebarProps {
  onOpenSettings: () => void;
  onClose?: () => void;
}

export function Sidebar({ onOpenSettings, onClose }: SidebarProps) {
  const { newChat } = useConversations();
  const { documents, removeDocument } = useDocuments();
  const [filesOpen, setFilesOpen] = React.useState(true);

  return (
    <aside className="flex h-full w-full flex-col bg-card/60 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
            <Sparkles className="size-4" />
          </div>
          <span className="text-[0.95rem] font-semibold tracking-tight">WariGPT</span>
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
      <div className="px-3 pb-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 rounded-xl border-border bg-background/50"
          onClick={() => { newChat(); onClose?.(); }}
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      {/* Scrollable history */}
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
          className="mb-1.5 flex w-full items-center justify-between rounded-lg px-1.5 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
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
        <Separator className="mb-3" />
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-1 items-center gap-2.5 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-accent">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">You</p>
                  <p className="truncate text-[0.68rem] text-muted-foreground">Local workspace</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl">
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
      </div>
    </aside>
  );
}
