import type { IncomingMessage, ServerResponse } from "node:http";

export default function health(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({
    status: "ok",
    service: "RaceTrace API",
    runtime: "vercel-function",
    season: new Date().getFullYear(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  }));
}
