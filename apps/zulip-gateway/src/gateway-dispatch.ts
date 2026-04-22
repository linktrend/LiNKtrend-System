import type { IncomingMessage, ServerResponse } from "node:http";
import { text } from "node:stream/consumers";

import { createSupabaseServiceClient } from "@linktrend/db";
import { recordTrace } from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import type { Env } from "@linktrend/shared-config";

import { resolveMissionId } from "./resolve-mission-id.js";
import { extractZulipMessageId, extractZulipStreamId, extractZulipTopic } from "./zulip-payload.js";

export async function handleZulipWebhook(
  env: Env,
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

export async function dispatch(req: IncomingMessage, res: ServerResponse, env: Env) {
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
