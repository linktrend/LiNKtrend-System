/**
 * LiNKbot Zulip Temporary Gateway
 *
 * Per CONTRACTS_MVO.md §0.A.5 and LINKBOT_ADAPTER_PLAN.md:
 * - This is a TEMPORARY gateway until OpenClaw adopts native Zulip support
 * - Routes via cap.zulip.run_messaging only
 * - Mission-aware (carries tenant, run, stage, role context)
 * - Mock/shadow modes only for MVO (live disabled)
 * - Lease-gated when not in mock mode
 * - Does NOT become generic capability ownership
 */

// Types
export type {
  ZulipMode,
  ZulipGatewayConfig,
  ZulipMissionContext,
  ZulipMessagePayload,
  ZulipRunNotification,
  ZulipSendResult,
  ZulipConnectivityResult,
  GatewayDispatchRequest,
  GatewayDispatchResult,
  ZulipGatewayHealth,
} from "./types.js";

// Payload builders
export {
  buildRunNotificationPayload,
  buildStatusUpdatePayload,
  buildOperatorAlertPayload,
  buildDebugPayload,
  validateZulipPayload,
  hasRequiredLease,
  redactPayloadForLogging,
} from "./zulip-payload.js";

// Send operations
export {
  sendZulipMessage,
  probeZulipConnectivity,
  sendRunNotification,
  sendBatchMessages,
  getSendStats,
  resetSendStats,
} from "./zulip-send.js";

// Mission resolution
export {
  buildMissionId,
  parseMissionId,
  resolveMissionFromContext,
  validateMissionContext,
  isSameMission,
  isSameRun,
  buildMissionDisplayName,
  buildTenantTopicPrefix,
} from "./resolve-mission-id.js";
export type { MissionId } from "./resolve-mission-id.js";

// Gateway dispatch
export {
  dispatchGatewayOperation,
  validateDispatchRequest,
  getGatewayCapabilities,
  checkGatewayHealth,
  DEFAULT_GATEWAY_CONFIG,
} from "./gateway-dispatch.js";
