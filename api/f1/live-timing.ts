import type { IncomingMessage, ServerResponse } from "node:http";
import { fallbackDrivers } from "../../src/fallbackData";
import { sendJson } from "../_response";

export default function liveTiming(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", "https://racetrace.local");
  const session = url.searchParams.get("session") || "Race";
  const timingTower = fallbackDrivers.slice(0, 20).map((driver, index) => ({
    position: index + 1,
    driverId: driver.id,
    driverName: driver.name,
    driverNumber: driver.number,
    team: driver.team,
    lapTime: `1:${String(14 + index * 0.12).padStart(6, "0")}`,
    sector1: (20.8 + index * 0.03).toFixed(3),
    sector2: (31.2 + index * 0.04).toFixed(3),
    sector3: (22.3 + index * 0.03).toFixed(3),
    fastestLap: index === 0,
    gap: index === 0 ? "LEADER" : `+${(index * 0.12).toFixed(3)}s`,
  }));

  sendJson(res, {
    active: true,
    session,
    sessionTimeRemaining: "42:15",
    airTemp: "19.5 C",
    trackTemp: "31.2 C",
    lapsCompleted: 34,
    totalLaps: 56,
    timingTower,
  });
}
