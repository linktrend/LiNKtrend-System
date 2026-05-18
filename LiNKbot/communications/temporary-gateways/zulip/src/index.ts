import { createServer } from "node:http";

import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

import { dispatch } from "./gateway-dispatch.js";

const DEFAULT_PORT = 8790;

async function main() {
  const env = loadEnv();
  const port = Number(process.env.ZULIP_GATEWAY_PORT ?? DEFAULT_PORT);

  const server = createServer((req, res) => {
    void dispatch(req, res, env).catch((err) => {
      log("error", "request failed", { service: "zulip-gateway", error: String(err) });
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("error");
    });
  });

  server.listen(port, () => {
    log("info", "zulip-gateway listening", {
      service: "zulip-gateway",
      port,
      webhook: `http://127.0.0.1:${port}/webhooks/zulip`,
    });
  });
}

main();
