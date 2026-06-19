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
import { API_BASE_URL } from "@/lib/constants";

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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
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
        <header className="flex items-center justify-between border-b border-border/60 bg-card/70 px-2 py-2 backdrop-blur md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-xl bg-gradient-to-br from-brand/80 to-brand/40 text-brand-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="font-semibold tracking-tight">WariGPT</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl"
            onClick={() => newChat()}
            aria-label="New chat"
          >
            <PenSquare className="size-4.5" />
          </Button>
        </header>

        {/* Offline banner — soft amber instead of harsh red */}
        <AnimatePresence>
          {status === "offline" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-amber-200/60 bg-amber-50/80 dark:border-amber-700/30 dark:bg-amber-900/20"
            >
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">
                <WifiOff className="size-4 shrink-0" />
                <span>
                  Can&apos;t reach the assistant at{" "}
                  <span className="font-mono">{API_BASE_URL}</span>.{" "}
                  Make sure the backend is running.
                </span>
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
