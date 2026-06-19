"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface FollowUpChipsProps {
  items: string[];
  onPick: (text: string) => void;
  disabled?: boolean;
}

/** Clickable suggested follow-up prompts shown under the last assistant reply. */
export function FollowUpChips({ items, onPick, disabled }: FollowUpChipsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 pl-12">
      {items.map((text, i) => (
        <motion.button
          key={`${text}-${i}`}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.2 }}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-brand/50 hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          {text}
          <ArrowUpRight className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </motion.button>
      ))}
    </div>
  );
}
