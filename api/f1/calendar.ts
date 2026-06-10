import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../../server";

export default function calendar(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
