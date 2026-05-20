import type { ZulipMessagePayload, ZulipMode, ZulipRunNotification } from "./types.js";

/** Best-effort extraction from Zulip webhook / bot JSON (formats vary by integration). */

export function extractZulipMessageId(body: unknown): string | null {
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

export function extractZulipStreamId(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.stream_id === "number") return o.stream_id;
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.stream_id === "number") return m.stream_id;
  }
  return null;
}

export function extractZulipTopic(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.topic === "string") return o.topic;
  const msg = o.message;
  if (msg && typeof msg === "object") {
    const m = msg as Record<string, unknown>;
    if (typeof m.topic === "string") return m.topic;
    const sub = m.subject;
    if (typeof sub === "string") return sub;
  }
  return null;
}

export function hasRequiredLease(payload: ZulipMessagePayload): boolean {
  return typeof payload.lease_id === "string" && payload.lease_id.trim().length > 0;
}

export function buildRunNotificationPayload(
  notification: ZulipRunNotification,
  stream: string,
  mode: ZulipMode,
  leaseId?: string
): ZulipMessagePayload {
  return {
    content: notification.message,
    stream,
    topic: `run-${notification.run_id}`,
    mission_context: {
      tenant_id: notification.tenant_id,
      run_id: notification.run_id,
      stage_id: notification.stage_id,
      role_id: notification.role_id,
      message_purpose:
        notification.notification_type === "failed" ? "operator_alert" : "run_notification",
    },
    lease_id: leaseId,
    mode,
  };
}
