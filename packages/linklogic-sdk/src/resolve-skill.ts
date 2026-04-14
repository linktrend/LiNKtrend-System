import type { Env } from "@linktrend/shared-config";
import type { SkillRecord } from "@linktrend/shared-types";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";

/**
 * Fetch latest approved skill by name from `linkaios.skills`.
 * Real LiNKlogic will add manifest checks, progressive memory, tool resolution, etc.
 */
export async function resolveSkillByName(
  env: Env,
  params: { service: string; skillName: string },
): Promise<SkillRecord | null> {
  const client = createSupabaseServiceClient(env);
  const { data, error } = await client
    .schema("linkaios")
    .from("skills")
    .select("*")
    .eq("name", params.skillName)
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    log("error", "resolveSkillByName failed", {
      service: params.service,
      code: error.code,
      message: error.message,
    });
    throw error;
  }
  if (!data) return null;
  return data as SkillRecord;
}
