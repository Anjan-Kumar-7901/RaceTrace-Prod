import type { IncomingMessage, ServerResponse } from "node:http";
import { fallbackDrivers, getFallbackCareerStats } from "../../src/fallbackData";
import { sendJson } from "../_response";

export default function career(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", "https://racetrace.local");
  const driverId = String(url.searchParams.get("driverId") || "").toLowerCase();
  const driver = fallbackDrivers.find((candidate) => candidate.id === driverId) || fallbackDrivers[0];
  sendJson(res, getFallbackCareerStats(driver));
}
