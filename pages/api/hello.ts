import type { NextRequest } from "next/server";

export const runtime = "edge";

export default function handler(req: NextRequest) {
  return new Response(JSON.stringify({ name: "John Doe" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
