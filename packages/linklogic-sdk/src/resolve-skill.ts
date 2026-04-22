import type { Env } from "@linktrend/shared-config";
import type { SkillRecord } from "@linktrend/shared-types";
import { createSupabaseServiceClient } from "@linktrend/db";
import { log } from "@linktrend/observability";

const SKILL_SLIM_FIELDS =
  "id, name, version, status, metadata, created_at, updated_at, category_id, default_model, skill_mode, step_recipe, default_declared_tools, tags";

/**
 * Fetch latest approved skill by name (slim row: no `body_markdown` — use {@link resolveSkillFullForExecution} for prose).
 */
export async function resolveSkillByName(
  env: Env,
  params: { service: string; skillName: string },
): Promise<SkillRecord | null> {
  const client = createSupabaseServiceClient(env);
  const { data, error } = await client
    .schema("linkaios")
    .from("skills")
    .select(SKILL_SLIM_FIELDS)
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
  return { ...(data as Omit<SkillRecord, "body_markdown">), body_markdown: "" } as SkillRecord;
}

/** Full skill row including `body_markdown` for execution / Layer 3. */
export async function resolveSkillFullForExecution(
  env: Env,
  params: { service: string; skillName: string; version?: number },
): Promise<SkillRecord | null> {
  const client = createSupabaseServiceClient(env);
  let q = client
    .schema("linkaios")
    .from("skills")
    .select("*")
    .eq("name", params.skillName)
    .eq("status", "approved");
  if (typeof params.version === "number") {
    q = q.eq("version", params.version);
  } else {
    q = q.order("version", { ascending: false }).limit(1);
  }
  const { data, error } = await q.maybeSingle();
  if (error) {
    log("error", "resolveSkillFullForExecution failed", {
      service: params.service,
      code: error.code,
      message: error.message,
    });
    throw error;
  }
  if (!data) return null;
  return data as SkillRecord;
}
