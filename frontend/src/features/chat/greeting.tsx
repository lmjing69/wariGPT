"use client";

import { motion } from "framer-motion";
import { BookOpen, Code2, Lightbulb, MessageCircle } from "lucide-react";

const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain quantum computing in simple terms", color: "text-amber-500" },
  { icon: Code2,     text: "Write a Python function to deduplicate a list", color: "text-sky-500" },
  { icon: BookOpen,  text: "Summarise the key ideas in my document", color: "text-violet-500" },
  { icon: MessageCircle, text: "Help me brainstorm a project plan", color: "text-rose-400" },
];

interface GreetingProps {
  onPick: (text: string) => void;
  name?: string;
}

/** Centered welcome shown for an empty conversation. */
export function Greeting({ onPick, name }: GreetingProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      {/* Soft glowing logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/80 to-brand/40 text-brand-foreground shadow-[0_4px_24px_0_oklch(0.6_0.16_280/0.25)]"
      >
        {/* Friendly waving emoji instead of cold icon */}
        <span className="text-2xl" aria-hidden>✨</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {name ? `Hey, ${name} 👋` : "Hey there! 👋"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.35 }}
        className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground"
      >
        I&apos;m here to help — ask me anything, or drop in a document and I&apos;ll use it when it&apos;s useful.
      </motion.p>

      <div className="mt-9 grid w-full gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, text, color }, i) => (
          <motion.button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.06, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left text-sm shadow-sm transition-shadow hover:shadow-md hover:border-brand/30 hover:bg-accent/60"
          >
            <span className={`shrink-0 rounded-xl bg-muted p-2 ${color}`}>
              <Icon className="size-4" />
            </span>
            <span className="text-foreground/85 leading-snug">{text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
