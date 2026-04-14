import type { Env } from "@linktrend/shared-config";
import { createSupabaseServiceClient } from "@linktrend/db";

/**
 * Append a memory row using the service client (workers, gateway, trusted jobs).
 * Validates that the mission exists before insert.
 */
export async function appendCentralMemoryEntry(
  env: Env,
  params: {
    missionId: string;
    body: string;
    classification?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const client = createSupabaseServiceClient(env);
  const { data: mission, error: mErr } = await client
    .schema("linkaios")
    .from("missions")
    .select("id")
    .eq("id", params.missionId)
    .maybeSingle();
  if (mErr) throw mErr;
  if (!mission?.id) {
    throw new Error(`LiNKlogic: mission "${params.missionId}" not found; memory not written.`);
  }
  const { error } = await client.schema("linkaios").from("memory_entries").insert({
    mission_id: params.missionId,
    classification: params.classification ?? "working",
    body: params.body,
    metadata: params.metadata ?? {},
  });
  if (error) throw error;
}
