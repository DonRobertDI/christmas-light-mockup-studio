import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "../server/src/app.js";
import { initializeRuntime } from "../server/src/runtime.js";

export default function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  initializeRuntime();
  return app(request as never, response as never);
}
