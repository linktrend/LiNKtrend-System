/**
 * LiNKbot Runtime Type Definitions
 *
 * Per CONTRACTS_MVO.md §6.1 - LiNKaios ↔ LiNKbot (reasoning dispatch)
 */

import { z } from "zod";
import {
  BotReasonRequestSchema,
  BotReasonResultSchema,
  FailureReportSchema,
  LinkBotRoleAttachmentSchema,
  LinkSitesV2RoleIdSchema,
} from "./local-types.js";

// Re-export core types for runtime use
export type BotReasonRequest = import("./local-types.js").BotReasonRequest;
export type BotReasonResult = import("./local-types.js").BotReasonResult;
export type FailureReport = import("./local-types.js").FailureReport;
export type LinkBotRoleAttachment = import("./local-types.js").LinkBotRoleAttachment;
export type LinkSitesV2RoleId = import("./local-types.js").LinkSitesV2RoleId;

/**
 * Bot session state tracking
 */
export const BotSessionStateSchema = z.enum([
  "initializing",
  "idle",
  "mission_assigned",
  "reasoning",
  "awaiting_lease",
  "awaiting_context",
  "emitting_audit",
  "completed",
  "failed",
  "cleanup",
]);
export type BotSessionState = z.infer<typeof BotSessionStateSchema>;

/**
 * Session refs structure
 */
export const SessionRefsSchema = z.object({
  lease_ids: z.array(z.string()).default([]),
  context_request_id: z.string().optional(),
  audit_event_ids: z.array(z.string()).default([]),
  model_run_id: z.string().optional(),
});
export type SessionRefs = z.infer<typeof SessionRefsSchema>;

/**
 * Mission context
 */
export const MissionContextSchema = z.object({
  reasoning_kind: z.string().min(1),
  inputs: z.record(z.string(), z.unknown()),
  model_routing_profile: z.string().min(1),
});
export type MissionContext = z.infer<typeof MissionContextSchema>;

/**
 * Session context for a running bot
 */
export const BotSessionContextSchema = z.object({
  session_id: z.string().uuid(),
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  role_id: z.string().min(1),
  state: BotSessionStateSchema,
  mission: MissionContextSchema,
  refs: SessionRefsSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  failure: FailureReportSchema.optional(),
});
export type BotSessionContext = z.infer<typeof BotSessionContextSchema>;

/**
 * Role resolution result
 */
export const RoleResolutionResultSchema = z.object({
  role_id: z.string().min(1),
  role_config: LinkBotRoleAttachmentSchema,
  allowed_capabilities: z.array(z.string()),
  allowed_skills: z.array(z.string()),
  model_policy: z.object({
    model_routing_profile: z.string(),
    tools: z.array(z.string()).optional(),
  }),
  resolved_at: z.string().datetime(),
});
export type RoleResolutionResult = z.infer<typeof RoleResolutionResultSchema>;

/**
 * Lease request from bot to LinkSkills
 */
export const BotLeaseRequestSchema = z.object({
  session_id: z.string().uuid(),
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  capability: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
  idempotency_key: z.string().min(1),
  requested_by_role: z.string().min(1),
});
export type BotLeaseRequest = z.infer<typeof BotLeaseRequestSchema>;

/**
 * Query scope for context requests
 */
export const QueryScopeSchema = z.object({
  lead_id: z.string().optional(),
  module: z.string().optional(),
  time_range: z
    .object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    })
    .optional(),
});
export type QueryScope = z.infer<typeof QueryScopeSchema>;

/**
 * Context request from bot to LiNKbrain
 */
export const BotContextRequestSchema = z.object({
  session_id: z.string().uuid(),
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  role_id: z.string().min(1),
  context_types: z.array(z.enum(["memory", "audit", "provenance"])),
  query_scope: QueryScopeSchema,
});
export type BotContextRequest = z.infer<typeof BotContextRequestSchema>;

/**
 * OpenClaw adapter configuration
 */
export const OpenClawAdapterConfigSchema = z.object({
  engine_endpoint: z.string().url(),
  linkskills_endpoint: z.string().url(),
  linkbrain_endpoint: z.string().url(),
  linkautowork_endpoint: z.string().url(),
  default_model_profile: z.string().default("gpt-4o-mini"),
  max_reasoning_time_ms: z.number().int().positive().default(300000),
  lease_ttl_seconds: z.number().int().positive().default(300),
  default_execution_mode: z.enum(["development", "shadow", "live"]).default("development"),
  audit_emit_timeout_ms: z.number().int().positive().default(5000),
});
export type OpenClawAdapterConfig = z.infer<typeof OpenClawAdapterConfigSchema>;

/**
 * Adapter health status
 */
export const AdapterHealthStatusSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  engine_connected: z.boolean(),
  linkskills_reachable: z.boolean(),
  linkbrain_reachable: z.boolean(),
  linkautowork_reachable: z.boolean(),
  last_check_at: z.string().datetime(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type AdapterHealthStatus = z.infer<typeof AdapterHealthStatusSchema>;

/**
 * Mission result with full provenance
 */
export const MissionResultSchema = z.object({
  session_id: z.string().uuid(),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  outputs: z.record(z.string(), z.unknown()),
  provenance: z.object({
    model_run_id: z.string(),
    tokens_in: z.number().int(),
    tokens_out: z.number().int(),
    reasoning_duration_ms: z.number().int(),
    context_refs: z.array(z.string()),
    lease_refs: z.array(z.string()),
    audit_refs: z.array(z.string()),
  }),
  completed_at: z.string().datetime(),
  success: z.boolean(),
  failure: FailureReportSchema.optional(),
});
export type MissionResult = z.infer<typeof MissionResultSchema>;
