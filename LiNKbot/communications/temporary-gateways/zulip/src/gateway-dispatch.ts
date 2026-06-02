import type { IncomingMessage, ServerResponse } from "node:http";
import { text } from "node:stream/consumers";

import { createSupabaseServiceClient } from "@linktrend/db";
import { recordTrace } from "@linktrend/linklogic-sdk";
import { log } from "@linktrend/observability";
import type { Env } from "@linktrend/shared-config";

import { loadZulipGatewayConfigFromEnv } from "./load-config.js";
import { resolveMissionId } from "./resolve-mission-id.js";
import type {
  GatewayDispatchRequest,
  GatewayDispatchResult,
  ZulipGatewayConfig,
  ZulipMessagePayload,
  ZulipMode,
} from "./types.js";
import { GatewayDispatchRequestSchema } from "./types.js";
import { extractZulipMessageId, extractZulipStreamId, extractZulipTopic } from "./zulip-payload.js";
import { probeZulipConnectivity, sendRunNotification, sendZulipMessage } from "./zulip-send.js";

const ALLOWED_OPERATIONS = ["run.notify", "channel.message.mock_send", "connectivity.probe"] as const;

export const DEFAULT_GATEWAY_CONFIG: ZulipGatewayConfig = {
  base_url: "http://localhost:9991",
  bot_email: "linkbot@example.test",
  api_key: "mock-api-key",
  default_stream: "linktrend-runs",
  topic_template: "run-{run_id}",
  mode: "mock",
  requires_lease: true,
  request_timeout_ms: 1000,
};

export function validateDispatchRequest(request: unknown): { valid: boolean; errors: string[] } {
  const candidate = request as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof candidate?.operation !== "string") {
    errors.push("operation is required and must be a string");
  } else if (!ALLOWED_OPERATIONS.includes(candidate.operation as (typeof ALLOWED_OPERATIONS)[number])) {
    errors.push(`operation must be one of ${ALLOWED_OPERATIONS.join(", ")}`);
  }

  if (candidate?.capability !== "cap.zulip.run_messaging") {
    errors.push("capability must be 'cap.zulip.run_messaging'");
  }

  const parsed = GatewayDispatchRequestSchema.safeParse(request);
  if (!parsed.success && errors.length === 0) {
    errors.push(...parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
  }

  return { valid: errors.length === 0, errors };
}

export function getGatewayCapabilities(): {
  operations: string[];
  modes: ZulipMode[];
  requires_lease: boolean;
} {
  return {
    operations: [...ALLOWED_OPERATIONS],
    modes: ["mock", "shadow", "live"],
    requires_lease: true,
  };
}

export async function checkGatewayHealth(config: ZulipGatewayConfig = DEFAULT_GATEWAY_CONFIG) {
  if (config.mode === "mock") {
    return {
      status: "healthy" as const,
      mode: config.mode,
      total_messages_sent: 0,
      total_messages_failed: 0,
      checked_at: new Date().toISOString(),
      connectivity: {
        reachable: true,
        authenticated: false,
        latency_ms: 0,
        checked_at: new Date().toISOString(),
      },
    };
  }

  const connectivity = await probeZulipConnectivity(config);
  return {
    status: connectivity.reachable ? ("healthy" as const) : ("degraded" as const),
    mode: config.mode,
    connectivity,
    total_messages_sent: 0,
    total_messages_failed: 0,
    checked_at: new Date().toISOString(),
  };
}

export async function dispatchGatewayOperation(
  request: GatewayDispatchRequest,
  config: ZulipGatewayConfig = DEFAULT_GATEWAY_CONFIG,
  env?: Env,
): Promise<GatewayDispatchResult> {
  if (!ALLOWED_OPERATIONS.includes(request.operation as (typeof ALLOWED_OPERATIONS)[number])) {
    return {
      success: false,
      operation: String(request.operation),
      result: {},
      error: { code: "UNKNOWN_OPERATION", message: `Unknown operation: ${request.operation}` },
      processed_at: new Date().toISOString(),
    };
  }

  const validation = validateDispatchRequest(request);
  if (!validation.valid) {
    return {
      success: false,
      operation: String((request as { operation?: unknown }).operation ?? "unknown"),
      result: {},
      error: { code: "INVALID_REQUEST", message: validation.errors.join("; ") },
      processed_at: new Date().toISOString(),
    };
  }

  if (request.operation === "connectivity.probe") {
    const connectivity = await probeZulipConnectivity(config);
    return {
      success: connectivity.reachable,
      operation: request.operation,
      result: { ...connectivity },
      processed_at: new Date().toISOString(),
    };
  }

  if (request.operation === "run.notify") {
    const notification = request.arguments;
    const result = await sendRunNotification(
      request.tenant_id,
      String(notification.run_id ?? request.idempotency_key.split(":")[0] ?? "run"),
      String(notification.stage_id ?? request.idempotency_key.split(":")[1] ?? "stage"),
      String(notification.role_id ?? "linkbot"),
      String(notification.notification_type ?? "started") as "started" | "completed" | "failed" | "awaiting_approval",
      String(notification.message ?? "Run notification"),
      config,
      notification.details as Record<string, unknown> | undefined,
      request.lease_id,
      env,
    );
    return {
      success: result.success,
      operation: request.operation,
      result: { ...result },
      error: result.error,
      processed_at: new Date().toISOString(),
    };
  }

  if (request.operation === "channel.message.mock_send") {
    const payload = {
      ...request.arguments,
      mode: config.mode,
      lease_id: request.lease_id ?? (request.arguments as { lease_id?: string }).lease_id,
    } as ZulipMessagePayload;
    const result = await sendZulipMessage(payload, config, env);
    return {
      success: result.success,
      operation: request.operation,
      result: { ...result },
      error: result.error,
      processed_at: new Date().toISOString(),
    };
  }

  return {
    success: false,
    operation: String(request.operation),
    result: {},
    error: { code: "UNKNOWN_OPERATION", message: `Unknown operation: ${request.operation}` },
    processed_at: new Date().toISOString(),
  };
}

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
  const config = loadZulipGatewayConfigFromEnv(env);

  if (req.method === "GET" && url.pathname === "/health") {
    const health = await checkGatewayHealth(config);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: health.status === "healthy", service: "zulip-gateway", ...health }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/v1/dispatch") {
    const raw = await text(req);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "invalid json" }));
      return;
    }
    const result = await dispatchGatewayOperation(parsed as GatewayDispatchRequest, config, env);
    res.writeHead(result.success ? 200 : 422, { "content-type": "application/json" });
    res.end(JSON.stringify(result));
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
