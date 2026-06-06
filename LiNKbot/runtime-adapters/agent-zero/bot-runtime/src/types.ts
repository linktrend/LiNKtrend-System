/**
 * Agent Zero runtime adapter types (LiNKbot adapter contract, Wave 2.2).
 */

import { z } from "zod";

export const AgentZeroSessionStateSchema = z.enum([
  "initializing",
  "mission_assigned",
  "lease_pending",
  "executing",
  "emitting_audit",
  "completed",
  "failed",
  "terminated",
]);
export type AgentZeroSessionState = z.infer<typeof AgentZeroSessionStateSchema>;

export const AgentZeroMissionRequestSchema = z.object({
  tenant_id: z.string().min(1),
  run_id: z.string().uuid(),
  stage_id: z.string().min(1),
  role_id: z.string().min(1),
  lane_id: z.string().min(1),
  inputs: z.record(z.string(), z.unknown()).default({}),
  reasoning_kind: z.string().optional(),
  correlation_id: z.string().min(1),
});
export type AgentZeroMissionRequest = z.infer<typeof AgentZeroMissionRequestSchema>;

export const AgentZeroMissionResultSchema = z.object({
  session_id: z.string().uuid(),
  lane_id: z.string().min(1),
  outputs: z.record(z.string(), z.unknown()),
  model_run_id: z.string().min(1),
  tokens_in: z.number().int().nonnegative(),
  tokens_out: z.number().int().nonnegative(),
  lease_ids: z.array(z.string()),
  audit_event_ids: z.array(z.string()),
  failure: z
    .object({
      code: z.string(),
      plane: z.literal("linkbot"),
      message: z.string(),
      retryable: z.boolean(),
      occurred_at: z.string(),
    })
    .optional(),
});
export type AgentZeroMissionResult = z.infer<typeof AgentZeroMissionResultSchema>;

export const AgentZeroAdapterConfigSchema = z.object({
  worker_endpoint: z.string().url(),
  linkskills_endpoint: z.string().url(),
  request_timeout_ms: z.number().int().positive().default(120_000),
  lease_ttl_seconds: z.number().int().positive().default(300),
});
export type AgentZeroAdapterConfig = z.infer<typeof AgentZeroAdapterConfigSchema>;

export interface AgentZeroSessionContext {
  session_id: string;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  role_id: string;
  lane_id: string;
  state: AgentZeroSessionState;
  lease_ids: string[];
  audit_event_ids: string[];
  model_run_id?: string;
  created_at: string;
  updated_at: string;
}

/** LiNKbot adapter contract surface (session, mission, lease, event, terminate). */
export interface AgentZeroRuntimeAdapter {
  openSession(request: AgentZeroMissionRequest): AgentZeroSessionContext;
  assignMission(
    session: AgentZeroSessionContext,
    request: AgentZeroMissionRequest,
  ): Promise<AgentZeroMissionResult>;
  requestLease(
    session: AgentZeroSessionContext,
    capability: string,
    arguments_: Record<string, unknown>,
  ): Promise<string | null>;
  emitEvent(
    session: AgentZeroSessionContext,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<string | null>;
  terminate(session: AgentZeroSessionContext, reason: string): Promise<void>;
}
