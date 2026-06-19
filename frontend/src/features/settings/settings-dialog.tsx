"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import type { BackendStatus } from "@/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backendStatus: BackendStatus;
  onClearConversations: () => void;
  onClearDocuments: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  backendStatus,
  onClearConversations,
  onClearDocuments,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Preferences are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Appearance</p>
            <p className="text-xs text-muted-foreground">
              Choose light or dark mode.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {([
              ["dark", Moon],
              ["light", Sun],
            ] as const).map(([value, Icon]) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs capitalize transition-colors",
                  theme === value
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {value}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Connection */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium">AI Service</p>
            <p className="text-xs text-muted-foreground">
              Connection status
            </p>
          </div>
          <StatusBadge status={backendStatus} />
        </div>

        <Separator />

        {/* Data */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Data</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onClearConversations}
            >
              Clear all conversations
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onClearDocuments}
            >
              Clear document list
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
