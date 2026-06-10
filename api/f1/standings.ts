import type { IncomingMessage, ServerResponse } from "node:http";
import { fallbackConstructors, fallbackDrivers } from "../../src/fallbackData";
import { sendJson } from "../_response";

export default function standings(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, {
    drivers: fallbackDrivers,
    constructors: fallbackConstructors,
    source: "RaceTrace resilient fallback",
  });
}
