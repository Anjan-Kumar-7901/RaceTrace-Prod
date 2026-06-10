import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../../server";

export default function news(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
