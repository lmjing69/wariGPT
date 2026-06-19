"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTTS } from "@/services/tts";

type State = "idle" | "loading" | "playing" | "paused" | "error";

// Module-level singleton so only one audio plays at a time across all messages
let activeStop: (() => void) | null = null;

// Module-level cache: text → object URL
const audioCache = new Map<string, string>();

export function useTTS(text: string) {
  const [state, setState] = useState<State>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState("idle");
    if (activeStop === stop) activeStop = null;
  }, []);

  // Clean up on unmount
  useEffect(() => () => { stop(); }, [stop]);

  const play = useCallback(async () => {
    // Stop whatever else is playing
    if (activeStop && activeStop !== stop) activeStop();
    activeStop = stop;

    // Resume if paused
    if (state === "paused" && audioRef.current) {
      audioRef.current.play();
      setState("playing");
      return;
    }

    setState("loading");

    try {
      let url = audioCache.get(text);

      if (!url) {
        const buffer = await fetchTTS(text);
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        url = URL.createObjectURL(blob);
        audioCache.set(text, url);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setState("idle");
      audio.onerror = () => setState("error");
      audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }, [text, state, stop]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState("paused");
  }, []);

  const toggle = useCallback(() => {
    if (state === "playing") pause();
    else play();
  }, [state, play, pause]);

  return { state, toggle, stop };
}
