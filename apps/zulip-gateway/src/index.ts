import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { text } from "node:stream/consumers";

import { createSupabaseServiceClient } from "@linktrend/db";
import { recordTrace } from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import { loadEnv } from "@linktrend/shared-config";

import { extractZulipMessageId, extractZulipStreamId, extractZulipTopic } from "./zulip-payload.js";

const DEFAULT_PORT = 8790;

async function resolveMissionId(params: {
  client: ReturnType<typeof createSupabaseServiceClient>;
  streamId: number | null;
  overrideMissionId: string | null;
}): Promise<{ missionId: string | null; source: string }> {
  if (params.overrideMissionId) {
    const { data, error } = await params.client
      .schema("linkaios")
      .from("missions")
      .select("id")
      .eq("id", params.overrideMissionId)
      .maybeSingle();
    if (error) {
      log("warn", "gateway mission override lookup failed", {
        service: "zulip-gateway",
        message: error.message,
      });
      return { missionId: null, source: "override_invalid" };
    }
    if (data?.id) return { missionId: String(data.id), source: "query_override" };
    return { missionId: null, source: "override_not_found" };
  }
  if (params.streamId == null) {
    return { missionId: null, source: "no_stream" };
  }
  const { data, error } = await params.client
    .schema("gateway")
    .from("stream_routing")
    .select("mission_id")
    .eq("zulip_stream_id", params.streamId)
    .maybeSingle();
  if (error) {
    log("warn", "gateway stream_routing lookup failed", {
      service: "zulip-gateway",
      message: error.message,
    });
    return { missionId: null, source: "routing_error" };
  }
  if (data?.mission_id) return { missionId: String(data.mission_id), source: "stream_routing" };
  return { missionId: null, source: "no_routing_row" };
}

async function handleZulipWebhook(
  env: ReturnType<typeof loadEnv>,
  rawBody: string,
  queryMissionId: string | null,
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

  const streamId = extractZulipStreamId(parsed);
  const topic = extractZulipTopic(parsed);
  const client = createSupabaseServiceClient(env);

  const override =
    queryMissionId && /^[0-9a-f-]{36}$/i.test(queryMissionId.trim()) ? queryMissionId.trim() : null;
  const { missionId, source } = await resolveMissionId({
    client,
    streamId,
    overrideMissionId: override,
  });

  const basePayload: Record<string, unknown> =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { ...(parsed as Record<string, unknown>) }
      : { value: parsed };
  basePayload._linktrend = {
    missionResolution: { missionId, source, streamId, topic },
  };

  const { error } = await client
    .schema("gateway")
    .from("zulip_message_links")
    .upsert(
      {
        zulip_message_id: zulipMessageId,
        stream_id: streamId ?? undefined,
        topic: topic ?? undefined,
        mission_id: missionId ?? undefined,
        payload: basePayload,
      },
      { onConflict: "zulip_message_id" },
    );

  if (error) {
    log("error", "gateway upsert failed", { service: "zulip-gateway", message: error.message });
    return { ok: false, status: 500, body: error.message };
  }

  try {
    await recordTrace(env, {
      eventType: missionId ? "gateway.message_linked" : "gateway.mission_unresolved",
      missionId,
      payload: {
        zulipMessageId,
        streamId,
        topic,
        resolutionSource: source,
      },
    });
  } catch (e) {
    log("warn", "gateway trace failed", { service: "zulip-gateway", error: String(e) });
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
    const missionOverride = url.searchParams.get("mission_id");
    const result = await handleZulipWebhook(env, raw, missionOverride);
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
