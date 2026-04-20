import type { SupabaseClient } from "@supabase/supabase-js";

/** Stable default row from migration `015_linkbrain_org_legal_entity.sql`. */
export const DEFAULT_BRAIN_LEGAL_ENTITY_ID = "00000000-0000-4000-8000-000000000001";

export type BrainLegalEntityRow = {
  id: string;
  code: string;
  name: string;
  created_at: string;
};

export type BrainOrgNodeRow = {
  id: string;
  dimension: string;
  label: string;
  parent_id: string | null;
  valid_from: string;
  valid_to: string | null;
  sort_order: number;
  created_at: string;
};

export async function listBrainLegalEntities(
  client: SupabaseClient,
): Promise<{ data: BrainLegalEntityRow[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_legal_entities")
    .select("id, code, name, created_at")
    .order("code", { ascending: true });
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as BrainLegalEntityRow[], error: null };
}

export async function updateBrainLegalEntity(
  client: SupabaseClient,
  id: string,
  patch: Partial<Pick<BrainLegalEntityRow, "name" | "code">>,
): Promise<{ error: Error | null }> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name.trim();
  if (patch.code !== undefined) {
    const c = patch.code.trim();
    if (c) row.code = c;
  }
  if (Object.keys(row).length === 0) return { error: null };
  const { error } = await client.schema("linkaios").from("brain_legal_entities").update(row).eq("id", id);
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function listBrainOrgNodes(
  client: SupabaseClient,
): Promise<{ data: BrainOrgNodeRow[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_org_nodes")
    .select("id, dimension, label, parent_id, valid_from, valid_to, sort_order, created_at")
    .order("dimension", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as BrainOrgNodeRow[], error: null };
}

export async function createBrainOrgNode(
  client: SupabaseClient,
  params: {
    dimension: string;
    label: string;
    parentId?: string | null;
    validFrom?: string;
    validTo?: string | null;
    sortOrder?: number;
  },
): Promise<{ data: BrainOrgNodeRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_org_nodes")
    .insert({
      dimension: params.dimension.trim(),
      label: params.label.trim(),
      parent_id: params.parentId ?? null,
      valid_from: params.validFrom ?? new Date().toISOString().slice(0, 10),
      valid_to: params.validTo ?? null,
      sort_order: params.sortOrder ?? 0,
    })
    .select("id, dimension, label, parent_id, valid_from, valid_to, sort_order, created_at")
    .single();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as BrainOrgNodeRow, error: null };
}

export async function updateBrainOrgNode(
  client: SupabaseClient,
  id: string,
  patch: Partial<Pick<BrainOrgNodeRow, "dimension" | "label" | "parent_id" | "valid_from" | "valid_to" | "sort_order">>,
): Promise<{ error: Error | null }> {
  const row: Record<string, unknown> = {};
  if (patch.dimension !== undefined) row.dimension = patch.dimension;
  if (patch.label !== undefined) row.label = patch.label;
  if (patch.parent_id !== undefined) row.parent_id = patch.parent_id;
  if (patch.valid_from !== undefined) row.valid_from = patch.valid_from;
  if (patch.valid_to !== undefined) row.valid_to = patch.valid_to;
  if (patch.sort_order !== undefined) row.sort_order = patch.sort_order;
  const { error } = await client.schema("linkaios").from("brain_org_nodes").update(row).eq("id", id);
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function listOrgTagIdsForFile(
  client: SupabaseClient,
  fileId: string,
): Promise<{ data: string[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_virtual_file_org_tags")
    .select("org_node_id")
    .eq("file_id", fileId);
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []).map((r: { org_node_id: string }) => String(r.org_node_id)), error: null };
}

export async function replaceOrgTagsForVirtualFile(
  client: SupabaseClient,
  fileId: string,
  orgNodeIds: string[],
): Promise<{ error: Error | null }> {
  const { error: delErr } = await client
    .schema("linkaios")
    .from("brain_virtual_file_org_tags")
    .delete()
    .eq("file_id", fileId);
  if (delErr) return { error: new Error(delErr.message) };
  const uniq = [...new Set(orgNodeIds.map((x) => x.trim()).filter(Boolean))];
  if (!uniq.length) return { error: null };
  const { error: insErr } = await client.schema("linkaios").from("brain_virtual_file_org_tags").insert(
    uniq.map((org_node_id) => ({ file_id: fileId, org_node_id })),
  );
  if (insErr) return { error: new Error(insErr.message) };
  return { error: null };
}
