/**
 * Zulip Send Operations
 *
 * Per CONTRACTS_MVO.md §0.A.5:
 * - Default mode is mock (no real sends)
 * - Shadow mode validates connectivity only
 * - Live mode disabled in MVO
 * - All sends lease-gated when not in mock mode
 */

import {
  ZulipMessagePayload,
  ZulipSendResult,
  ZulipConnectivityResult,
  ZulipGatewayConfig,
  ZulipMode,
} from "./types.js";
import { hasRequiredLease } from "./zulip-payload.js";

// Track message statistics
let stats = {
  sent: 0,
  failed: 0,
  lastSendAt: null as string | null,
};

/**
 * Get current send statistics
 */
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

/**
 * Reset send statistics (for testing)
 */
export function resetSendStats(): void {
  stats = {
    sent: 0,
    failed: 0,
    lastSendAt: null,
  };
}

/**
 * Send message to Zulip
 *
 * Per CONTRACTS_MVO.md §0.A.5:
 * - mock: Log only, no real send
 * - shadow: Validate connectivity, don't send
 * - live: DISABLED in MVO
 */
export async function sendZulipMessage(
  payload: ZulipMessagePayload,
  config: ZulipGatewayConfig
): Promise<ZulipSendResult> {
  const now = new Date().toISOString();

  // Validate lease requirement for non-mock modes
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

  // MVO: Live mode is disabled
  if (effectiveMode === "live") {
    stats.failed++;
    return {
      success: false,
      mock_sent: false,
      mode: effectiveMode,
      error: {
        code: "LIVE_MODE_DISABLED",
        message: "Live Zulip messaging disabled in MVO. Use mock or shadow mode.",
      },
      sent_at: now,
    };
  }

  // Mock mode: Log and return success (no real send)
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

  // Shadow mode: Check connectivity but don't send
  if (effectiveMode === "shadow") {
    const connectivity = await probeZulipConnectivity(config);

    if (!connectivity.reachable) {
      stats.failed++;
      return {
        success: false,
        mock_sent: false,
        mode: effectiveMode,
        error: {
          code: "CONNECTIVITY_FAILED",
          message: `Zulip connectivity failed: ${connectivity.error}`,
        },
        sent_at: now,
      };
    }

    // Shadow success - would have sent if live
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

  // Should never reach here
  stats.failed++;
  return {
    success: false,
    mock_sent: false,
    mode: effectiveMode,
    error: {
      code: "UNKNOWN_MODE",
      message: `Unknown mode: ${effectiveMode}`,
    },
    sent_at: now,
  };
}

/**
 * Probe Zulip connectivity
 *
 * Per CONTRACTS_MVO.md §0.A.5 - connectivity.probe operation
 */
export async function probeZulipConnectivity(
  config: ZulipGatewayConfig
): Promise<ZulipConnectivityResult> {
  const startTime = Date.now();
  const now = new Date().toISOString();

  try {
    // Zulip API endpoint for getting server settings
    const response = await fetch(`${config.base_url}/api/v1/server_settings`, {
      method: "GET",
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });

    const latency_ms = Date.now() - startTime;

    if (!response.ok) {
      return {
        reachable: false,
        authenticated: false,
        latency_ms,
        error: `HTTP ${response.status}: ${response.statusText}`,
        checked_at: now,
      };
    }

    const data = (await response.json()) as { zulip_version?: string };

    return {
      reachable: true,
      authenticated: false, // Server settings doesn't require auth
      server_version: data.zulip_version,
      latency_ms,
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

/**
 * Send run notification
 */
export async function sendRunNotification(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string,
  notification_type: "started" | "completed" | "failed" | "awaiting_approval",
  message: string,
  config: ZulipGatewayConfig,
  details?: Record<string, unknown>,
  lease_id?: string
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
    lease_id
  );

  return sendZulipMessage(payload, config);
}

/**
 * Send batch of messages (for bulk notifications)
 */
export async function sendBatchMessages(
  payloads: ZulipMessagePayload[],
  config: ZulipGatewayConfig
): Promise<ZulipSendResult[]> {
  // Send sequentially to avoid rate limits
  const results: ZulipSendResult[] = [];

  for (const payload of payloads) {
    const result = await sendZulipMessage(payload, config);
    results.push(result);

    // Small delay between sends
    if (payloads.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
