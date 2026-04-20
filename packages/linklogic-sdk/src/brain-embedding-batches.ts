import type { SupabaseClient } from "@supabase/supabase-js";

import { embedTextGemini } from "./brain-embeddings.js";
import { reconcileBrainEmbedJobAfterChunkWork, upsertBrainEmbedJobState } from "./brain-embed-jobs.js";
import { upsertBrainChunkEmbedding } from "./brain-virtual-files.js";

export type BrainEmbedBatchResult = {
  processed: number;
  errors: string[];
};

/**
 * Phase B: fill missing chunk embeddings (published chunks only) up to `limit`.
 * Uses Gemini text-embedding-004 when `apiKey` is set.
 */
export async function embedMissingBrainChunks(
  client: SupabaseClient,
  params: { apiKey: string; limit?: number; modelLabel?: string },
): Promise<BrainEmbedBatchResult> {
  const limit = params.limit ?? 24;
  const modelLabel = params.modelLabel ?? "models/text-embedding-004";
  const errors: string[] = [];
  const { data: pubVersions, error: vErr } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("id")
    .eq("status", "published")
    .limit(400);
  if (vErr) return { processed: 0, errors: [vErr.message] };
  const versionIds = (pubVersions ?? []).map((r: { id: string }) => String(r.id));
  if (!versionIds.length) return { processed: 0, errors: [] };

  const { data: chunks, error: cErr } = await client
    .schema("linkaios")
    .from("brain_chunks")
    .select("id, content, version_id")
    .in("version_id", versionIds)
    .limit(800);
  if (cErr) return { processed: 0, errors: [cErr.message] };
  const chunkList = (chunks ?? []) as Array<{ id: string; content: string; version_id: string }>;
  if (!chunkList.length) return { processed: 0, errors: [] };

  const chunkIds = chunkList.map((c) => c.id);
  const { data: embRows, error: eErr } = await client
    .schema("linkaios")
    .from("brain_chunk_embeddings")
    .select("chunk_id")
    .in("chunk_id", chunkIds);
  if (eErr) return { processed: 0, errors: [eErr.message] };
  const have = new Set((embRows ?? []).map((r: { chunk_id: string }) => String(r.chunk_id)));
  const missing = chunkList.filter((c) => !have.has(c.id)).slice(0, limit);

  let processed = 0;
  for (const ch of missing) {
    const versionId = String(ch.version_id);
    await upsertBrainEmbedJobState(client, versionId, { state: "processing" });
    const r = await embedTextGemini(ch.content, params.apiKey);
    if ("error" in r) {
      errors.push(`${ch.id}: ${r.error}`);
      await upsertBrainEmbedJobState(client, versionId, { state: "failed", last_error: r.error.slice(0, 2000) });
      continue;
    }
    const { error } = await upsertBrainChunkEmbedding(client, {
      chunkId: ch.id,
      model: modelLabel,
      dimensions: r.dimensions,
      embedding: r.embedding,
    });
    if (error) {
      errors.push(`${ch.id}: ${error.message}`);
      await upsertBrainEmbedJobState(client, versionId, { state: "failed", last_error: error.message.slice(0, 2000) });
    } else {
      processed += 1;
      await reconcileBrainEmbedJobAfterChunkWork(client, versionId);
    }
  }
  return { processed, errors };
}
