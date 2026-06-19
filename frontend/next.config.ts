import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Proxy all /api/* requests to the backend (except /api/chat-stream
      // which is handled by a Next.js API route for SSE support).
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
