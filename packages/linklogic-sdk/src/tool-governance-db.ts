import type { SupabaseClient } from "@supabase/supabase-js";

async function toolNamesForToolIds(
  client: SupabaseClient,
  toolIds: string[],
): Promise<{ names: string[]; error: Error | null }> {
  if (!toolIds.length) return { names: [], error: null };
  const { data, error } = await client
    .schema("linkaios")
    .from("tools")
    .select("id, name, status")
    .in("id", toolIds);
  if (error) return { names: [], error: new Error(error.message) };
  const names: string[] = [];
  for (const row of data ?? []) {
    const r = row as { name: string; status: string };
    if (r.status === "approved") {
      names.push(String(r.name).toLowerCase());
    }
  }
  return { names: [...new Set(names)].sort(), error: null };
}

/** Approved tool names on the org allowlist (excludes non-approved / archived catalog rows). */
export async function loadOrgAllowedToolNames(client: SupabaseClient): Promise<string[]> {
  const { data: rows, error } = await client.schema("linkaios").from("org_tool_allowlist").select("tool_id");
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((r: { tool_id: string }) => r.tool_id).filter(Boolean);
  const { names, error: e2 } = await toolNamesForToolIds(client, ids);
  if (e2) throw e2;
  return names;
}

/** Mission-bound tool names (approved catalog only). */
export async function loadMissionToolNames(client: SupabaseClient, missionId: string): Promise<string[]> {
  const { data: rows, error } = await client
    .schema("linkaios")
    .from("mission_tools")
    .select("tool_id")
    .eq("mission_id", missionId);
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((r: { tool_id: string }) => r.tool_id).filter(Boolean);
  const { names, error: e2 } = await toolNamesForToolIds(client, ids);
  if (e2) throw e2;
  return names;
}

/** Org default subset for mission-less runs (approved catalog only). */
export async function loadMissionlessDefaultToolNames(client: SupabaseClient): Promise<string[]> {
  const { data: rows, error } = await client
    .schema("linkaios")
    .from("org_missionless_default_tools")
    .select("tool_id");
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((r: { tool_id: string }) => r.tool_id).filter(Boolean);
  const { names, error: e2 } = await toolNamesForToolIds(client, ids);
  if (e2) throw e2;
  return names;
}

export async function resolveToolIdByName(
  client: SupabaseClient,
  toolName: string,
): Promise<{ id: string | null; error: Error | null }> {
  const n = toolName.trim().toLowerCase();
  if (!n) return { id: null, error: null };
  const { data, error } = await client
    .schema("linkaios")
    .from("tools")
    .select("id")
    .eq("name", n)
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { id: null, error: new Error(error.message) };
  return { id: data ? String((data as { id: string }).id) : null, error: null };
}

/**
 * Record a runtime-blocked tool event for operator follow-up (best-effort).
 */
export async function ensureRuntimeBlockedRequest(
  client: SupabaseClient,
  params: {
    toolId: string;
    missionId?: string | null;
    correlationId?: string | null;
  },
): Promise<{ error: Error | null }> {
  const { error } = await client.schema("linkaios").from("tool_governance_requests").insert({
    status: "pending",
    request_type: "runtime_blocked",
    mission_id: params.missionId ?? null,
    tool_id: params.toolId,
    correlation_id: params.correlationId ?? null,
  });
  if (error) return { error: new Error(error.message) };
  return { error: null };
}
