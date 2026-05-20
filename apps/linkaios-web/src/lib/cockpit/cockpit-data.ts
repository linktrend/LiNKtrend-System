/**
 * Operational cockpit data helpers.
 *
 * Fetches cross-plane status data for the LiNKaios operational cockpit.
 * Keeps data fetching thin - LiNKaios displays, peer planes own the data.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CockpitDashboardData,
  ModuleStatus,
  LeaseStatus,
  RunOverview,
  RunStageView,
  AuditEventView,
  WorkerSessionStatus,
  WorkflowRunStatusView,
  CockpitFilterOptions,
} from "./cockpit-types";
import type { RunStatus, StageStatus } from "@linktrend/linklogic-sdk";

const DEFAULT_RECENT_LIMIT = 50;

/**
 * Load module activation status for a tenant.
 * Reads from linkaios schema: tenant_modules, modules, capability_plugins.
 */
export async function loadModuleStatus(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<ModuleStatus[]> {
  // Fetch enabled modules for tenant
  const { data: enabledMods, error: enabledErr } = await supabase
    .schema("linkaios")
    .from("tenant_modules")
    .select("module_id, enabled_at, health_status, last_check_at")
    .eq("tenant_id", tenantId)
    .order("enabled_at", { ascending: false });

  if (enabledErr) {
    console.error("Failed to load tenant modules:", enabledErr);
    return [];
  }

  // Fetch module registry
  const { data: modules, error: modulesErr } = await supabase
    .schema("linkaios")
    .from("modules")
    .select("module_id, module_name, plugin_kind, required_capabilities")
    .in(
      "module_id",
      enabledMods?.map((m) => m.module_id) ?? [],
    );

  if (modulesErr) {
    console.error("Failed to load modules:", modulesErr);
    return [];
  }

  // Fetch capability plugins to check availability
  const { data: capabilities, error: capErr } = await supabase
    .schema("linkaios")
    .from("capability_plugins")
    .select("capability_id, is_available");

  if (capErr) {
    console.error("Failed to load capabilities:", capErr);
  }

  const availableCaps = new Set(
    capabilities?.filter((c) => c.is_available).map((c) => c.capability_id) ?? [],
  );

  const enabledMap = new Map(enabledMods?.map((m) => [m.module_id, m]) ?? []);

  return (
    modules?.map((mod) => {
      const enabled = enabledMap.get(mod.module_id);
      const requiredCaps = (mod.required_capabilities as string[]) ?? [];
      const configured = requiredCaps.filter((c) => availableCaps.has(c));
      const missing = requiredCaps.filter((c) => !availableCaps.has(c));

      return {
        module_id: mod.module_id,
        module_name: mod.module_name,
        plugin_kind: mod.plugin_kind as "vertical" | "capability",
        is_enabled: !!enabled,
        enabled_at: enabled?.enabled_at ?? null,
        configured_capabilities: configured,
        missing_capabilities: missing,
        health: (enabled?.health_status as ModuleStatus["health"]) ?? "unknown",
        last_check_at: enabled?.last_check_at ?? null,
      };
    }) ?? []
  );
}

/**
 * Load LinkSkills lease status for a tenant.
 * Reads from linkskills schema: lease_registry, lease_run_ledger.
 */
export async function loadLeaseStatus(
  supabase: SupabaseClient,
  tenantId: string,
  options?: CockpitFilterOptions,
): Promise<LeaseStatus[]> {
  let query = supabase
    .schema("linkskills")
    .from("lease_registry")
    .select(
      "lease_id, capability, status, tenant_id, run_id, stage_id, requested_at, granted_at, executed_at, expires_at, kill_switch_state, ledger_entry_id, audit_event_id",
    )
    .eq("tenant_id", tenantId)
    .order("requested_at", { ascending: false })
    .limit(options?.time_range === "1h" ? 20 : DEFAULT_RECENT_LIMIT);

  if (options?.status?.length) {
    query = query.in("status", options.status);
  }

  if (options?.capability?.length) {
    query = query.in("capability", options.capability);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load lease status:", error);
    return [];
  }

  return (
    data?.map((l) => ({
      lease_id: l.lease_id,
      capability: l.capability,
      status: l.status as LeaseStatus["status"],
      tenant_id: l.tenant_id,
      run_id: l.run_id,
      stage_id: l.stage_id,
      requested_at: l.requested_at,
      granted_at: l.granted_at,
      executed_at: l.executed_at,
      expires_at: l.expires_at,
      kill_switch_state: l.kill_switch_state as "open" | "tripped",
      ledger_entry_id: l.ledger_entry_id,
      audit_event_id: l.audit_event_id,
    })) ?? []
  );
}

/**
 * Load workflow run status from LiNKautowork.
 * Reads from linkautowork schema: workflow_runs.
 */
export async function loadWorkflowRunStatus(
  supabase: SupabaseClient,
  tenantId: string,
  options?: CockpitFilterOptions,
): Promise<WorkflowRunStatusView[]> {
  let query = supabase
    .schema("linkautowork")
    .from("workflow_runs")
    .select(
      "workflow_run_id, workflow_handle, status, tenant_id, run_id, stage_id, lease_id, invoked_at, completed_at, audit_event_ids, failure_message",
    )
    .eq("tenant_id", tenantId)
    .order("invoked_at", { ascending: false })
    .limit(DEFAULT_RECENT_LIMIT);

  if (options?.status?.length) {
    query = query.in("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load workflow runs:", error);
    return [];
  }

  return (
    data?.map((w) => ({
      workflow_run_id: w.workflow_run_id,
      workflow_handle: w.workflow_handle,
      status: w.status as WorkflowRunStatusView["status"],
      tenant_id: w.tenant_id,
      run_id: w.run_id,
      stage_id: w.stage_id,
      lease_id: w.lease_id,
      invoked_at: w.invoked_at,
      completed_at: w.completed_at,
      audit_event_ids: (w.audit_event_ids as string[]) ?? [],
      failure_message: w.failure_message,
    })) ?? []
  );
}

/**
 * Load run overview with stages.
 * Reads from linkaios schema: runs, stages.
 */
export async function loadRunOverview(
  supabase: SupabaseClient,
  tenantId: string,
  options?: CockpitFilterOptions,
): Promise<RunOverview[]> {
  let runsQuery = supabase
    .schema("linkaios")
    .from("runs")
    .select("run_id, tenant_id, plugin_id, work_request_type, status, started_at, ended_at, failure_summary")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(20);

  if (options?.status?.length) {
    runsQuery = runsQuery.in("status", options.status);
  }

  const { data: runs, error: runsErr } = await runsQuery;

  if (runsErr) {
    console.error("Failed to load runs:", runsErr);
    return [];
  }

  const runIds = runs?.map((r) => r.run_id) ?? [];

  // Fetch stages for these runs
  const { data: stages, error: stagesErr } = await supabase
    .schema("linkaios")
    .from("stages")
    .select(
      "stage_id, run_id, display_name, responsible_plane, status, attempt, started_at, ended_at, refs, failure_message",
    )
    .in("run_id", runIds)
    .order("started_at", { ascending: true });

  if (stagesErr) {
    console.error("Failed to load stages:", stagesErr);
  }

  const stagesByRun = new Map<string, RunStageView[]>();
  for (const s of stages ?? []) {
    const list = stagesByRun.get(s.run_id) ?? [];
    const refs = (s.refs as Record<string, unknown>) ?? {};
    list.push({
      stage_id: s.stage_id,
      run_id: s.run_id,
      display_name: s.display_name,
      responsible_plane: s.responsible_plane as RunStageView["responsible_plane"],
      status: s.status as StageStatus,
      attempt: s.attempt,
      started_at: s.started_at,
      ended_at: s.ended_at,
      lease_ids: (refs.lease_ids as string[]) ?? [],
      workflow_run_ids: (refs.workflow_run_ids as string[]) ?? [],
      audit_event_ids: (refs.audit_event_ids as string[]) ?? [],
      failure_message: s.failure_message,
    });
    stagesByRun.set(s.run_id, list);
  }

  return (
    runs?.map((r) => {
      const runStages = stagesByRun.get(r.run_id) ?? [];
      const completed = runStages.filter((s) => s.status === "succeeded").length;
      const failed = runStages.filter((s) => s.status === "failed").length;
      const leaseCount = runStages.reduce((sum, s) => sum + s.lease_ids.length, 0);
      const wfCount = runStages.reduce((sum, s) => sum + s.workflow_run_ids.length, 0);

      return {
        run_id: r.run_id,
        tenant_id: r.tenant_id,
        plugin_id: r.plugin_id,
        work_request_type: r.work_request_type,
        status: r.status as RunStatus,
        started_at: r.started_at,
        ended_at: r.ended_at,
        stages: runStages,
        total_stages: runStages.length,
        completed_stages: completed,
        failed_stages: failed,
        lease_count: leaseCount,
        workflow_run_count: wfCount,
        failure_summary: r.failure_summary,
      };
    }) ?? []
  );
}

/**
 * Load LiNKbrain audit events.
 * Reads from linkbrain schema: audit_events.
 */
export async function loadAuditEvents(
  supabase: SupabaseClient,
  tenantId: string,
  limit = 50,
): Promise<AuditEventView[]> {
  const { data, error } = await supabase
    .schema("linkbrain")
    .from("audit_events")
    .select(
      "event_id, ts, plane, action, subject, payload_summary",
    )
    .eq("tenant_id", tenantId)
    .order("ts", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load audit events:", error);
    return [];
  }

  return (
    data?.map((e) => {
      const subject = (e.subject as Record<string, unknown>) ?? {};
      return {
        event_id: e.event_id,
        ts: e.ts,
        plane: e.plane,
        action: e.action,
        run_id: (subject.run_id as string) ?? null,
        stage_id: (subject.stage_id as string) ?? null,
        lease_id: (subject.lease_id as string) ?? null,
        workflow_run_id: (subject.workflow_run_id as string) ?? null,
        capability: (subject.capability as string) ?? null,
        plugin_id: (subject.plugin_id as string) ?? null,
        payload_summary: e.payload_summary,
      };
    }) ?? []
  );
}

/**
 * Load worker/LiNKbot session status.
 * Reads from bot_runtime schema: agent_sessions, agents.
 */
export async function loadWorkerSessionStatus(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<WorkerSessionStatus[]> {
  // Get agents for tenant
  const { data: agents, error: agentsErr } = await supabase
    .schema("bot_runtime")
    .from("agents")
    .select("agent_id, agent_name, capabilities")
    .eq("tenant_id", tenantId);

  if (agentsErr) {
    console.error("Failed to load agents:", agentsErr);
    return [];
  }

  const agentIds = agents?.map((a) => a.agent_id) ?? [];

  // Get current sessions
  const { data: sessions, error: sessErr } = await supabase
    .schema("bot_runtime")
    .from("agent_sessions")
    .select("agent_id, status, current_mission_id, current_stage_id, last_heartbeat_at, session_started_at")
    .in("agent_id", agentIds)
    .eq("is_active", true);

  if (sessErr) {
    console.error("Failed to load sessions:", sessErr);
  }

  const sessionMap = new Map(sessions?.map((s) => [s.agent_id, s]) ?? []);

  return (
    agents?.map((a) => {
      const sess = sessionMap.get(a.agent_id);
      return {
        agent_id: a.agent_id,
        agent_name: a.agent_name,
        status: (sess?.status as WorkerSessionStatus["status"]) ?? "offline",
        current_mission_id: sess?.current_mission_id ?? null,
        current_stage_id: sess?.current_stage_id ?? null,
        last_heartbeat_at: sess?.last_heartbeat_at ?? null,
        session_started_at: sess?.session_started_at ?? null,
        capabilities_available: (a.capabilities as string[]) ?? [],
      };
    }) ?? []
  );
}

/**
 * Load complete cockpit dashboard data.
 * Combines all cross-plane status sources.
 */
export async function loadCockpitDashboard(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<CockpitDashboardData> {
  const [
    modules,
    leases,
    runs,
    workers,
    events,
  ] = await Promise.all([
    loadModuleStatus(supabase, tenantId),
    loadLeaseStatus(supabase, tenantId, { time_range: "24h" }),
    loadRunOverview(supabase, tenantId, { time_range: "24h" }),
    loadWorkerSessionStatus(supabase, tenantId),
    loadAuditEvents(supabase, tenantId, 20),
  ]);

  // Calculate health
  const healthIssues: string[] = [];

  const unhealthyModules = modules.filter((m) => m.health === "unhealthy" || m.health === "unknown");
  if (unhealthyModules.length > 0) {
    healthIssues.push(`${unhealthyModules.length} module(s) unhealthy or unknown`);
  }

  const trippedKillswitches = leases.filter((l) => l.kill_switch_state === "tripped").length;
  if (trippedKillswitches > 0) {
    healthIssues.push(`${trippedKillswitches} kill switch(es) tripped`);
  }

  const failedRuns = runs.filter((r) => r.status === "failed").length;
  if (failedRuns > 0) {
    healthIssues.push(`${failedRuns} failed run(s) in last 24h`);
  }

  let systemHealth: CockpitDashboardData["system_health"] = "healthy";
  if (healthIssues.length > 2 || failedRuns > 5) {
    systemHealth = "unhealthy";
  } else if (healthIssues.length > 0 || failedRuns > 0) {
    systemHealth = "degraded";
  }

  return {
    tenant_id: tenantId,
    generated_at: new Date().toISOString(),

    modules,
    enabled_module_count: modules.filter((m) => m.is_enabled).length,
    total_module_count: modules.length,

    recent_leases: leases.slice(0, 20),
    active_lease_count: leases.filter((l) => l.status === "granted" || l.status === "executed").length,
    tripped_kill_switch_count: trippedKillswitches,

    recent_runs: runs.slice(0, 10),
    running_run_count: runs.filter((r) => r.status === "running").length,
    failed_run_count: failedRuns,

    worker_sessions: workers,
    online_worker_count: workers.filter((w) => w.status === "online" || w.status === "busy").length,
    busy_worker_count: workers.filter((w) => w.status === "busy").length,

    recent_audit_events: events,
    event_count_24h: events.length,

    system_health: systemHealth,
    health_issues: healthIssues,
  };
}
