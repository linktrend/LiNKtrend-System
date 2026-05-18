/**
 * Mission ID Resolution
 *
 * Per LINKBOT_ADAPTER_PLAN.md - Zulip messaging adapter must be mission-aware.
 * This module resolves mission identifiers for proper audit trail and context.
 */

import { ZulipMissionContext } from "./types.js";

/**
 * Mission identifier
 */
export interface MissionId {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  role_id: string;
  composite_id: string;
}

/**
 * Build composite mission ID
 */
export function buildMissionId(
  tenant_id: string,
  run_id: string,
  stage_id: string,
  role_id: string
): MissionId {
  return {
    tenant_id,
    run_id,
    stage_id,
    role_id,
    composite_id: `${tenant_id}:${run_id}:${stage_id}:${role_id}`,
  };
}

/**
 * Parse composite mission ID
 */
export function parseMissionId(composite_id: string): MissionId | null {
  const parts = composite_id.split(":");
  if (parts.length !== 4) {
    return null;
  }

  return {
    tenant_id: parts[0],
    run_id: parts[1],
    stage_id: parts[2],
    role_id: parts[3],
    composite_id,
  };
}

/**
 * Resolve mission from context
 */
export function resolveMissionFromContext(context: ZulipMissionContext): MissionId {
  return buildMissionId(context.tenant_id, context.run_id, context.stage_id, context.role_id);
}

/**
 * Validate mission context
 */
export function validateMissionContext(context: unknown): {
  valid: boolean;
  errors: string[];
  mission_id?: MissionId;
} {
  const errors: string[] = [];

  if (!context || typeof context !== "object") {
    return { valid: false, errors: ["Context must be an object"] };
  }

  const ctx = context as Record<string, unknown>;

  if (!ctx.tenant_id || typeof ctx.tenant_id !== "string") {
    errors.push("tenant_id is required and must be a string");
  }

  if (!ctx.run_id || typeof ctx.run_id !== "string") {
    errors.push("run_id is required and must be a string");
  }

  if (!ctx.stage_id || typeof ctx.stage_id !== "string") {
    errors.push("stage_id is required and must be a string");
  }

  if (!ctx.role_id || typeof ctx.role_id !== "string") {
    errors.push("role_id is required and must be a string");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    mission_id: buildMissionId(
      ctx.tenant_id as string,
      ctx.run_id as string,
      ctx.stage_id as string,
      ctx.role_id as string
    ),
  };
}

/**
 * Check if two mission contexts are the same
 */
export function isSameMission(a: ZulipMissionContext, b: ZulipMissionContext): boolean {
  return (
    a.tenant_id === b.tenant_id &&
    a.run_id === b.run_id &&
    a.stage_id === b.stage_id &&
    a.role_id === b.role_id
  );
}

/**
 * Check if mission is in the same run
 */
export function isSameRun(a: ZulipMissionContext, b: ZulipMissionContext): boolean {
  return a.tenant_id === b.tenant_id && a.run_id === b.run_id;
}

/**
 * Build mission display name
 */
export function buildMissionDisplayName(context: ZulipMissionContext): string {
  return `${context.role_id} @ ${context.stage_id} (run: ${context.run_id.slice(0, 8)})`;
}

/**
 * Extract tenant-scoped mission prefix for topic names
 */
export function buildTenantTopicPrefix(tenant_id: string, run_id: string): string {
  return `${tenant_id.slice(0, 8)}-${run_id.slice(0, 8)}`;
}
