import type { ServerResponse } from "node:http";

export function sendJson(res: ServerResponse, data: unknown): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
  res.end(JSON.stringify(data));
}
