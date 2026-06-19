"use client";

import { motion } from "framer-motion";
import {
  Code2,
  FileText,
  GraduationCap,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain quantum computing in simple terms" },
  { icon: Code2, text: "Write a Python function to deduplicate a list" },
  { icon: FileText, text: "Summarize the key ideas in my document" },
  { icon: GraduationCap, text: "Help me brainstorm a project plan" },
];

interface GreetingProps {
  onPick: (text: string) => void;
  name?: string;
}

/** Centered welcome shown for an empty conversation. */
export function Greeting({ onPick, name }: GreetingProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand/60 text-brand-foreground shadow-lg"
      >
        <Sparkles className="size-7" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {name ? `Hello, ${name}` : "How can I help today?"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-2 max-w-md text-sm text-muted-foreground"
      >
        Ask me anything, or attach a document and I&apos;ll use it when it helps.
      </motion.p>

      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, text }, i) => (
          <motion.button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.25 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-left text-sm backdrop-blur transition-colors hover:border-brand/40 hover:bg-accent"
          >
            <Icon className="size-4 shrink-0 text-brand" />
            <span className="text-foreground/80">{text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
