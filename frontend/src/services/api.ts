import { http, toApiError } from "./http";
import type { HealthResponse, UploadResponse } from "@/types/api";

/** GET / — backend health/status check. */
export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  try {
    const { data } = await http.get<HealthResponse>("/health", {
      signal,
      timeout: 8000,
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /upload — multipart upload + indexing with progress reporting. */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await http.post<UploadResponse>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (!onProgress) return;
        const total = event.total ?? file.size;
        if (total > 0) {
          onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
        }
      },
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
