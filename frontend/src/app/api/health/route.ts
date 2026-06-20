import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ status: "offline" }, { status: 503 });
  }
}
