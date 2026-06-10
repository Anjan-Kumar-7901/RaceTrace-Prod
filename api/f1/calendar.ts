import type { IncomingMessage, ServerResponse } from "node:http";
import { fallbackRaces } from "../../src/fallbackData";
import { sendJson } from "../_response";

export default function calendar(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, fallbackRaces);
}
