import type { IncomingMessage, ServerResponse } from "node:http";
import { fallbackNews } from "../../src/fallbackData";
import { sendJson } from "../_response";

export default function news(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, fallbackNews);
}
