import { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const upstream = await fetch(`${BACKEND_URL}/chat-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Backend error", { status: upstream.status });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
