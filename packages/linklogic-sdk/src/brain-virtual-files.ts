import type { SupabaseClient } from "@supabase/supabase-js";

import { mergeDailyLogLinesIntoPublishedBody, parseDailyLogDateFromPath } from "./brain-daily-log.js";
import { DEFAULT_BRAIN_LEGAL_ENTITY_ID } from "./brain-org.js";

export type BrainScope = "company" | "mission" | "agent";

export type BrainSensitivity = "public" | "internal" | "confidential" | "restricted";
export type BrainFileKind = "standard" | "daily_log" | "upload" | "librarian" | "quick_note";

export type BrainVirtualFileRow = {
  id: string;
  logical_path: string;
  scope: BrainScope;
  mission_id: string | null;
  agent_id: string | null;
  created_at: string;
  legal_entity_id: string;
  sensitivity: string;
  file_kind: string;
};

export type BrainVirtualFileEnriched = BrainVirtualFileRow & {
  has_published: boolean;
  published_at: string | null;
};

export type BrainFileVersionRow = {
  id: string;
  file_id: string;
  status: "draft" | "published" | "archived";
  body: string;
  predecessor_version_id: string | null;
  created_by: string | null;
  created_at: string;
  published_at: string | null;
};

/** Normalised inbox label for operators (§14.3). */
export type BrainInboxItemType = "upload" | "quick_note" | "librarian" | "edit_proposal" | "standard";

export type BrainInboxRow = BrainFileVersionRow & {
  logical_path: string;
  scope: BrainScope;
  mission_id: string | null;
  agent_id: string | null;
  file_kind: string;
  sensitivity: string;
  inbox_item_type: BrainInboxItemType;
  /** Published/predecessor body for diff when this draft is an edit proposal. */
  predecessor_body: string | null;
};

export function normaliseBrainInboxItemType(
  fileKind: string,
  hasPredecessor: boolean,
): BrainInboxItemType {
  if (hasPredecessor) return "edit_proposal";
  if (fileKind === "quick_note") return "quick_note";
  if (fileKind === "librarian") return "librarian";
  if (fileKind === "upload") return "upload";
  return "standard";
}

function scopeParams(scope: BrainScope, missionId?: string | null, agentId?: string | null) {
  if (scope === "company") return { mission_id: null, agent_id: null };
  if (scope === "mission") return { mission_id: missionId ?? null, agent_id: null };
  return { mission_id: null, agent_id: agentId ?? null };
}

export async function getOrCreateBrainVirtualFile(
  client: SupabaseClient,
  params: {
    scope: BrainScope;
    logicalPath: string;
    missionId?: string | null;
    agentId?: string | null;
    legalEntityId?: string | null;
    sensitivity?: BrainSensitivity | string | null;
    fileKind?: BrainFileKind | string | null;
  },
): Promise<{ data: BrainVirtualFileRow | null; error: Error | null }> {
  const { mission_id, agent_id } = scopeParams(params.scope, params.missionId, params.agentId);
  let q = client
    .schema("linkaios")
    .from("brain_virtual_files")
    .select("*")
    .eq("scope", params.scope)
    .eq("logical_path", params.logicalPath);
  if (params.scope === "mission") q = q.eq("mission_id", mission_id as string);
  if (params.scope === "agent") q = q.eq("agent_id", agent_id as string);
  const { data: existing, error: selErr } = await q.maybeSingle();
  if (selErr) return { data: null, error: new Error(selErr.message) };
  if (existing) return { data: existing as BrainVirtualFileRow, error: null };

  const insertRow = {
    logical_path: params.logicalPath,
    scope: params.scope,
    mission_id,
    agent_id,
    legal_entity_id: params.legalEntityId?.trim() || DEFAULT_BRAIN_LEGAL_ENTITY_ID,
    sensitivity: (params.sensitivity as string) || "internal",
    file_kind: (params.fileKind as string) || "standard",
  };
  const { data: created, error: insErr } = await client
    .schema("linkaios")
    .from("brain_virtual_files")
    .insert(insertRow)
    .select("*")
    .single();
  if (insErr) return { data: null, error: new Error(insErr.message) };
  return { data: created as BrainVirtualFileRow, error: null };
}

/** Select-only: does not insert a row (use for reads / retrieval / bot bridge). */
export async function findBrainVirtualFile(
  client: SupabaseClient,
  params: { scope: BrainScope; logicalPath: string; missionId?: string | null; agentId?: string | null },
): Promise<{ data: BrainVirtualFileRow | null; error: Error | null }> {
  const { mission_id, agent_id } = scopeParams(params.scope, params.missionId, params.agentId);
  let q = client
    .schema("linkaios")
    .from("brain_virtual_files")
    .select("*")
    .eq("scope", params.scope)
    .eq("logical_path", params.logicalPath);
  if (params.scope === "mission") q = q.eq("mission_id", mission_id as string);
  if (params.scope === "agent") q = q.eq("agent_id", agent_id as string);
  const { data: existing, error: selErr } = await q.maybeSingle();
  if (selErr) return { data: null, error: new Error(selErr.message) };
  return { data: (existing as BrainVirtualFileRow) ?? null, error: null };
}

/** Published markdown body for a path when the virtual file already exists (no insert). */
export async function getPublishedVirtualFileBody(
  client: SupabaseClient,
  params: { scope: BrainScope; logicalPath: string; missionId?: string | null; agentId?: string | null },
): Promise<{ body: string; fileId: string | null; error: Error | null }> {
  const { data: file, error: fErr } = await findBrainVirtualFile(client, params);
  if (fErr) return { body: "", fileId: null, error: fErr };
  if (!file) return { body: "", fileId: null, error: null };
  const { data: ver, error: vErr } = await getPublishedVersionForFile(client, file.id);
  if (vErr) return { body: "", fileId: file.id, error: vErr };
  let body = ver?.body ?? "";
  const fk = (file as BrainVirtualFileRow).file_kind;
  const logDate = parseDailyLogDateFromPath(params.logicalPath);
  if (fk === "daily_log" && params.scope === "agent" && params.agentId && logDate) {
    const { lines, error: lErr } = await listBrainDailyLogLines(client, params.agentId, logDate);
    if (lErr) return { body: "", fileId: file.id, error: lErr };
    body = mergeDailyLogLinesIntoPublishedBody(body, lines);
  }
  return { body, fileId: file.id, error: null };
}

export async function getBrainFileVersionById(
  client: SupabaseClient,
  versionId: string,
): Promise<{ data: BrainFileVersionRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("*")
    .eq("id", versionId)
    .maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data as BrainFileVersionRow) ?? null, error: null };
}

export async function getPublishedVersionForFile(
  client: SupabaseClient,
  fileId: string,
): Promise<{ data: BrainFileVersionRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("*")
    .eq("file_id", fileId)
    .eq("status", "published")
    .maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data as BrainFileVersionRow) ?? null, error: null };
}

export async function getPublishedBodyForPath(
  client: SupabaseClient,
  params: { scope: BrainScope; logicalPath: string; missionId?: string | null; agentId?: string | null },
): Promise<{ body: string; fileId: string | null; error: Error | null }> {
  const { data: file, error: fErr } = await getOrCreateBrainVirtualFile(client, params);
  if (fErr || !file) return { body: "", fileId: null, error: fErr };
  const { data: ver, error: vErr } = await getPublishedVersionForFile(client, file.id);
  if (vErr) return { body: "", fileId: file.id, error: vErr };
  return { body: ver?.body ?? "", fileId: file.id, error: null };
}

export async function createBrainDraft(
  client: SupabaseClient,
  params: { fileId: string; body: string; createdBy?: string | null; predecessorVersionId?: string | null },
): Promise<{ data: BrainFileVersionRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .insert({
      file_id: params.fileId,
      status: "draft",
      body: params.body,
      created_by: params.createdBy ?? null,
      predecessor_version_id: params.predecessorVersionId ?? null,
    })
    .select("*")
    .single();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as BrainFileVersionRow, error: null };
}

export async function updateBrainDraftBody(
  client: SupabaseClient,
  versionId: string,
  body: string,
): Promise<{ error: Error | null }> {
  const { error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .update({ body })
    .eq("id", versionId)
    .eq("status", "draft");
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

/** Archives any published row for the file, then publishes the given draft. */
/** Reject a draft inbox item: archived drafts are unchanged published corpus. */
export async function rejectBrainDraft(client: SupabaseClient, versionId: string): Promise<{ error: Error | null }> {
  const { error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .update({ status: "archived" })
    .eq("id", versionId)
    .eq("status", "draft");
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function publishBrainVersion(
  client: SupabaseClient,
  versionId: string,
): Promise<{ error: Error | null }> {
  const { data: draft, error: dErr } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("id, file_id, status")
    .eq("id", versionId)
    .single();
  if (dErr || !draft) return { error: new Error(dErr?.message ?? "version not found") };
  if ((draft as { status: string }).status !== "draft") {
    return { error: new Error("Only draft versions can be published via this path.") };
  }
  const fileId = String((draft as { file_id: string }).file_id);

  const { error: archErr } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .update({ status: "archived", published_at: null })
    .eq("file_id", fileId)
    .eq("status", "published");
  if (archErr) return { error: new Error(archErr.message) };

  const { error: pubErr } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", versionId);
  if (pubErr) return { error: new Error(pubErr.message) };
  return { error: null };
}

export async function listBrainDraftsForInbox(
  client: SupabaseClient,
  opts?: { limit?: number; inboxItemType?: BrainInboxItemType | null; sort?: "asc" | "desc" },
): Promise<{ data: BrainInboxRow[]; error: Error | null }> {
  const limit = opts?.limit ?? 100;
  const fetchCap = opts?.inboxItemType ? Math.max(limit, 320) : limit;
  const asc = opts?.sort === "asc";
  const { data: drafts, error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("id, file_id, status, body, predecessor_version_id, created_by, created_at, published_at")
    .eq("status", "draft")
    .order("created_at", { ascending: asc })
    .limit(fetchCap);
  if (error) return { data: [], error: new Error(error.message) };
  const drows = (drafts ?? []) as BrainFileVersionRow[];
  const fileIds = [...new Set(drows.map((d) => d.file_id))];
  const predIds = [...new Set(drows.map((d) => d.predecessor_version_id).filter(Boolean) as string[])];
  if (fileIds.length === 0) return { data: [], error: null };
  const { data: files, error: fErr } = await client
    .schema("linkaios")
    .from("brain_virtual_files")
    .select("id, logical_path, scope, mission_id, agent_id, file_kind, sensitivity")
    .in("id", fileIds);
  if (fErr) return { data: [], error: new Error(fErr.message) };
  const predBodyMap = new Map<string, string>();
  if (predIds.length > 0) {
    const { data: preds, error: pErr } = await client
      .schema("linkaios")
      .from("brain_file_versions")
      .select("id, body")
      .in("id", predIds);
    if (pErr) return { data: [], error: new Error(pErr.message) };
    for (const row of preds ?? []) {
      const pr = row as { id: string; body: string };
      predBodyMap.set(pr.id, pr.body ?? "");
    }
  }
  const fmap = new Map((files as BrainVirtualFileRow[]).map((f) => [f.id, f]));
  let mapped: BrainInboxRow[] = drows.map((r) => {
    const f = fmap.get(r.file_id);
    const fk = f?.file_kind ?? "standard";
    const hasPred = Boolean(r.predecessor_version_id);
    const predecessor_body = r.predecessor_version_id ? predBodyMap.get(r.predecessor_version_id) ?? null : null;
    return {
      ...r,
      logical_path: f?.logical_path ?? "",
      scope: (f?.scope ?? "company") as BrainScope,
      mission_id: f?.mission_id ?? null,
      agent_id: f?.agent_id ?? null,
      file_kind: fk,
      sensitivity: f?.sensitivity ?? "internal",
      inbox_item_type: normaliseBrainInboxItemType(fk, hasPred),
      predecessor_body,
    };
  });
  if (opts?.inboxItemType) {
    mapped = mapped.filter((r) => r.inbox_item_type === opts.inboxItemType).slice(0, limit);
  }
  return { data: mapped, error: null };
}

export async function listBrainVirtualFilesByScope(
  client: SupabaseClient,
  scope: BrainScope,
  opts?: { missionId?: string; agentId?: string; fileKind?: BrainFileKind | string | null },
): Promise<{ data: BrainVirtualFileRow[]; error: Error | null }> {
  let q = client.schema("linkaios").from("brain_virtual_files").select("*").eq("scope", scope);
  if (scope === "mission" && opts?.missionId) q = q.eq("mission_id", opts.missionId);
  if (scope === "agent" && opts?.agentId) q = q.eq("agent_id", opts.agentId);
  if (opts?.fileKind) q = q.eq("file_kind", opts.fileKind);
  const { data, error } = await q.order("logical_path");
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as BrainVirtualFileRow[], error: null };
}

/** Company scope: optionally narrow to files tagged with a specific org node. */
export async function listBrainVirtualFilesByScopeAndOrgTag(
  client: SupabaseClient,
  scope: BrainScope,
  opts: { missionId?: string; agentId?: string; orgNodeId?: string | null; fileKind?: BrainFileKind | string | null },
): Promise<{ data: BrainVirtualFileRow[]; error: Error | null }> {
  if (scope === "company" && opts.orgNodeId?.trim()) {
    const { data: tagRows, error: tErr } = await client
      .schema("linkaios")
      .from("brain_virtual_file_org_tags")
      .select("file_id")
      .eq("org_node_id", opts.orgNodeId.trim());
    if (tErr) return { data: [], error: new Error(tErr.message) };
    const ids = [...new Set((tagRows ?? []).map((r: { file_id: string }) => String(r.file_id)))];
    if (ids.length === 0) return { data: [], error: null };
    let q = client
      .schema("linkaios")
      .from("brain_virtual_files")
      .select("*")
      .eq("scope", "company")
      .in("id", ids);
    if (opts.fileKind) q = q.eq("file_kind", opts.fileKind);
    const { data, error } = await q.order("logical_path");
    if (error) return { data: [], error: new Error(error.message) };
    return { data: (data ?? []) as BrainVirtualFileRow[], error: null };
  }
  return listBrainVirtualFilesByScope(client, scope, opts);
}

export async function enrichBrainVirtualFilesWithPublishState(
  client: SupabaseClient,
  files: BrainVirtualFileRow[],
): Promise<{ data: BrainVirtualFileEnriched[]; error: Error | null }> {
  if (!files.length) return { data: [], error: null };
  const fileIds = files.map((f) => f.id);
  const { data: pubRows, error } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("file_id, published_at")
    .eq("status", "published")
    .in("file_id", fileIds);
  if (error) return { data: [], error: new Error(error.message) };
  const pubMap = new Map<string, string | null>();
  for (const r of pubRows ?? []) {
    const row = r as { file_id: string; published_at: string | null };
    pubMap.set(String(row.file_id), row.published_at ?? null);
  }
  const enriched: BrainVirtualFileEnriched[] = files.map((f) => ({
    ...f,
    has_published: pubMap.has(f.id),
    published_at: pubMap.get(f.id) ?? null,
  }));
  return { data: enriched, error: null };
}

export async function getBrainVirtualFileById(
  client: SupabaseClient,
  fileId: string,
): Promise<{ data: BrainVirtualFileRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_virtual_files")
    .select("*")
    .eq("id", fileId)
    .maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data as BrainVirtualFileRow) ?? null, error: null };
}

/** Open a new concurrent draft seeded from the current published body (edit proposal). */
export async function createBrainDraftFromPublishedIfAny(
  client: SupabaseClient,
  params: { fileId: string; createdBy?: string | null },
): Promise<{ data: BrainFileVersionRow | null; error: Error | null }> {
  const { data: pub, error: pErr } = await getPublishedVersionForFile(client, params.fileId);
  if (pErr) return { data: null, error: pErr };
  const body = pub?.body ?? "";
  return createBrainDraft(client, {
    fileId: params.fileId,
    body,
    createdBy: params.createdBy ?? null,
    predecessorVersionId: pub?.id ?? null,
  });
}

export async function appendBrainDailyLogLine(
  client: SupabaseClient,
  params: { agentId: string; logDate: string; content: string; metadata?: Record<string, unknown> },
): Promise<{ sequenceNo: number; error: Error | null }> {
  const { data: maxRow, error: maxErr } = await client
    .schema("linkaios")
    .from("brain_daily_log_lines")
    .select("sequence_no")
    .eq("agent_id", params.agentId)
    .eq("log_date", params.logDate)
    .order("sequence_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxErr) return { sequenceNo: -1, error: new Error(maxErr.message) };
  const next = ((maxRow as { sequence_no?: number } | null)?.sequence_no ?? -1) + 1;
  const { error: insErr } = await client.schema("linkaios").from("brain_daily_log_lines").insert({
    agent_id: params.agentId,
    log_date: params.logDate,
    sequence_no: next,
    content: params.content,
    metadata: params.metadata ?? {},
  });
  if (insErr) return { sequenceNo: -1, error: new Error(insErr.message) };
  return { sequenceNo: next, error: null };
}

export async function listBrainDailyLogLines(
  client: SupabaseClient,
  agentId: string,
  logDate: string,
): Promise<{ lines: string[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_daily_log_lines")
    .select("content")
    .eq("agent_id", agentId)
    .eq("log_date", logDate)
    .order("sequence_no", { ascending: true });
  if (error) return { lines: [], error: new Error(error.message) };
  return { lines: (data ?? []).map((r: { content: string }) => r.content), error: null };
}

export function chunkTextByParagraphs(body: string, maxChunkChars = 3500): string[] {
  const parts = body.split(/\n\n+/);
  const out: string[] = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + p).length > maxChunkChars && buf) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.length ? out : [body.slice(0, maxChunkChars)];
}

export async function replaceChunksForVersion(
  client: SupabaseClient,
  versionId: string,
  body: string,
): Promise<{ chunkIds: string[]; error: Error | null }> {
  const { error: delErr } = await client.schema("linkaios").from("brain_chunks").delete().eq("version_id", versionId);
  if (delErr) return { chunkIds: [], error: new Error(delErr.message) };
  const pieces = chunkTextByParagraphs(body);
  const chunkIds: string[] = [];
  let ord = 0;
  for (const content of pieces) {
    const { data, error } = await client
      .schema("linkaios")
      .from("brain_chunks")
      .insert({ version_id: versionId, ordinal: ord, content })
      .select("id")
      .single();
    if (error) return { chunkIds, error: new Error(error.message) };
    chunkIds.push(String((data as { id: string }).id));
    ord += 1;
  }
  return { chunkIds, error: null };
}

export async function upsertBrainChunkEmbedding(
  client: SupabaseClient,
  params: { chunkId: string; model: string; dimensions: number; embedding: number[] },
): Promise<{ error: Error | null }> {
  const { error } = await client.schema("linkaios").from("brain_chunk_embeddings").upsert(
    {
      chunk_id: params.chunkId,
      model: params.model,
      dimensions: params.dimensions,
      embedding: params.embedding,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chunk_id" },
  );
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export type BrainIndexCardRow = {
  card_key: string;
  title: string;
  summary: string;
  ordinal: number;
  primary_chunk_id: string | null;
};

export async function listBrainIndexCardsForFile(
  client: SupabaseClient,
  fileId: string,
): Promise<{ data: BrainIndexCardRow[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_index_cards")
    .select("card_key, title, summary, ordinal, primary_chunk_id")
    .eq("file_id", fileId)
    .order("ordinal", { ascending: true });
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as BrainIndexCardRow[], error: null };
}

export async function replaceIndexCardsForFile(
  client: SupabaseClient,
  fileId: string,
  cards: Array<{ card_key: string; title: string; summary: string; ordinal: number; primary_chunk_id?: string | null }>,
): Promise<{ error: Error | null }> {
  const { error: delErr } = await client.schema("linkaios").from("brain_index_cards").delete().eq("file_id", fileId);
  if (delErr) return { error: new Error(delErr.message) };
  if (!cards.length) return { error: null };
  const { error } = await client.schema("linkaios").from("brain_index_cards").insert(
    cards.map((c) => ({
      file_id: fileId,
      version_id: null,
      card_key: c.card_key,
      title: c.title,
      summary: c.summary,
      ordinal: c.ordinal,
      primary_chunk_id: c.primary_chunk_id ?? null,
    })),
  );
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}
