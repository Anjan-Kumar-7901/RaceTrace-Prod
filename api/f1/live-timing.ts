import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../../server";

export default function liveTiming(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
