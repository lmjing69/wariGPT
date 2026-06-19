"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface FollowUpChipsProps {
  items: string[];
  onPick: (text: string) => void;
  disabled?: boolean;
}

/** Clickable suggested follow-up prompts shown under the last assistant reply. */
export function FollowUpChips({ items, onPick, disabled }: FollowUpChipsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2 pl-11">
      {items.map((text, i) => (
        <motion.button
          key={`${text}-${i}`}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.22 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1.5 text-xs text-brand transition-colors hover:bg-brand/12 hover:border-brand/40 disabled:opacity-50"
        >
          <Sparkles className="size-3 opacity-70" />
          {text}
        </motion.button>
      ))}
    </div>
  );
}
