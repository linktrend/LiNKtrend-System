/**
 * Zulip Payload Builders
 *
 * Per CONTRACTS_MVO.md §0.A.5, all Zulip messages must be:
 * - Mission-aware (carry tenant, run, stage, role context)
 * - Lease-gated (except in mock mode)
 * - Audit-traced (emit to LiNKbrain)
 */

import {
  ZulipMessagePayload,
  ZulipRunNotification,
  ZulipMissionContext,
  ZulipMessagePayloadSchema,
  ZulipMode,
} from "./types.js";

/**
 * Build a run notification message
 */
export function buildRunNotificationPayload(
  notification: ZulipRunNotification,
  stream: string,
  mode: ZulipMode = "mock",
  lease_id?: string
): ZulipMessagePayload {
  const topic = `run-${notification.run_id}`;

  let content = `**Run ${notification.notification_type.toUpperCase()}**\n\n`;
  content += `**Run ID:** ${notification.run_id}\n`;
  content += `**Stage:** ${notification.stage_id}\n`;
  content += `**Role:** ${notification.role_id}\n`;
  content += `\n${notification.message}`;

  if (notification.details && Object.keys(notification.details).length > 0) {
    content += "\n\n**Details:**\n";
    for (const [key, value] of Object.entries(notification.details)) {
      content += `- ${key}: ${JSON.stringify(value)}\n`;
    }
  }

  const payload: ZulipMessagePayload = {
    content,
    stream,
    topic,
    mission_context: {
      tenant_id: notification.tenant_id,
      run_id: notification.run_id,
      stage_id: notification.stage_id,
      role_id: notification.role_id,
      message_purpose: "run_notification",
    },
    mode,
  };

  if (lease_id && mode !== "mock") {
    payload.lease_id = lease_id;
  }

  return ZulipMessagePayloadSchema.parse(payload);
}

/**
 * Build a status update message
 */
export function buildStatusUpdatePayload(
  mission_context: ZulipMissionContext,
  status: string,
  details: string,
  stream: string,
  mode: ZulipMode = "mock",
  lease_id?: string
): ZulipMessagePayload {
  const topic = `run-${mission_context.run_id}`;

  const content = `**Status Update: ${status}**\n\n${details}`;

  const payload: ZulipMessagePayload = {
    content,
    stream,
    topic,
    mission_context: {
      ...mission_context,
      message_purpose: "status_update",
    },
    mode,
  };

  if (lease_id && mode !== "mock") {
    payload.lease_id = lease_id;
  }

  return ZulipMessagePayloadSchema.parse(payload);
}

/**
 * Build an operator alert message
 */
export function buildOperatorAlertPayload(
  mission_context: ZulipMissionContext,
  alert_title: string,
  alert_body: string,
  stream: string,
  mode: ZulipMode = "mock",
  lease_id?: string
): ZulipMessagePayload {
  const topic = `alerts-${mission_context.tenant_id}`;

  const content = `🚨 **${alert_title}**\n\n${alert_body}\n\n*Run: ${mission_context.run_id}, Stage: ${mission_context.stage_id}*`;

  const payload: ZulipMessagePayload = {
    content,
    stream,
    topic,
    mission_context: {
      ...mission_context,
      message_purpose: "operator_alert",
    },
    mode,
  };

  if (lease_id && mode !== "mock") {
    payload.lease_id = lease_id;
  }

  return ZulipMessagePayloadSchema.parse(payload);
}

/**
 * Build a debug message (for development only)
 */
export function buildDebugPayload(
  mission_context: ZulipMissionContext,
  debug_info: Record<string, unknown>,
  stream: string,
  mode: ZulipMode = "mock"
): ZulipMessagePayload {
  const topic = `debug-${mission_context.run_id}`;

  let content = "**Debug Information**\n\n```json\n";
  content += JSON.stringify(debug_info, null, 2);
  content += "\n```";

  return ZulipMessagePayloadSchema.parse({
    content,
    stream,
    topic,
    mission_context: {
      ...mission_context,
      message_purpose: "debug",
    },
    mode,
  });
}

/**
 * Validate message payload
 */
export function validateZulipPayload(payload: unknown): {
  valid: boolean;
  errors: string[];
  payload?: ZulipMessagePayload;
} {
  const result = ZulipMessagePayloadSchema.safeParse(payload);

  if (result.success) {
    return { valid: true, errors: [], payload: result.data };
  }

  const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  return { valid: false, errors };
}

/**
 * Check if payload has required lease for non-mock modes
 */
export function hasRequiredLease(payload: ZulipMessagePayload): boolean {
  if (payload.mode === "mock") {
    return true;
  }

  return !!payload.lease_id;
}

/**
 * Redact sensitive information from payload for logging
 */
export function redactPayloadForLogging(payload: ZulipMessagePayload): Record<string, unknown> {
  return {
    stream: payload.stream,
    topic: payload.topic,
    content_preview: payload.content.slice(0, 100) + "...",
    mission_context: payload.mission_context,
    mode: payload.mode,
    has_lease: !!payload.lease_id,
  };
}
