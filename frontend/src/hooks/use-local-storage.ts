"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A typed localStorage-backed state hook that is SSR-safe and syncs across tabs.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage on mount (client only).
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStored(JSON.parse(item) as T);
      }
    } catch {
      // Ignore parse/access errors and keep the initial value.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next =
          typeof value === "function"
            ? (value as (p: T) => T)(prev)
            : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage may be full or unavailable; fail silently.
        }
        return next;
      });
    },
    [key]
  );

  // Keep state in sync if another tab updates the same key.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStored(JSON.parse(e.newValue) as T);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  // Expose hydration only via effect ordering; consumers don't need it here.
  void hydrated;

  return [stored, setValue];
}
