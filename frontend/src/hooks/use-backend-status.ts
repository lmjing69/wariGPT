"use client";

import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/services/api";
import type { BackendStatus } from "@/types";

/** Polls the backend health endpoint and exposes a simple status enum. */
export function useBackendStatus() {
  const query = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth(signal),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 10_000,
  });

  const status: BackendStatus = query.isLoading
    ? "checking"
    : query.isSuccess
    ? "online"
    : "offline";

  // Note: spread first so our derived `status` is not shadowed by react-query's.
  return { ...query, status };
}
