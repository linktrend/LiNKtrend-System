import type { SupabaseClient } from "@supabase/supabase-js";

export async function upsertBrainEmbedJobPending(
  client: SupabaseClient,
  versionId: string,
): Promise<{ error: Error | null }> {
  const { error } = await client.schema("linkaios").from("brain_embed_jobs").upsert(
    {
      version_id: versionId,
      state: "pending",
      last_error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "version_id" },
  );
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function upsertBrainEmbedJobState(
  client: SupabaseClient,
  versionId: string,
  patch: { state: "pending" | "processing" | "done" | "failed"; last_error?: string | null },
): Promise<{ error: Error | null }> {
  const row: Record<string, unknown> = {
    version_id: versionId,
    state: patch.state,
    updated_at: new Date().toISOString(),
  };
  if (patch.last_error !== undefined) {
    row.last_error = patch.last_error;
  }
  const { error } = await client.schema("linkaios").from("brain_embed_jobs").upsert(row, { onConflict: "version_id" });
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

/** After each chunk embedding, mark job done when every chunk for the version has a row in brain_chunk_embeddings. */
export async function reconcileBrainEmbedJobAfterChunkWork(
  client: SupabaseClient,
  versionId: string,
): Promise<{ error: Error | null }> {
  const { data: chunks, error: cErr } = await client
    .schema("linkaios")
    .from("brain_chunks")
    .select("id")
    .eq("version_id", versionId);
  if (cErr) return { error: new Error(cErr.message) };
  const chunkList = (chunks ?? []) as Array<{ id: string }>;
  if (!chunkList.length) {
    return upsertBrainEmbedJobState(client, versionId, { state: "done" });
  }
  const ids = chunkList.map((c) => c.id);
  const { data: embRows, error: eErr } = await client
    .schema("linkaios")
    .from("brain_chunk_embeddings")
    .select("chunk_id")
    .in("chunk_id", ids);
  if (eErr) return { error: new Error(eErr.message) };
  const have = new Set((embRows ?? []).map((r: { chunk_id: string }) => String(r.chunk_id)));
  const allEmbedded = ids.every((id) => have.has(id));
  if (allEmbedded) {
    return upsertBrainEmbedJobState(client, versionId, { state: "done" });
  }
  return { error: null };
}
