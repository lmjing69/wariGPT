import axios, { AxiosError } from "axios";
import { REQUEST_TIMEOUT_MS } from "@/lib/constants";

/** Shared axios instance — calls go through the Next.js /api proxy. */
export const http = axios.create({
  baseURL: "/api",
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

/** A normalized, user-friendly error surfaced from the API layer. */
export class ApiError extends Error {
  status?: number;
  isTimeout: boolean;
  isNetwork: boolean;

  constructor(
    message: string,
    opts: { status?: number; isTimeout?: boolean; isNetwork?: boolean } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.isTimeout = opts.isTimeout ?? false;
    this.isNetwork = opts.isNetwork ?? false;
  }
}

/** Convert any thrown value into a normalized ApiError with a helpful message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axErr = error as AxiosError<{ detail?: string; message?: string }>;

    if (axErr.code === "ECONNABORTED") {
      return new ApiError(
        "The request timed out. The backend may be busy — please try again.",
        { isTimeout: true }
      );
    }

    if (axErr.response) {
      const data = axErr.response.data;
      const detail =
        (typeof data?.detail === "string" && data.detail) ||
        (typeof data?.message === "string" && data.message) ||
        axErr.response.statusText;
      return new ApiError(detail || "The server returned an error.", {
        status: axErr.response.status,
      });
    }

    // No response → network / CORS / server down.
    return new ApiError(
      "Could not reach the backend. Make sure the API is running at the configured URL.",
      { isNetwork: true }
    );
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("An unexpected error occurred.");
}
