"use client";

import { motion } from "framer-motion";
import { BookOpen, Code2, Lightbulb, MessageCircle } from "lucide-react";

const SUGGESTIONS = [
  { icon: Lightbulb,       text: "Explain quantum computing in simple terms" },
  { icon: Code2,           text: "Write a Python function to deduplicate a list" },
  { icon: BookOpen,        text: "Summarise the key ideas in my document" },
  { icon: MessageCircle,   text: "Help me brainstorm a project plan" },
];

interface GreetingProps {
  onPick: (text: string) => void;
  name?: string;
}

export function Greeting({ onPick, name }: GreetingProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-3 flex size-10 items-center justify-center rounded-xl bg-foreground text-background"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2zm0 2a8 8 0 1 0 0 16A8 8 0 0 0 12 4zm0 3a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1z"/>
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3 }}
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {name ? `Hello, ${name}` : "How can I help?"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-2 max-w-sm text-sm text-muted-foreground"
      >
        Ask me anything, or attach a document and I&apos;ll use it when relevant.
      </motion.p>

      <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, text }, i) => (
          <motion.button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 + i * 0.05, duration: 0.25 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground/80">{text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
