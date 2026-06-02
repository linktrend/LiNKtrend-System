/**
 * Zulip Send Operations
 *
 * Modes:
 * - mock: log only
 * - shadow: connectivity check, no send
 * - live: real Zulip REST send (lease-gated)
 */

import type { Env } from "@linktrend/shared-config";
import { recordTrace, writeBrainAuditEvent } from "@linktrend/linklogic-sdk";
import { createSupabaseServiceClient } from "@linktrend/db";

import { probeZulipAuthenticated, sendStreamMessage } from "./zulip-api.js";
import {
  ZulipMessagePayload,
  ZulipSendResult,
  ZulipConnectivityResult,
  ZulipGatewayConfig,
} from "./types.js";
import { hasRequiredLease } from "./zulip-payload.js";

let stats = {
  sent: 0,
  failed: 0,
  lastSendAt: null as string | null,
};

export function getSendStats(): {
  total_messages_sent: number;
  total_messages_failed: number;
  last_send_at: string | null;
} {
  return {
    total_messages_sent: stats.sent,
    total_messages_failed: stats.failed,
    last_send_at: stats.lastSendAt,
  };
}

export function resetSendStats(): void {
  stats = { sent: 0, failed: 0, lastSendAt: null };
}

async function persistOutboundLink(
  env: Env,
  params: {
    zulipMessageId: number;
    streamId?: number | null;
    streamName: string;
    topic: string;
    missionId?: string | null;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const client = createSupabaseServiceClient(env);
    await client.schema("gateway").from("zulip_message_links").upsert(
      {
        zulip_message_id: String(params.zulipMessageId),
        stream_id: params.streamId ?? undefined,
        topic: params.topic,
        mission_id: params.missionId ?? undefined,
        payload: params.payload,
      },
      { onConflict: "zulip_message_id" },
    );
  } catch {
    // Non-fatal — LiNKaios Messages may lag until inbound webhook fires.
  }
}

async function emitZulipGovernanceAudit(
  env: Env,
  payload: ZulipMessagePayload,
  zulipMessageId: number,
): Promise<void> {
  const ctx = payload.mission_context;
  const tenantId = ctx.tenant_id;
  const now = new Date().toISOString();

  await writeBrainAuditEvent(env, {
    event_id: crypto.randomUUID(),
    ts: now,
    tenant_id: tenantId,
    plane: "linkskills",
    actor: {
      actor_kind: "bot",
      actor_id: ctx.role_id,
    },
    action: "lease.executed",
    subject: {
      run_id: ctx.run_id,
      stage_id: ctx.stage_id,
      lease_id: payload.lease_id,
      capability: "cap.zulip.run_messaging",
    },
    refs: {},
    payload: {
      zulip_message_id: zulipMessageId,
      stream: payload.stream,
      topic: payload.topic,
      message_purpose: ctx.message_purpose,
      mode: "live",
    },
    schema_version: "1",
  });

  await recordTrace(env, {
    eventType: "zulip.message.sent",
    missionId: null,
    payload: {
      zulip_message_id: zulipMessageId,
      stream: payload.stream,
      topic: payload.topic,
      tenant_id: tenantId,
      run_id: ctx.run_id,
      lease_id: payload.lease_id,
    },
  });
}

export async function sendZulipMessage(
  payload: ZulipMessagePayload,
  config: ZulipGatewayConfig,
  env?: Env,
): Promise<ZulipSendResult> {
  const now = new Date().toISOString();
  const effectiveMode = payload.mode || config.mode;

  if (effectiveMode !== "mock" && config.requires_lease && !hasRequiredLease(payload)) {
    stats.failed++;
    return {
      success: false,
      mock_sent: false,
      mode: effectiveMode,
      error: {
        code: "LEASE_REQUIRED",
        message: "Lease required for non-mock Zulip messaging",
      },
      sent_at: now,
    };
  }

  if (effectiveMode === "mock") {
    stats.sent++;
    stats.lastSendAt = now;
    console.log("[ZULIP MOCK SEND]", {
      stream: payload.stream,
      topic: payload.topic,
      mission_context: payload.mission_context,
    });
    return {
      success: true,
      message_id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mock_sent: true,
      mode: effectiveMode,
      sent_at: now,
    };
  }

  if (effectiveMode === "shadow") {
    const connectivity = await probeZulipConnectivity(config);
    if (!connectivity.reachable || !connectivity.authenticated) {
      stats.failed++;
      return {
        success: false,
        mock_sent: false,
        mode: effectiveMode,
        error: {
          code: "CONNECTIVITY_FAILED",
          message: `Zulip connectivity failed: ${connectivity.error ?? "not authenticated"}`,
        },
        sent_at: now,
      };
    }
    console.log("[ZULIP SHADOW] Message would send:", {
      stream: payload.stream,
      topic: payload.topic,
      latency_ms: connectivity.latency_ms,
    });
    return {
      success: true,
      mock_sent: false,
      mode: effectiveMode,
      sent_at: now,
    };
  }

  if (effectiveMode === "live") {
    try {
      const sent = await sendStreamMessage(config, {
        stream: payload.stream,
        topic: payload.topic,
        content: payload.content,
      });
      stats.sent++;
      stats.lastSendAt = now;

      const outboundPayload = {
        id: sent.id,
        stream: payload.stream,
        topic: payload.topic,
        content: payload.content,
        sender_full_name: config.bot_email,
        _linktrend: { outbound: true, mission_context: payload.mission_context },
      };

      if (env) {
        await persistOutboundLink(env, {
          zulipMessageId: sent.id,
          streamName: payload.stream,
          topic: payload.topic,
          payload: outboundPayload,
        });
        await emitZulipGovernanceAudit(env, payload, sent.id);
      }

      return {
        success: true,
        message_id: String(sent.id),
        mock_sent: false,
        mode: effectiveMode,
        sent_at: now,
      };
    } catch (error) {
      stats.failed++;
      return {
        success: false,
        mock_sent: false,
        mode: effectiveMode,
        error: {
          code: "ZULIP_SEND_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
        sent_at: now,
      };
    }
  }

  stats.failed++;
  return {
    success: false,
    mock_sent: false,
    mode: effectiveMode,
    error: { code: "UNKNOWN_MODE", message: `Unknown mode: ${effectiveMode}` },
    sent_at: now,
  };
}

export async function probeZulipConnectivity(
  config: ZulipGatewayConfig,
): Promise<ZulipConnectivityResult> {
  const now = new Date().toISOString();

  if (config.mode === "mock" && config.api_key === "mock-api-key") {
    return {
      reachable: true,
      authenticated: false,
      latency_ms: 0,
      checked_at: now,
    };
  }

  const authProbe = await probeZulipAuthenticated(config);
  if (authProbe.reachable && authProbe.authenticated) {
    return {
      reachable: true,
      authenticated: true,
      latency_ms: authProbe.latency_ms,
      checked_at: now,
    };
  }

  if (!authProbe.reachable) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${config.base_url.replace(/\/+$/, "")}/api/v1/server_settings`, {
        method: "GET",
        signal: AbortSignal.timeout(config.request_timeout_ms),
      });
      return {
        reachable: response.ok,
        authenticated: false,
        latency_ms: Date.now() - startTime,
        error: response.ok ? authProbe.error : `HTTP ${response.status}`,
        checked_at: now,
      };
    } catch (error) {
      return {
        reachable: false,
        authenticated: false,
        latency_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        checked_at: now,
      };
    }
  }

  return {
    reachable: authProbe.reachable,
    authenticated: authProbe.authenticated,
    latency_ms: authProbe.latency_ms,
    error: authProbe.error,
    checked_at: now,
  };
}

export async function sendRunNotification(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  notification_type: "started" | "completed" | "failed" | "awaiting_approval",
  message: string,
  config: ZulipGatewayConfig,
  details?: Record<string, unknown>,
  lease_id?: string,
  env?: Env,
): Promise<ZulipSendResult> {
  const { buildRunNotificationPayload } = await import("./zulip-payload.js");

  const payload = buildRunNotificationPayload(
    {
      tenant_id,
      run_id,
      stage_id,
      role_id,
      notification_type,
      message,
      details,
    },
    config.default_stream,
    config.mode,
    lease_id,
  );

  return sendZulipMessage(payload, config, env);
}

export async function sendBatchMessages(
  payloads: ZulipMessagePayload[],
  config: ZulipGatewayConfig,
  env?: Env,
): Promise<ZulipSendResult[]> {
  const results: ZulipSendResult[] = [];
  for (const payload of payloads) {
    results.push(await sendZulipMessage(payload, config, env));
    if (payloads.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return results;
}
