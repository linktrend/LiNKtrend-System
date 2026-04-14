import type { SupabaseClient } from "@supabase/supabase-js";
import type { MissionRecord } from "@linktrend/shared-types";

export async function listMissions(
  client: SupabaseClient,
  params: { limit?: number } = {},
): Promise<{ data: MissionRecord[]; error: Error | null }> {
  const limit = params.limit ?? 200;
  const { data, error } = await client
    .schema("linkaios")
    .from("missions")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as MissionRecord[], error: error ? new Error(error.message) : null };
}

export async function getMissionById(
  client: SupabaseClient,
  missionId: string,
): Promise<{ data: MissionRecord | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .maybeSingle();
  return { data: data as MissionRecord | null, error: error ? new Error(error.message) : null };
}

export async function listManifestsForMission(
  client: SupabaseClient,
  missionId: string,
): Promise<{ data: Array<{ id: string; version: number; payload: unknown; created_at: string }>; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("manifests")
    .select("id, version, payload, created_at")
    .eq("mission_id", missionId)
    .order("version", { ascending: false });
  return {
    data: (data ?? []) as Array<{ id: string; version: number; payload: unknown; created_at: string }>,
    error: error ? new Error(error.message) : null,
  };
}
