import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkillRecord } from "@linktrend/shared-types";

import { buildSkillIndexMetadata, mergeSkillIndexIntoMetadata, type SkillAssetSlim, type SkillReferenceSlim, type SkillScriptSlim } from "./skill-index-metadata.js";

export async function syncSkillDerivedMetadata(
  client: SupabaseClient,
  skillId: string,
): Promise<{ error: Error | null }> {
  const { data: skill, error: sErr } = await client.schema("linkaios").from("skills").select("*").eq("id", skillId).maybeSingle();
  if (sErr) return { error: new Error(sErr.message) };
  if (!skill) return { error: new Error("skill not found") };
  const row = skill as SkillRecord;
  const [{ data: scripts }, { data: refs }, { data: assets }] = await Promise.all([
    client.schema("linkaios").from("skill_scripts").select("id, filename").eq("skill_id", skillId),
    client.schema("linkaios").from("skill_references").select("id, label, kind, target, step_ordinal").eq("skill_id", skillId),
    client.schema("linkaios").from("skill_assets").select("id, name, storage_uri, byte_size, step_ordinal").eq("skill_id", skillId),
  ]);
  const scriptSlim: SkillScriptSlim[] = (scripts ?? []).map((r: { id: string; filename: string }) => ({
    id: r.id,
    filename: r.filename,
  }));
  const refSlim: SkillReferenceSlim[] = (refs ?? []).map(
    (r: { id: string; label: string; kind: string; target: string; step_ordinal: number | null }) => ({
      id: r.id,
      label: r.label,
      kind: r.kind,
      target: r.target,
      step_ordinal: r.step_ordinal,
    }),
  );
  const assetSlim: SkillAssetSlim[] = (assets ?? []).map(
    (r: { id: string; name: string; storage_uri: string; byte_size: number | null; step_ordinal: number | null }) => ({
      id: r.id,
      name: r.name,
      storage_uri: r.storage_uri ?? "",
      step_ordinal: r.step_ordinal,
    }),
  );
  const index = buildSkillIndexMetadata({
    skill: row,
    scripts: scriptSlim,
    references: refSlim,
    assets: assetSlim,
  });
  const nextMeta = mergeSkillIndexIntoMetadata((row.metadata ?? {}) as Record<string, unknown>, index);
  const { error: uErr } = await client
    .schema("linkaios")
    .from("skills")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (uErr) return { error: new Error(uErr.message) };
  return { error: null };
}
