"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, PenSquare, Sparkles, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/features/chat/chat-view";
import { SettingsDialog } from "@/features/settings/settings-dialog";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { useConversations } from "@/features/conversations/conversation-store";
import { useDocuments } from "@/features/documents/use-documents";

export function AppShell() {
  const { status } = useBackendStatus();
  const { newChat, clearAll } = useConversations();
  const { clearDocuments } = useDocuments();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden w-72 shrink-0 border-r border-border md:block">
        <Sidebar
          backendStatus={status}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-[17rem] shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <Sidebar
                backendStatus={status}
                onOpenSettings={() => {
                  setSettingsOpen(true);
                  setSidebarOpen(false);
                }}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border px-2 py-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/70 text-brand-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-semibold">WariGPT</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => newChat()}
            aria-label="New chat"
          >
            <PenSquare className="size-5" />
          </Button>
        </header>

        {/* Offline banner */}
        <AnimatePresence>
          {status === "offline" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-destructive/30 bg-destructive/10"
            >
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-destructive">
                <WifiOff className="size-4 shrink-0" />
                <span>Can&apos;t reach the assistant. Please try again later.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-h-0 flex-1">
          <ChatView backendStatus={status} />
        </main>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        backendStatus={status}
        onClearConversations={() => {
          clearAll();
          setSettingsOpen(false);
        }}
        onClearDocuments={() => {
          clearDocuments();
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}
