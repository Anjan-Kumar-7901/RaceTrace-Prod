import type { Request, Response } from "express";
import app from "../server";

function addQueryValue(params: URLSearchParams, key: string, value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => params.append(key, String(entry)));
  } else if (value !== undefined) {
    params.append(key, String(value));
  }
}

export default function handler(req: Request, res: Response) {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  const rawQuery = req.query || Object.fromEntries(requestUrl.searchParams);
  const forwardedPath = Array.isArray(rawQuery.path)
    ? rawQuery.path.join("/")
    : String(rawQuery.path || "");

  if (forwardedPath) {
    const query = new URLSearchParams();
    Object.entries(rawQuery).forEach(([key, value]) => {
      if (key !== "path") addQueryValue(query, key, value);
    });
    const suffix = query.size > 0 ? `?${query.toString()}` : "";
    req.url = `/api/${forwardedPath.replace(/^\/+/, "")}${suffix}`;
  }

  return app(req, res);
}
