"use client";

import { motion } from "framer-motion";

interface FollowUpChipsProps {
  items: string[];
  onPick: (text: string) => void;
  disabled?: boolean;
}

export function FollowUpChips({ items, onPick, disabled }: FollowUpChipsProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2 pl-10">
      {items.map((text, i) => (
        <motion.button
          key={`${text}-${i}`}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.2 }}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
        >
          {text}
        </motion.button>
      ))}
    </div>
  );
}
