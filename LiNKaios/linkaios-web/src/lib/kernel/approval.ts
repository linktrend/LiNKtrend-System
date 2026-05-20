/**
 * LiNKaios kernel — Approval hooks for require_approval stages
 *
 * Implements CONTRACTS_MVO.md §4.4, §7:
 * - Approval inbox keyed on (run_id, stage_id)
 * - Grant/reject decisions
 * - Timeout handling (24h default)
 */

import { createSupabaseServiceClient } from "@linktrend/db";
import type { SupabaseClient } from "@linktrend/db";
import type { Env } from "@linktrend/shared-config";
import type { ApprovalRecord } from "./types";

export interface ApprovalDecision {
  approval_id: string;
  decision: "granted" | "rejected";
  decided_by_actor_id: string;
  reason?: string;
}

/**
 * List pending approvals for a tenant.
 */
export async function listPendingApprovals(
  env: Env,
  tenantId: string,
): Promise<ApprovalRecord[]> {
  const supabase = createSupabaseServiceClient(env);

  const { data, error } = await supabase
    .schema("linkaios_kernel").from("approvals")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("requested_at", { ascending: false });

  if (error) throw new Error(`Failed to list approvals: ${error.message}`);
  return (data || []) as ApprovalRecord[];
}

/**
 * Get a single approval by ID.
 */
export async function getApproval(
  env: Env,
  approvalId: string,
): Promise<ApprovalRecord | null> {
  const supabase = createSupabaseServiceClient(env);

  const { data, error } = await supabase
    .schema("linkaios_kernel").from("approvals")
    .select("*")
    .eq("approval_id", approvalId)
    .single();

  if (error || !data) return null;
  return data as ApprovalRecord;
}

/**
 * Get approval for a specific run/stage.
 */
export async function getStageApproval(
  env: Env,
  runId: string,
  stageId: string,
): Promise<ApprovalRecord | null> {
  const supabase = createSupabaseServiceClient(env);

  const { data, error } = await supabase
    .schema("linkaios_kernel").from("approvals")
    .select("*")
    .eq("run_id", runId)
    .eq("stage_id", stageId)
    .single();

  if (error || !data) return null;
  return data as ApprovalRecord;
}

/**
 * Grant or reject an approval.
 * Updates the approval record and triggers lease grant in LinkSkills.
 */
export async function decideApproval(
  env: Env,
  decision: ApprovalDecision,
): Promise<ApprovalRecord> {
  const supabase = createSupabaseServiceClient(env);

  // Get current approval
  const approval = await getApproval(env, decision.approval_id);
  if (!approval) {
    throw new ApprovalError("Approval not found");
  }
  if (approval.status !== "pending") {
    throw new ApprovalError(`Approval already ${approval.status}`);
  }
  if (new Date(approval.expires_at) < new Date()) {
    // Auto-timeout
    await markApprovalTimedOut(supabase, decision.approval_id);
    throw new ApprovalError("Approval has timed out");
  }

  // Update approval decision
  const { error } = await supabase.schema("linkaios_kernel").rpc("decide_approval", {
    p_approval_id: decision.approval_id,
    p_decision: decision.decision,
    p_decided_by_actor_id: decision.decided_by_actor_id,
    p_reason: decision.reason || null,
  });

  if (error) {
    throw new ApprovalError(`Failed to record decision: ${error.message}`);
  }

  // If granted, grant the lease in LinkSkills
  if (decision.decision === "granted" && approval.lease_id) {
    const { error: grantError } = await supabase.schema("linkskills").rpc("grant_lease", {
      p_lease_id: approval.lease_id,
      p_decision_status: "granted",
      p_reason: decision.reason || "Approved by operator",
      p_ttl_seconds: 300, // 5 minutes
    });

    if (grantError) {
      // Don't fail the approval, but log it
      console.error(`Failed to grant lease ${approval.lease_id}: ${grantError.message}`);
    }
  }

  // Return updated approval
  const updated = await getApproval(env, decision.approval_id);
  if (!updated) {
    throw new ApprovalError("Failed to load updated approval");
  }

  return updated;
}

/**
 * Mark expired approvals as timed_out.
 * Should be called by a scheduled job.
 */
export async function expireStaleApprovals(env: Env): Promise<number> {
  const supabase = createSupabaseServiceClient(env);

  const { data, error } = await supabase
    .schema("linkaios_kernel").from("approvals")
    .select("approval_id")
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());

  if (error || !data) {
    console.error("Failed to find expired approvals:", error);
    return 0;
  }

  let count = 0;
  for (const row of data) {
    const { error: updateError } = await supabase.schema("linkaios_kernel").rpc("decide_approval", {
      p_approval_id: row.approval_id as string,
      p_decision: "timed_out",
      p_decided_by_actor_id: "system",
      p_reason: "Approval window expired (24 hours)",
    });

    if (!updateError) {
      count++;
    }
  }

  return count;
}

async function markApprovalTimedOut(
  supabase: SupabaseClient,
  approvalId: string,
): Promise<void> {
  await supabase.schema("linkaios_kernel").rpc("decide_approval", {
    p_approval_id: approvalId,
    p_decision: "timed_out",
    p_decided_by_actor_id: "system",
    p_reason: "Approval window expired (24 hours)",
  });
}

export class ApprovalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovalError";
  }
}
