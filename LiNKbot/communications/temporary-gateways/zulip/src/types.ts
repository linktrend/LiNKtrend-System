/**
 * Zulip Gateway Types
 *
 * Per CONTRACTS_MVO.md §0.A.5 - Zulip capability contract:
 * - Operations: run.notify, channel.message.mock_send, connectivity.probe
 * - Modes: mock default, shadow for connectivity, live disabled
 * - All messaging routes through cap.zulip.run_messaging lease-gated
 *
 * This is a TEMPORARY gateway until OpenClaw (or another engine) adopts
 * native Zulip support. It does NOT become generic capability ownership.
 */

import { z } from "zod";

/**
 * Zulip gateway execution mode
 */
export const ZulipModeSchema = z.enum(["mock", "shadow", "live"]);
export type ZulipMode = z.infer<typeof ZulipModeSchema>;

/**
 * Zulip gateway configuration
 */
export const ZulipGatewayConfigSchema = z.object({
  base_url: z.string().url(),
  bot_email: z.string().email(),
  api_key: z.string().min(1),
  default_stream: z.string().min(1),
  topic_template: z.string().default("run-{run_id}"),

  // Mode settings (mock default per CONTRACTS_MVO.md)
  mode: ZulipModeSchema.default("mock"),

  // Lease requirement
  requires_lease: z.boolean().default(true),

  // Timeouts
  request_timeout_ms: z.number().int().positive().default(10000),
});
export type ZulipGatewayConfig = z.infer<typeof ZulipGatewayConfigSchema>;

/**
 * Mission context for Zulip messages
 *
 * All Zulip messages MUST carry mission context per
 * LINKBOT_ADAPTER_PLAN.md §"Zulip messaging adapter"
 */
export const ZulipMissionContextSchema = z.object({
  tenant_id: z.string().min(1),
  run_id: z.string().min(1),
  stage_id: z.string().min(1),
  role_id: z.string().min(1),
  message_purpose: z.enum(["run_notification", "status_update", "operator_alert", "debug"]),
});
export type ZulipMissionContext = z.infer<typeof ZulipMissionContextSchema>;

/**
 * Zulip message payload
 */
export const ZulipMessagePayloadSchema = z.object({
  // Content
  content: z.string().min(1).max(10000),

  // Routing
  stream: z.string().min(1),
  topic: z.string().min(1),

  // Mission context (required)
  mission_context: ZulipMissionContextSchema,

  // Lease reference (required when not in mock mode)
  lease_id: z.string().optional(),

  // Mode override
  mode: ZulipModeSchema.optional(),
});
export type ZulipMessagePayload = z.infer<typeof ZulipMessagePayloadSchema>;

/**
 * Zulip notification payload for run events
 */
export const ZulipRunNotificationSchema = z.object({
  tenant_id: z.string().min(1),
  run_id: z.string().min(1),
  stage_id: z.string().min(1),
  role_id: z.string().min(1),
  notification_type: z.enum(["started", "completed", "failed", "awaiting_approval"]),
  message: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ZulipRunNotification = z.infer<typeof ZulipRunNotificationSchema>;

/**
 * Zulip send result
 */
export const ZulipSendResultSchema = z.object({
  success: z.boolean(),
  message_id: z.string().optional(),
  mock_sent: z.boolean(),
  mode: ZulipModeSchema,
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
  sent_at: z.string().datetime(),
});
export type ZulipSendResult = z.infer<typeof ZulipSendResultSchema>;

/**
 * Zulip connectivity probe result
 */
export const ZulipConnectivityResultSchema = z.object({
  reachable: z.boolean(),
  authenticated: z.boolean(),
  server_version: z.string().optional(),
  latency_ms: z.number().int(),
  error: z.string().optional(),
  checked_at: z.string().datetime(),
});
export type ZulipConnectivityResult = z.infer<typeof ZulipConnectivityResultSchema>;

/**
 * Gateway dispatch request
 */
export const GatewayDispatchRequestSchema = z.object({
  operation: z.enum(["run.notify", "channel.message.mock_send", "connectivity.probe"]),
  tenant_id: z.string().min(1),
  capability: z.literal("cap.zulip.run_messaging"),
  arguments: z.record(z.string(), z.unknown()),
  lease_id: z.string().optional(),
  idempotency_key: z.string().min(1),
});
export type GatewayDispatchRequest = z.infer<typeof GatewayDispatchRequestSchema>;

/**
 * Gateway dispatch result
 */
export const GatewayDispatchResultSchema = z.object({
  success: z.boolean(),
  operation: z.string(),
  result: z.record(z.string(), z.unknown()),
  audit_event_id: z.string().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
  processed_at: z.string().datetime(),
});
export type GatewayDispatchResult = z.infer<typeof GatewayDispatchResultSchema>;

/**
 * Zulip gateway health status
 */
export const ZulipGatewayHealthSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  mode: ZulipModeSchema,
  connectivity: ZulipConnectivityResultSchema.optional(),
  last_send_at: z.string().datetime().optional(),
  total_messages_sent: z.number().int(),
  total_messages_failed: z.number().int(),
  checked_at: z.string().datetime(),
});
export type ZulipGatewayHealth = z.infer<typeof ZulipGatewayHealthSchema>;
