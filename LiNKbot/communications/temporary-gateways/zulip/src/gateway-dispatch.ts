/**
 * Gateway Dispatch
 *
 * Per CONTRACTS_MVO.md §0.A.5 and LINKBOT_ADAPTER_PLAN.md §"Zulip messaging adapter":
 * Route via cap.zulip.run_messaging only:
 * - run.notify
 * - channel.message.mock_send
 * - connectivity.probe
 *
 * No direct LiNKbot send path.
 */

import {
  GatewayDispatchRequest,
  GatewayDispatchResult,
  ZulipGatewayConfig,
  ZulipMode,
} from "./types.js";
import { sendZulipMessage, probeZulipConnectivity, sendRunNotification } from "./zulip-send.js";
import { buildRunNotificationPayload, buildDebugPayload } from "./zulip-payload.js";
import { buildMissionId } from "./resolve-mission-id.js";

/**
 * Default gateway configuration
 */
export const DEFAULT_GATEWAY_CONFIG: ZulipGatewayConfig = {
  base_url: process.env.ZULIP_BASE_URL || "http://localhost:9991",
  bot_email: process.env.ZULIP_BOT_EMAIL || "bot@example.com",
  api_key: process.env.ZULIP_API_KEY || "mock-key",
  default_stream: process.env.ZULIP_DEFAULT_STREAM || "linkbot-notifications",
  topic_template: process.env.ZULIP_TOPIC_TEMPLATE || "run-{run_id}",
  mode: (process.env.ZULIP_MODE as ZulipMode) || "mock",
  requires_lease: process.env.ZULIP_REQUIRES_LEASE !== "false",
  request_timeout_ms: parseInt(process.env.ZULIP_TIMEOUT_MS || "10000"),
};

/**
 * Dispatch gateway operation
 *
 * Per CONTRACTS_MVO.md §0.A.5, operations are:
 * - run.notify
 * - channel.message.mock_send
 * - connectivity.probe
 */
export async function dispatchGatewayOperation(
  request: GatewayDispatchRequest,
  config: ZulipGatewayConfig = DEFAULT_GATEWAY_CONFIG
): Promise<GatewayDispatchResult> {
  const now = new Date().toISOString();

  try {
    switch (request.operation) {
      case "run.notify": {
        const result = await handleRunNotify(request, config);
        return {
          success: result.success,
          operation: request.operation,
          result: result,
          processed_at: now,
        };
      }

      case "channel.message.mock_send": {
        const result = await handleMockSend(request, config);
        return {
          success: result.success,
          operation: request.operation,
          result: result,
          processed_at: now,
        };
      }

      case "connectivity.probe": {
        const result = await probeZulipConnectivity(config);
        return {
          success: result.reachable,
          operation: request.operation,
          result: {
            reachable: result.reachable,
            latency_ms: result.latency_ms,
            server_version: result.server_version,
          },
          processed_at: now,
        };
      }

      default:
        return {
          success: false,
          operation: String(request.operation),
          result: {},
          error: {
            code: "UNKNOWN_OPERATION",
            message: `Unknown operation: ${request.operation}`,
          },
          processed_at: now,
        };
    }
  } catch (error) {
    return {
      success: false,
      operation: request.operation,
      result: {},
      error: {
        code: "DISPATCH_ERROR",
        message: error instanceof Error ? error.message : String(error),
      },
      processed_at: now,
    };
  }
}

/**
 * Handle run.notify operation
 */
async function handleRunNotify(
  request: GatewayDispatchRequest,
  config: ZulipGatewayConfig
): Promise<{
  success: boolean;
  message_id?: string;
  mock_sent: boolean;
  mode: ZulipMode;
}> {
  const args = request.arguments as {
    notification_type: "started" | "completed" | "failed" | "awaiting_approval";
    message: string;
    role_id: string;
    details?: Record<string, unknown>;
  };

  const result = await sendRunNotification(
    request.tenant_id,
    request.idempotency_key.includes(":")
      ? request.idempotency_key.split(":")[0]
      : request.tenant_id, // Extract run_id from idempotency key if formatted as run:stage:capability
    "unknown", // stage_id not in request, use mission context
    args.role_id,
    args.notification_type,
    args.message,
    config,
    args.details,
    request.lease_id
  );

  return {
    success: result.success,
    message_id: result.message_id,
    mock_sent: result.mock_sent,
    mode: result.mode,
  };
}

/**
 * Handle channel.message.mock_send operation
 */
async function handleMockSend(
  request: GatewayDispatchRequest,
  config: ZulipGatewayConfig
): Promise<{
  success: boolean;
  message_id?: string;
  mock_sent: boolean;
  mode: ZulipMode;
}> {
  const args = request.arguments as {
    content: string;
    stream?: string;
    topic?: string;
    mission_context: {
      tenant_id: string;
      run_id: string;
      stage_id: string;
      role_id: string;
    };
  };

  const mission_id = buildMissionId(
    args.mission_context.tenant_id,
    args.mission_context.run_id,
    args.mission_context.stage_id,
    args.mission_context.role_id
  );

  const payload = buildDebugPayload(
    {
      tenant_id: mission_id.tenant_id,
      run_id: mission_id.run_id,
      stage_id: mission_id.stage_id,
      role_id: mission_id.role_id,
      message_purpose: "debug",
    },
    {
      content: args.content,
      operation: "channel.message.mock_send",
      request_args: request.arguments,
    },
    args.stream || config.default_stream,
    config.mode
  );

  const result = await sendZulipMessage(payload, config);

  return {
    success: result.success,
    message_id: result.message_id,
    mock_sent: result.mock_sent,
    mode: result.mode,
  };
}

/**
 * Validate gateway dispatch request
 */
export function validateDispatchRequest(request: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request || typeof request !== "object") {
    return { valid: false, errors: ["Request must be an object"] };
  }

  const req = request as Record<string, unknown>;

  // Check required fields
  if (!req.operation || typeof req.operation !== "string") {
    errors.push("operation is required and must be a string");
  }

  if (!req.tenant_id || typeof req.tenant_id !== "string") {
    errors.push("tenant_id is required and must be a string");
  }

  if (!req.capability || req.capability !== "cap.zulip.run_messaging") {
    errors.push("capability must be 'cap.zulip.run_messaging'");
  }

  if (!req.arguments || typeof req.arguments !== "object") {
    errors.push("arguments is required and must be an object");
  }

  if (!req.idempotency_key || typeof req.idempotency_key !== "string") {
    errors.push("idempotency_key is required and must be a string");
  }

  // Validate operation is allowed
  const allowedOperations = ["run.notify", "channel.message.mock_send", "connectivity.probe"];
  if (req.operation && !allowedOperations.includes(req.operation as string)) {
    errors.push(`operation must be one of: ${allowedOperations.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get gateway capabilities
 */
export function getGatewayCapabilities(): {
  operations: string[];
  modes: ZulipMode[];
  requires_lease: boolean;
} {
  return {
    operations: ["run.notify", "channel.message.mock_send", "connectivity.probe"],
    modes: ["mock", "shadow", "live"],
    requires_lease: true,
  };
}

/**
 * Check gateway health
 */
export async function checkGatewayHealth(
  config: ZulipGatewayConfig = DEFAULT_GATEWAY_CONFIG
): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  mode: ZulipMode;
  connectivity: {
    reachable: boolean;
    latency_ms: number;
  };
}> {
  const connectivity = await probeZulipConnectivity(config);
  const stats = await import("./zulip-send.js").then((m) => m.getSendStats());

  let status: "healthy" | "degraded" | "unhealthy" = "unhealthy";

  if (config.mode === "mock") {
    // Mock mode is always healthy (no external dependency)
    status = "healthy";
  } else if (connectivity.reachable) {
    status = "healthy";
  } else if (stats.total_messages_sent > 0) {
    status = "degraded";
  }

  return {
    status,
    mode: config.mode,
    connectivity: {
      reachable: connectivity.reachable,
      latency_ms: connectivity.latency_ms,
    },
  };
}
