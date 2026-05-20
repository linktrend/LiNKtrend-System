/**
 * LiNKbrain Trace Intelligence — Operator-facing run/memory/audit trace views
 *
 * Provides:
 * - Cross-plane trace assembly for operator debugging
 * - Run-to-memory-to-audit lineage queries
 * - Operator-friendly status summaries
 *
 * Per WP-202: LiNKbrain Operator Intelligence
 */

import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";
import { z } from "zod";

import type { FailureReport } from "./contracts-mvo.js";

/* -------------------------------------------------------------------------- */
/* Trace Intelligence Types                                                    */
/* -------------------------------------------------------------------------- */

export const TraceEventSchema = z.object({
  event_id: z.string().uuid(),
  ts: z.string().datetime(),
  plane: z.enum(["linkaios", "linkbot", "linkskills", "linkautowork", "linkbrain"]),
  action: z.string().min(1),
  actor_kind: z.enum(["kernel", "plugin", "bot", "user", "system"]),
  actor_id: z.string().min(1),
  subject: z.object({
    run_id: z.string().uuid().optional(),
    stage_id: z.string().optional(),
    lease_id: z.string().optional(),
    workflow_run_id: z.string().optional(),
    lead_id: z.string().optional(),
    plugin_id: z.string().optional(),
  }),
  payload_summary: z.record(z.unknown()).optional(),
});
export type TraceEvent = z.infer<typeof TraceEventSchema>;

export const MemoryObjectReferenceSchema = z.object({
  memory_id: z.string().uuid(),
  type: z.enum(["lead_memory", "research_bundle", "episode_summary", "capability_lease_record", "workflow_run_record"]),
  state: z.enum(["active", "archived", "superseded", "expired", "pending_validation"]),
  created_at: z.string().datetime(),
  confidence: z.number().min(0).max(1),
  payload_summary: z.record(z.unknown()),
});
export type MemoryObjectReference = z.infer<typeof MemoryObjectReferenceSchema>;

export const CrossPlaneStageSummarySchema = z.object({
  stage_id: z.string().min(1),
  stage_name: z.string().min(1),
  responsible_plane: z.enum(["linkaios", "linkbot", "linkskills", "linkautowork", "linkbrain"]),
  status: z.enum(["pending", "dispatched", "running", "succeeded", "failed", "awaiting_approval", "skipped"]),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  duration_ms: z.number().int().min(0).optional(),
  // Cross-plane refs
  audit_event_ids: z.array(z.string().uuid()),
  lease_ids: z.array(z.string().uuid()),
  workflow_run_ids: z.array(z.string().uuid()),
  model_run_id: z.string().optional(),
  memory_object_ids: z.array(z.string().uuid()),
  // Failure info
  failure_code: z.string().optional(),
  failure_message: z.string().optional(),
});
export type CrossPlaneStageSummary = z.infer<typeof CrossPlaneStageSummarySchema>;

export const RunTraceSummarySchema = z.object({
  run_id: z.string().uuid(),
  tenant_id: z.string().min(1),
  plugin_id: z.string().min(1),
  work_request_type: z.string().min(1),
  status: z.enum(["pending", "running", "succeeded", "partial", "failed", "awaiting_approval", "cancelled"]),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  duration_ms: z.number().int().min(0).optional(),
  // Trace counts
  total_stages: z.number().int().min(0),
  completed_stages: z.number().int().min(0),
  failed_stages: z.number().int().min(0),
  // Cross-plane totals
  total_audit_events: z.number().int().min(0),
  total_leases: z.number().int().min(0),
  total_workflow_runs: z.number().int().min(0),
  total_memory_objects: z.number().int().min(0),
  // Lead ref
  lead_id: z.string().optional(),
  // Stages
  stages: z.array(CrossPlaneStageSummarySchema),
});
export type RunTraceSummary = z.infer<typeof RunTraceSummarySchema>;

export const OperatorBrainStatusSchema = z.object({
  // System health
  audit_ledger_health: z.enum(["healthy", "degraded", "unavailable"]),
  memory_store_health: z.enum(["healthy", "degraded", "unavailable"]),
  context_assembly_health: z.enum(["healthy", "degraded", "unavailable"]),
  // Recent activity (last 24h)
  recent_audit_events_count: z.number().int().min(0),
  recent_memory_writes_count: z.number().int().min(0),
  recent_context_assemblies_count: z.number().int().min(0),
  // Storage
  total_memory_objects: z.number().int().min(0),
  total_audit_events: z.number().int().min(0),
  // Errors
  recent_errors: z.array(z.object({
    ts: z.string().datetime(),
    plane: z.string(),
    code: z.string(),
    message: z.string(),
  })).optional(),
  checked_at: z.string().datetime(),
});
export type OperatorBrainStatus = z.infer<typeof OperatorBrainStatusSchema>;

/* -------------------------------------------------------------------------- */
/* Trace Query Result Types                                                    */
/* -------------------------------------------------------------------------- */

export interface RunTraceResult {
  trace: RunTraceSummary | null;
  audit_events: TraceEvent[];
  memory_objects: MemoryObjectReference[];
  failure?: FailureReport;
}

export interface LeadTraceResult {
  lead_id: string;
  tenant_id: string;
  runs: RunTraceSummary[];
  memory_objects: MemoryObjectReference[];
  total_audit_events: number;
  failure?: FailureReport;
}

export interface OperatorBrainStatusResult {
  status: OperatorBrainStatus | null;
  failure?: FailureReport;
}

/* -------------------------------------------------------------------------- */
/* Trace Intelligence Queries                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get a comprehensive trace summary for a run, including:
 * - Stage-by-stage cross-plane summary
 * - Associated audit events
 * - Memory objects created during the run
 */
export async function getRunTrace(
  env: Env,
  run_id: string,
  tenant_id?: string,
): Promise<RunTraceResult> {
  const client = createSupabaseServiceClient(env);

  // Query the trace summary RPC
  const { data: traceData, error: traceError } = await client
    .schema("linkbrain")
    .rpc("get_run_trace_summary", {
      p_run_id: run_id,
      p_tenant_id: tenant_id,
    });

  if (traceError) {
    return {
      trace: null,
      audit_events: [],
      memory_objects: [],
      failure: makeFailure("linkbrain", "TRACE_QUERY_FAILED", traceError.message, { pg_code: traceError.code }),
    };
  }

  // Query audit events for this run
  const { data: auditData, error: auditError } = await client
    .schema("linkbrain")
    .rpc("get_audit_events_for_run", {
      p_run_id: run_id,
      p_limit: 100,
    });

  if (auditError) {
    return {
      trace: null,
      audit_events: [],
      memory_objects: [],
      failure: makeFailure("linkbrain", "AUDIT_QUERY_FAILED", auditError.message, { pg_code: auditError.code }),
    };
  }

  // Query memory objects for this run
  const { data: memoryData, error: memoryError } = await client
    .schema("linkbrain")
    .rpc("get_memory_objects_for_run", {
      p_run_id: run_id,
    });

  if (memoryError) {
    return {
      trace: null,
      audit_events: [],
      memory_objects: [],
      failure: makeFailure("linkbrain", "MEMORY_QUERY_FAILED", memoryError.message, { pg_code: memoryError.code }),
    };
  }

  // Parse and return
  const trace = parseRunTraceSummary(traceData);
  const audit_events = parseAuditEvents(auditData);
  const memory_objects = parseMemoryReferences(memoryData);

  return {
    trace,
    audit_events,
    memory_objects,
  };
}

/**
 * Get a cross-run trace for a lead, showing all runs and their memory objects.
 */
export async function getLeadTrace(
  env: Env,
  tenant_id: string,
  lead_id: string,
): Promise<LeadTraceResult> {
  const client = createSupabaseServiceClient(env);

  // Query runs for this lead
  const { data: runsData, error: runsError } = await client
    .schema("linkbrain")
    .rpc("get_runs_for_lead", {
      p_tenant_id: tenant_id,
      p_lead_id: lead_id,
    });

  if (runsError) {
    return {
      lead_id,
      tenant_id,
      runs: [],
      memory_objects: [],
      total_audit_events: 0,
      failure: makeFailure("linkbrain", "LEAD_TRACE_FAILED", runsError.message, { pg_code: runsError.code }),
    };
  }

  // Query memory objects for this lead
  const { data: memoryData, error: memoryError } = await client
    .schema("linkbrain")
    .rpc("get_memory_objects_for_lead", {
      p_tenant_id: tenant_id,
      p_lead_id: lead_id,
    });

  if (memoryError) {
    return {
      lead_id,
      tenant_id,
      runs: [],
      memory_objects: [],
      total_audit_events: 0,
      failure: makeFailure("linkbrain", "LEAD_MEMORY_FAILED", memoryError.message, { pg_code: memoryError.code }),
    };
  }

  // Count audit events for this lead across all runs
  const { data: auditCountData, error: auditCountError } = await client
    .schema("linkbrain")
    .rpc("count_audit_events_for_lead", {
      p_tenant_id: tenant_id,
      p_lead_id: lead_id,
    });

  const runs = parseRunTraceSummaries(runsData);
  const memory_objects = parseMemoryReferences(memoryData);
  const total_audit_events = auditCountError ? 0 : parseInt(String(auditCountData ?? 0), 10);

  return {
    lead_id,
    tenant_id,
    runs,
    memory_objects,
    total_audit_events,
  };
}

/**
 * Get operator-facing LiNKbrain status.
 * Returns health indicators and recent activity counts.
 */
export async function getOperatorBrainStatus(
  env: Env,
  tenant_id?: string,
): Promise<OperatorBrainStatusResult> {
  const client = createSupabaseServiceClient(env);

  const { data, error } = await client
    .schema("linkbrain")
    .rpc("get_operator_brain_status", {
      p_tenant_id: tenant_id,
      p_lookback_hours: 24,
    });

  if (error) {
    return {
      status: null,
      failure: makeFailure("linkbrain", "STATUS_QUERY_FAILED", error.message, { pg_code: error.code }),
    };
  }

  const status = parseOperatorBrainStatus(data);
  return { status };
}

/**
 * Get a summary of recent activity across all planes for operator dashboards.
 */
export async function getRecentActivitySummary(
  env: Env,
  options: {
    tenant_id?: string;
    lookback_hours?: number;
    limit?: number;
  } = {},
): Promise<{ events: TraceEvent[]; failure?: FailureReport }> {
  const client = createSupabaseServiceClient(env);

  const { data, error } = await client
    .schema("linkbrain")
    .rpc("get_recent_audit_events", {
      p_tenant_id: options.tenant_id,
      p_lookback_hours: options.lookback_hours ?? 24,
      p_limit: options.limit ?? 50,
    });

  if (error) {
    return {
      events: [],
      failure: makeFailure("linkbrain", "ACTIVITY_QUERY_FAILED", error.message, { pg_code: error.code }),
    };
  }

  return { events: parseAuditEvents(data) };
}

/* -------------------------------------------------------------------------- */
/* Parser Helpers                                                              */
/* -------------------------------------------------------------------------- */

function parseRunTraceSummary(data: unknown): RunTraceSummary | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const stages = Array.isArray(d.stages)
    ? d.stages.map((s) => parseStageSummary(s)).filter(Boolean) as CrossPlaneStageSummary[]
    : [];

  return {
    run_id: String(d.run_id ?? ""),
    tenant_id: String(d.tenant_id ?? ""),
    plugin_id: String(d.plugin_id ?? ""),
    work_request_type: String(d.work_request_type ?? ""),
    status: String(d.status ?? "unknown") as RunTraceSummary["status"],
    started_at: String(d.started_at ?? new Date().toISOString()),
    ended_at: d.ended_at ? String(d.ended_at) : undefined,
    duration_ms: d.duration_ms ? Number(d.duration_ms) : undefined,
    total_stages: Number(d.total_stages ?? stages.length),
    completed_stages: Number(d.completed_stages ?? stages.filter(s => s.status === "succeeded").length),
    failed_stages: Number(d.failed_stages ?? stages.filter(s => s.status === "failed").length),
    total_audit_events: Number(d.total_audit_events ?? 0),
    total_leases: Number(d.total_leases ?? 0),
    total_workflow_runs: Number(d.total_workflow_runs ?? 0),
    total_memory_objects: Number(d.total_memory_objects ?? 0),
    lead_id: d.lead_id ? String(d.lead_id) : undefined,
    stages,
  };
}

function parseRunTraceSummaries(data: unknown): RunTraceSummary[] {
  if (!Array.isArray(data)) return [];
  return data.map(parseRunTraceSummary).filter(Boolean) as RunTraceSummary[];
}

function parseStageSummary(data: unknown): CrossPlaneStageSummary | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  return {
    stage_id: String(d.stage_id ?? ""),
    stage_name: String(d.stage_name ?? d.stage_id ?? ""),
    responsible_plane: String(d.responsible_plane ?? "linkaios") as CrossPlaneStageSummary["responsible_plane"],
    status: String(d.status ?? "unknown") as CrossPlaneStageSummary["status"],
    started_at: d.started_at ? String(d.started_at) : undefined,
    ended_at: d.ended_at ? String(d.ended_at) : undefined,
    duration_ms: d.duration_ms ? Number(d.duration_ms) : undefined,
    audit_event_ids: Array.isArray(d.audit_event_ids) ? d.audit_event_ids.map(String) : [],
    lease_ids: Array.isArray(d.lease_ids) ? d.lease_ids.map(String) : [],
    workflow_run_ids: Array.isArray(d.workflow_run_ids) ? d.workflow_run_ids.map(String) : [],
    model_run_id: d.model_run_id ? String(d.model_run_id) : undefined,
    memory_object_ids: Array.isArray(d.memory_object_ids) ? d.memory_object_ids.map(String) : [],
    failure_code: d.failure_code ? String(d.failure_code) : undefined,
    failure_message: d.failure_message ? String(d.failure_message) : undefined,
  };
}

function parseAuditEvents(data: unknown): TraceEvent[] {
  if (!Array.isArray(data)) return [];
  return data.map((d) => {
    if (!d || typeof d !== "object") return null;
    const row = d as Record<string, unknown>;
    return {
      event_id: String(row.event_id ?? ""),
      ts: String(row.ts ?? new Date().toISOString()),
      plane: String(row.plane ?? "linkbrain") as TraceEvent["plane"],
      action: String(row.action ?? ""),
      actor_kind: String(row.actor_kind ?? "system") as TraceEvent["actor_kind"],
      actor_id: String(row.actor_id ?? ""),
      subject: row.subject as Record<string, unknown> || {},
      payload_summary: row.payload_summary as Record<string, unknown> || undefined,
    };
  }).filter(Boolean) as TraceEvent[];
}

function parseMemoryReferences(data: unknown): MemoryObjectReference[] {
  if (!Array.isArray(data)) return [];
  return data.map((d) => {
    if (!d || typeof d !== "object") return null;
    const row = d as Record<string, unknown>;
    return {
      memory_id: String(row.memory_id ?? row.id ?? ""),
      type: String(row.type ?? "episode_summary") as MemoryObjectReference["type"],
      state: String(row.state ?? "active") as MemoryObjectReference["state"],
      created_at: String(row.created_at ?? new Date().toISOString()),
      confidence: Number(row.confidence ?? 1.0),
      payload_summary: row.payload_summary as Record<string, unknown> || {},
    };
  }).filter(Boolean) as MemoryObjectReference[];
}

function parseOperatorBrainStatus(data: unknown): OperatorBrainStatus | null {
  if (!data || typeof data !== "object") return null;
  const d = Array.isArray(data) ? (data[0] as Record<string, unknown>) : data as Record<string, unknown>;

  return {
    audit_ledger_health: String(d.audit_ledger_health ?? "unknown") as OperatorBrainStatus["audit_ledger_health"],
    memory_store_health: String(d.memory_store_health ?? "unknown") as OperatorBrainStatus["memory_store_health"],
    context_assembly_health: String(d.context_assembly_health ?? "unknown") as OperatorBrainStatus["context_assembly_health"],
    recent_audit_events_count: Number(d.recent_audit_events_count ?? 0),
    recent_memory_writes_count: Number(d.recent_memory_writes_count ?? 0),
    recent_context_assemblies_count: Number(d.recent_context_assemblies_count ?? 0),
    total_memory_objects: Number(d.total_memory_objects ?? 0),
    total_audit_events: Number(d.total_audit_events ?? 0),
    recent_errors: Array.isArray(d.recent_errors) ? d.recent_errors.map((e: unknown) => {
      const err = e as Record<string, unknown>;
      return {
        ts: String(err.ts ?? new Date().toISOString()),
        plane: String(err.plane ?? "unknown"),
        code: String(err.code ?? "UNKNOWN"),
        message: String(err.message ?? ""),
      };
    }) : undefined,
    checked_at: String(d.checked_at ?? new Date().toISOString()),
  };
}

/* -------------------------------------------------------------------------- */
/* Utility Functions                                                           */
/* -------------------------------------------------------------------------- */

function makeFailure(
  plane: "linkbrain" | "linkaios" | "linkbot" | "linkskills" | "linkautowork",
  code: string,
  message: string,
  details?: Record<string, unknown>,
): FailureReport {
  return {
    code,
    plane,
    message,
    retryable: code.includes("QUERY") || code.includes("TIMEOUT"),
    occurred_at: new Date().toISOString(),
    ...(details ? { details } : {}),
  };
}

/**
 * Build a human-readable trace summary for operator display.
 */
export function buildTraceSummaryText(trace: RunTraceSummary): string {
  const parts: string[] = [];
  parts.push(`Run ${trace.run_id.slice(0, 8)}… — ${trace.work_request_type}`);
  parts.push(`Status: ${trace.status} | Duration: ${formatDuration(trace.duration_ms ?? 0)}`);
  parts.push(`Stages: ${trace.completed_stages}/${trace.total_stages} completed`);
  if (trace.failed_stages > 0) {
    parts.push(`Failed stages: ${trace.failed_stages}`);
  }
  parts.push(`Events: ${trace.total_audit_events} audit, ${trace.total_leases} leases, ${trace.total_workflow_runs} workflows, ${trace.total_memory_objects} memories`);

  return parts.join("\n");
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Check if a trace shows a complete MVO flow per CONTRACTS_MVO.md §8.
 */
export function isMvoCompleteTrace(trace: RunTraceSummary): boolean {
  // Check minimum requirements from §8.1
  const hasMinimumAudit = trace.total_audit_events >= 4; // run.started, stage.completed, lease.executed, run.completed
  const hasMemory = trace.total_memory_objects >= 1;
  const hasLeases = trace.total_leases >= 1;
  const stagesCompleted = trace.completed_stages >= trace.total_stages;
  const noFailedStages = trace.failed_stages === 0;

  return hasMinimumAudit && hasMemory && hasLeases && (stagesCompleted || noFailedStages);
}

/**
 * Get the plane-by-plane breakdown of stage execution.
 */
export function getPlaneBreakdown(trace: RunTraceSummary): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const stage of trace.stages) {
    breakdown[stage.responsible_plane] = (breakdown[stage.responsible_plane] ?? 0) + 1;
  }
  return breakdown;
}
