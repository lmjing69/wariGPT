"use client";

import { cn } from "@/lib/utils";
import type { BackendStatus } from "@/types";

const CONFIG: Record<
  BackendStatus,
  { label: string; dot: string; text: string }
> = {
  online: {
    label: "Connected",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
  },
  offline: {
    label: "Offline",
    dot: "bg-destructive",
    text: "text-destructive",
  },
  checking: {
    label: "Connecting…",
    dot: "bg-amber-500",
    text: "text-amber-500",
  },
};

export function StatusBadge({ status }: { status: BackendStatus }) {
  const cfg = CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[0.7rem] font-medium">
      <span className="relative flex size-2">
        {status === "checking" && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              cfg.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex size-2 rounded-full", cfg.dot)} />
      </span>
      <span className={cfg.text}>{cfg.label}</span>
    </span>
  );
}
