import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectRecord } from "@linktrend/shared-types";

export async function listProjects(
  client: SupabaseClient,
  params: { limit?: number } = {},
): Promise<{ data: ProjectRecord[]; error: Error | null }> {
  const limit = params.limit ?? 200;
  const { data, error } = await client
    .schema("linkaios")
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return { data: (data ?? []) as ProjectRecord[], error: error ? new Error(error.message) : null };
}

export async function getProjectById(
  client: SupabaseClient,
  projectId: string,
): Promise<{ data: ProjectRecord | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  return { data: data as ProjectRecord | null, error: error ? new Error(error.message) : null };
}

export async function listManifestsForProject(
  client: SupabaseClient,
  projectId: string,
): Promise<{ data: Array<{ id: string; version: number; payload: unknown; created_at: string }>; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("manifests")
    .select("id, version, payload, created_at")
    .eq("project_id", projectId)
    .order("version", { ascending: false });
  return {
    data: (data ?? []) as Array<{ id: string; version: number; payload: unknown; created_at: string }>,
    error: error ? new Error(error.message) : null,
  };
}
