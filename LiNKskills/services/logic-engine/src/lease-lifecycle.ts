/**
 * LinkSkills lease lifecycle implementation.
 *
 * Implements §6.2 CONTRACTS_MVO.md:
 * - skills.lease.request: Request a lease (idempotent)
 * - skills.lease.grant: Grant/deny/require_approval
 * - skills.lease.execute: Execute the capability (idempotent)
 *
 * Lifecycle: requested → (granted | denied | requires_approval) → (executed | expired | revoked)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import type {
  LeaseRequest,
  LeaseDecision,
  LeaseDecisionStatus,
  LeaseExecuteRequest,
  LeaseExecuteResult,
  FailureReport,
} from "@linktrend/linklogic-sdk";
import { checkKillSwitch } from "./safety.js";
import {
  getCapabilityPolicy,
  capabilityExists,
  isWriteCapableLinksitesV2Capability,
} from "./capability-catalog.js";
import { CapabilityExecutionError } from "./capability-handlers.js";
import type { LeaseRequestResult, LeaseLedgerRow, LeaseStatus } from "./types.js";
import { emitLeaseRequested, emitLeaseGranted, emitLeaseDenied, emitLeaseExecuted, emitCapabilityOutput } from "./audit-events.js";
import {
  checkIdempotency,
  isValidLeaseIdempotencyKey,
  storeIdempotencyResult,
} from "./idempotency.js";

const DEFAULT_LEASE_TTL_SECONDS = 300;  // 5 minutes

/**
 * Request a lease (skills.lease.request).
 *
 * Per §6.2: Idempotent based on (tenant_id, idempotency_key).
 * If a lease with the same idempotency key exists, return it.
 * Checks kill switch and returns denied if tripped.
 */
export async function requestLease(
  client: SupabaseClient,
  env: Env,
  request: LeaseRequest,
): Promise<LeaseRequestResult> {
  if (!isValidLeaseIdempotencyKey(request.idempotency_key, request.run_id, request.stage_id, request.capability)) {
    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkskills",
      message: "idempotency_key must match ${run_id}:${stage_id}:${capability}",
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: "",
      status: "denied",
      is_existing: false,
      kill_switch_state: "open",
      failure,
    };
  }

  // Validate capability exists
  const exists = await capabilityExists(client, request.capability);
  if (!exists) {
    const failure: FailureReport = {
      code: "MANIFEST_CAPABILITY_UNKNOWN",
      plane: "linkskills",
      message: `Capability "${request.capability}" not found in catalog`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: "",
      status: "denied",
      is_existing: false,
      kill_switch_state: "open",
      failure,
    };
  }

  // LinkSites v2: live-mode writes are disabled by default in MVO.
  // Read-only capabilities remain eligible for shadow/live-equivalent reads.
  const requestedMode = typeof request.arguments?.mode === "string"
    ? String(request.arguments.mode).toLowerCase()
    : "";
  if (requestedMode === "live" && isWriteCapableLinksitesV2Capability(request.capability)) {
    const failure: FailureReport = {
      code: "LEASE_DENIED",
      plane: "linkskills",
      message: `Live mode is disabled by default for capability "${request.capability}"`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: "",
      status: "denied",
      is_existing: false,
      kill_switch_state: "open",
      failure,
    };
  }

  // Check capability kill switch and global level-2 halt before proceeding.
  const killCheck = await checkKillSwitch(client, request.tenant_id, request.capability);
  const killTripped = killCheck.state === "tripped";

  // Call RPC to create or return existing lease
  const { data: rpcData, error: rpcError } = await client
    .schema("linkskills")
    .rpc("request_lease", {
      p_tenant_id: request.tenant_id,
      p_run_id: request.run_id,
      p_stage_id: request.stage_id,
      p_capability_id: request.capability,
      p_arguments: request.arguments,
      p_idempotency_key: request.idempotency_key,
      p_actor_kind: request.actor.actor_kind,
      p_actor_id: request.actor.actor_id,
    });

  if (rpcError) {
    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkskills",
      message: `Database error: ${rpcError.message}`,
      retryable: true,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: "",
      status: "denied",
      is_existing: false,
      kill_switch_state: killTripped ? "tripped" : "open",
      failure,
    };
  }

  const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!result || typeof result !== "object") {
    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkskills",
      message: "Invalid response from request_lease RPC",
      retryable: true,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: "",
      status: "denied",
      is_existing: false,
      kill_switch_state: killTripped ? "tripped" : "open",
      failure,
    };
  }

  const { lease_id, status, is_existing, kill_switch_state } = result as {
    lease_id: string;
    status: LeaseStatus;
    is_existing: boolean;
    kill_switch_state: "open" | "tripped";
  };

  // Emit lease.requested audit event (only for new leases)
  if (!is_existing) {
    await emitLeaseRequested(env, lease_id, request, kill_switch_state);
  }

  // If kill switch/global halt tripped, emit lease.denied.
  if (killTripped && status === "denied") {
    const failure: FailureReport = {
      code: "LEASE_KILL_SWITCH",
      plane: "linkskills",
      message: killCheck.reason ?? `Kill switch tripped for capability "${request.capability}"`,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    await emitLeaseDenied(env, lease_id, request, "Kill switch tripped", failure);

    return {
      lease_id,
      status: "denied",
      is_existing,
      kill_switch_state,
      failure,
    };
  }

  // If newly requested (not existing), apply policy to determine grant/deny/requires_approval
  if (!is_existing && status === "requested") {
    const policy = await getCapabilityPolicy(client, request.capability, request.tenant_id);

    if (policy === "deny_all") {
      // Auto-deny
      await denyLease(client, lease_id, "Policy denies all requests for this capability");
      await emitLeaseDenied(env, lease_id, request, "Policy: deny_all");
      return {
        lease_id,
        status: "denied",
        is_existing: false,
        kill_switch_state,
      };
    }

    if (policy === "auto_grant") {
      // Auto-grant
      const granted = await grantLease(client, lease_id, "granted", "Policy: auto_grant", DEFAULT_LEASE_TTL_SECONDS);
      if (granted) {
        const decision: LeaseDecision = {
          lease_id,
          status: "granted",
          expires_at: new Date(Date.now() + DEFAULT_LEASE_TTL_SECONDS * 1000).toISOString(),
          kill_switch_state,
        };
        await emitLeaseGranted(env, lease_id, request, decision);
        return {
          lease_id,
          status: "granted",
          is_existing: false,
          kill_switch_state,
        };
      }
    }

    if (policy === "require_approval") {
      // Transition to requires_approval
      await requireApproval(client, lease_id, "Policy requires operator approval");
      return {
        lease_id,
        status: "requires_approval",
        is_existing: false,
        kill_switch_state,
      };
    }
  }

  // Map internal status to decision status
  const decisionStatus: Extract<LeaseStatus, "granted" | "denied" | "requires_approval" | "requested"> =
    status === "granted" || status === "denied" || status === "requires_approval" || status === "requested"
      ? status
      : "requested";

  return {
    lease_id,
    status: decisionStatus,
    is_existing,
    kill_switch_state,
  };
}

/**
 * Grant a lease (transition from requested to granted).
 */
export async function grantLease(
  client: SupabaseClient,
  lease_id: string,
  decision_status: "granted" | "requires_approval",
  reason: string,
  ttl_seconds: number = DEFAULT_LEASE_TTL_SECONDS,
): Promise<boolean> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("grant_lease", {
      p_lease_id: lease_id,
      p_decision_status: decision_status,
      p_reason: reason,
      p_ttl_seconds: ttl_seconds,
    });

  if (error || !data) {
    console.error("Failed to grant lease:", error?.message);
    return false;
  }

  return Boolean(data);
}

/**
 * Mark a lease as requiring approval.
 */
export async function requireApproval(
  client: SupabaseClient,
  lease_id: string,
  reason: string,
): Promise<boolean> {
  return grantLease(client, lease_id, "requires_approval", reason, 0);
}

/**
 * Deny a lease.
 */
export async function denyLease(
  client: SupabaseClient,
  lease_id: string,
  reason: string,
): Promise<boolean> {
  const { data, error } = await client
    .schema("linkskills")
    .rpc("deny_lease", {
      p_lease_id: lease_id,
      p_reason: reason,
    });

  if (error) {
    console.error("Failed to deny lease:", error.message);
    return false;
  }

  return Boolean(data);
}

/**
 * Get a lease by ID.
 */
export async function getLease(
  client: SupabaseClient,
  lease_id: string,
): Promise<{ data: LeaseLedgerRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("lease_requests")
    .select("*")
    .eq("lease_id", lease_id)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: (data ?? null) as LeaseLedgerRow | null, error: null };
}

/**
 * Get a lease by idempotency key.
 */
export async function getLeaseByIdempotencyKey(
  client: SupabaseClient,
  tenant_id: string,
  idempotency_key: string,
): Promise<{ data: LeaseLedgerRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("lease_requests")
    .select("*")
    .eq("tenant_id", tenant_id)
    .eq("idempotency_key", idempotency_key)
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: (data ?? null) as LeaseLedgerRow | null, error: null };
}

/**
 * List leases for a run.
 */
export async function listLeasesForRun(
  client: SupabaseClient,
  run_id: string,
): Promise<{ data: LeaseLedgerRow[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkskills")
    .from("lease_requests")
    .select("*")
    .eq("run_id", run_id)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data ?? []) as LeaseLedgerRow[], error: null };
}

/**
 * Execute a lease (skills.lease.execute).
 *
 * Per §6.2:
 * - Validates lease is granted and not expired
 * - Records execution idempotently
 * - Emits lease.executed + output-level audit events
 */
export async function executeLease(
  client: SupabaseClient,
  env: Env,
  request: LeaseExecuteRequest,
  capabilityHandler: (args: Record<string, unknown>, leaseContext: unknown) => Promise<Record<string, unknown>>,
): Promise<LeaseExecuteResult> {
  // Get the lease
  const { data: lease, error: leaseError } = await getLease(client, request.lease_id);

  if (leaseError || !lease) {
    const failure: FailureReport = {
      code: "LEASE_REQUEST_INVALID",
      plane: "linkskills",
      message: leaseError?.message ?? "Lease not found",
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: request.lease_id,
      capability: "",
      result: {},
      ledger_entry_id: "",
      audit_event_id: "",
      failure,
    };
  }
  const leaseCapability = (lease as unknown as { capability?: string; capability_id?: string }).capability_id
    ?? (lease as unknown as { capability?: string }).capability
    ?? "";

  // Validate idempotency key matches
  if (lease.idempotency_key !== request.idempotency_key) {
    const failure: FailureReport = {
      code: "LEASE_IDEMPOTENCY_CONFLICT",
      plane: "linkskills",
      message: "Idempotency key mismatch",
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: request.lease_id,
      capability: leaseCapability,
      result: {},
      ledger_entry_id: lease.lease_id,
      audit_event_id: lease.audit_event_id ?? "",
      failure,
    };
  }

  const idempotency = await checkIdempotency(
    client,
    lease.tenant_id,
    request.idempotency_key,
    leaseCapability,
    lease.arguments,
  );

  if (idempotency.state === "conflict") {
    const failure: FailureReport = {
      code: "LEASE_IDEMPOTENCY_CONFLICT",
      plane: "linkskills",
      message: idempotency.reason,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };
    return {
      lease_id: request.lease_id,
      capability: leaseCapability,
      result: {},
      ledger_entry_id: lease.lease_id,
      audit_event_id: "",
      failure,
    };
  }

  if (idempotency.state === "replay") {
    return {
      lease_id: lease.lease_id,
      capability: leaseCapability,
      result: idempotency.result,
      ledger_entry_id: idempotency.ledger_entry_id ?? lease.ledger_entry_id ?? lease.lease_id,
      audit_event_id: lease.audit_event_id ?? "",
    };
  }

  if (lease.status === "executed" && lease.execution_result) {
    return {
      lease_id: lease.lease_id,
      capability: leaseCapability,
      result: lease.execution_result,
      ledger_entry_id: lease.ledger_entry_id ?? lease.lease_id,
      audit_event_id: lease.audit_event_id ?? "",
    };
  }

  // Check lease is in granted state
  if (lease.status !== "granted" && lease.status !== "requires_approval") {
    let failureCode: FailureReport["code"] = "LEASE_DENIED";
    let message = `Lease status is "${lease.status}", expected "granted"`;

    if (lease.status === "expired") {
      failureCode = "LEASE_EXPIRED";
      message = "Lease has expired";
    }

    const failure: FailureReport = {
      code: failureCode,
      plane: "linkskills",
      message,
      retryable: false,
      occurred_at: new Date().toISOString(),
    };

    return {
      lease_id: request.lease_id,
      capability: leaseCapability,
      result: {},
      ledger_entry_id: lease.lease_id,
      audit_event_id: "",
      failure,
    };
  }

  // Check expiration
  if (lease.expires_at && new Date(lease.expires_at) < new Date()) {
    // Update status to expired
    await client
      .schema("linkskills")
      .from("lease_requests")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("lease_id", lease.lease_id);

    const failure: FailureReport = {
      code: "LEASE_EXPIRED",
      plane: "linkskills",
      message: "Lease has expired",
      retryable: false,
      occurred_at: new Date().toISOString(),
    };

    return {
      lease_id: request.lease_id,
      capability: leaseCapability,
      result: {},
      ledger_entry_id: lease.lease_id,
      audit_event_id: "",
      failure,
    };
  }

  // Execute the capability
  const context = {
    tenant_id: lease.tenant_id,
    run_id: lease.run_id,
    stage_id: lease.stage_id,
    lease_id: lease.lease_id,
    actor: { actor_kind: lease.actor_kind, actor_id: lease.actor_id },
    idempotency_key: lease.idempotency_key,
  };

  try {
    const result = await capabilityHandler(lease.arguments, context);

    // Record execution
    const auditEventId = crypto.randomUUID();
    const { data: execData, error: execError } = await client
      .schema("linkskills")
      .rpc("record_execution", {
        p_lease_id: lease.lease_id,
        p_idempotency_key: lease.idempotency_key,
        p_result: result,
        p_audit_event_id: auditEventId,
      });

    if (execError) {
      const failure: FailureReport = {
        code: "KERNEL_PERSISTENCE_FAILED",
        plane: "linkskills",
        message: `Failed to record execution: ${execError.message}`,
        retryable: true,
        occurred_at: new Date().toISOString(),
      };

      return {
        lease_id: request.lease_id,
        capability: leaseCapability,
        result,
        ledger_entry_id: lease.lease_id,
        audit_event_id: "",
        failure,
      };
    }

    const execResult = Array.isArray(execData) ? execData[0] : execData;
    const isDuplicate = execResult?.is_duplicate ?? false;

    // Build execute result
    const executeResult: LeaseExecuteResult = {
      lease_id: lease.lease_id,
      capability: leaseCapability,
      result,
      ledger_entry_id: lease.lease_id,
      audit_event_id: auditEventId,
    };

    await storeIdempotencyResult(
      client,
      lease.tenant_id,
      lease.idempotency_key,
      leaseCapability,
      lease.arguments,
      result,
      executeResult.ledger_entry_id,
    );

    // Emit audit events (unless duplicate - already emitted)
    if (!isDuplicate) {
      const originalRequest: LeaseRequest = {
        tenant_id: lease.tenant_id,
        run_id: lease.run_id,
        stage_id: lease.stage_id,
        capability: leaseCapability,
        arguments: lease.arguments,
        idempotency_key: lease.idempotency_key,
        actor: {
          actor_kind: lease.actor_kind,
          actor_id: lease.actor_id,
        },
      };

      // Emit lease.executed
      const executedResult = await emitLeaseExecuted(env, lease.lease_id, originalRequest, executeResult);
      if (executedResult.error) {
        console.error("Failed to emit lease.executed:", executedResult.error.message);
      }

      // Emit output-level event (crm.upserted, plane.project.created, etc.)
      const outputResult = await emitCapabilityOutput(env, lease.lease_id, originalRequest, executeResult);
      if (outputResult.error) {
        console.error("Failed to emit capability output event:", outputResult.error.message);
      }
    }

    return executeResult;
  } catch (err) {
    const capabilityError = err instanceof CapabilityExecutionError
      ? err
      : null;
    const msg = capabilityError?.message ?? (err instanceof Error ? err.message : String(err));
    const failure: FailureReport = {
      code: capabilityError?.code ?? "WORKFLOW_STEP_FAILED",
      plane: "linkskills",
      message: `Capability execution failed: ${msg}`,
      retryable: capabilityError?.retryable ?? true,
      occurred_at: new Date().toISOString(),
    };

    return {
      lease_id: request.lease_id,
      capability: leaseCapability,
      result: {},
      ledger_entry_id: lease.lease_id,
      audit_event_id: "",
      failure,
    };
  }
}

export async function expireLeases(
  client: SupabaseClient,
  now: Date = new Date(),
): Promise<number> {
  const nowIso = now.toISOString();
  const { data, error } = await client
    .schema("linkskills")
    .from("lease_requests")
    .update({ status: "expired", updated_at: nowIso })
    .in("status", ["granted", "requires_approval"])
    .lte("expires_at", nowIso)
    .select("lease_id");

  if (error) return 0;
  return Array.isArray(data) ? data.length : 0;
}

export async function revokeLease(
  client: SupabaseClient,
  lease_id: string,
  reason: string,
): Promise<boolean> {
  const { error } = await client
    .schema("linkskills")
    .from("lease_requests")
    .update({ status: "revoked", decision_reason: reason, revoked_at: new Date().toISOString() })
    .eq("lease_id", lease_id)
    .in("status", ["requested", "granted", "requires_approval"]);

  return !error;
}
