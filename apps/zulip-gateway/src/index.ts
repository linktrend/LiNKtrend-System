import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { text } from "node:stream/consumers";

import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

const DEFAULT_PORT = 8790;

function extractZulipMessageId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.id === "number" || typeof o.id === "string") return String(o.id);
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.id === "number" || typeof m.id === "string") return String(m.id);
  }
  return null;
}

async function handleZulipWebhook(
  env: ReturnType<typeof loadEnv>,
  rawBody: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    return { ok: false, status: 400, body: "invalid json" };
  }

  const zulipMessageId = extractZulipMessageId(parsed);
  if (!zulipMessageId) {
    return { ok: false, status: 422, body: "no message id" };
  }

  const client = createSupabaseServiceClient(env);
  const { error } = await client
    .schema("gateway")
    .from("zulip_message_links")
    .upsert(
      {
        zulip_message_id: zulipMessageId,
        payload: parsed as Record<string, unknown>,
      },
      { onConflict: "zulip_message_id" },
    );

  if (error) {
    log("error", "gateway upsert failed", { service: "zulip-gateway", message: error.message });
    return { ok: false, status: 500, body: error.message };
  }

  return { ok: true, status: 200, body: "ok" };
}

async function dispatch(req: IncomingMessage, res: ServerResponse, env: ReturnType<typeof loadEnv>) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "zulip-gateway" }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/webhooks/zulip") {
    const raw = await text(req);
    const result = await handleZulipWebhook(env, raw);
    res.writeHead(result.status, { "content-type": "text/plain" });
    res.end(result.body);
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
}

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
