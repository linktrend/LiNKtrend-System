import type { SupabaseClient } from "@supabase/supabase-js";

import { mergeDailyLogLinesIntoPublishedBody, parseDailyLogDateFromPath } from "./brain-daily-log.js";
import {
  cosineSimilarity,
  findBrainVirtualFile,
  getPublishedVersionForFile,
  listBrainDailyLogLines,
  type BrainScope,
  type BrainVirtualFileRow,
} from "./brain-virtual-files.js";

export type BrainIndexCardLite = {
  card_key: string;
  title: string;
  summary: string;
  ordinal: number;
};

export type BrainRetrievedChunk = {
  chunkId: string;
  content: string;
  score: number;
};

export type BrainRetrieveContextResult = {
  fileId: string | null;
  logicalPath: string;
  /** Tier 1: catalogue / progressive disclosure. */
  indexCards: BrainIndexCardLite[];
  /** Tier 2: chunk bodies ranked by semantic similarity, or by document order when no embedding path. */
  relevantChunks: BrainRetrievedChunk[];
  /** Short published body preview when no cards/chunks. */
  publishedExcerpt: string;
  error: string | null;
};

async function listIndexCardsForFile(
  client: SupabaseClient,
  fileId: string,
): Promise<{ data: BrainIndexCardLite[]; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_index_cards")
    .select("card_key, title, summary, ordinal")
    .eq("file_id", fileId)
    .order("ordinal", { ascending: true });
  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as BrainIndexCardLite[], error: null };
}

async function loadPublishedChunksWithEmbeddings(
  client: SupabaseClient,
  versionId: string,
): Promise<{
  rows: Array<{ chunkId: string; content: string; embedding: number[] | null }>;
  error: Error | null;
}> {
  const { data: chunks, error: cErr } = await client
    .schema("linkaios")
    .from("brain_chunks")
    .select("id, content, ordinal")
    .eq("version_id", versionId)
    .order("ordinal", { ascending: true });
  if (cErr) return { rows: [], error: new Error(cErr.message) };
  const list = (chunks ?? []) as Array<{ id: string; content: string; ordinal: number }>;
  if (!list.length) return { rows: [], error: null };
  const ids = list.map((c) => c.id);
  const { data: embRows, error: eErr } = await client
    .schema("linkaios")
    .from("brain_chunk_embeddings")
    .select("chunk_id, embedding")
    .in("chunk_id", ids);
  if (eErr) return { rows: [], error: new Error(eErr.message) };
  const embMap = new Map(
    (embRows as Array<{ chunk_id: string; embedding: number[] }> | null)?.map((r) => [r.chunk_id, r.embedding]) ?? [],
  );
  const rows = list.map((c) => ({
    chunkId: c.id,
    content: c.content,
    embedding: embMap.get(c.id) ?? null,
  }));
  return { rows, error: null };
}

/**
 * Progressive disclosure for a virtual file: index cards, then top‑K chunks (semantic if `embedQuery` works).
 */
export async function retrieveBrainContextForPath(
  client: SupabaseClient,
  params: {
    scope: BrainScope;
    logicalPath: string;
    missionId?: string | null;
    agentId?: string | null;
    query: string;
    topK?: number;
    /** When provided, used to rank chunks; otherwise chunks are taken in document order. */
    embedQuery?: (text: string) => Promise<number[] | null>;
  },
): Promise<BrainRetrieveContextResult> {
  const topK = params.topK ?? 5;
  const logicalPath = params.logicalPath;
  const { data: file, error: fErr } = await findBrainVirtualFile(client, {
    scope: params.scope,
    logicalPath,
    missionId: params.missionId,
    agentId: params.agentId,
  });
  if (fErr) {
    return {
      fileId: null,
      logicalPath,
      indexCards: [],
      relevantChunks: [],
      publishedExcerpt: "",
      error: fErr.message,
    };
  }
  if (!file) {
    return {
      fileId: null,
      logicalPath,
      indexCards: [],
      relevantChunks: [],
      publishedExcerpt: "",
      error: null,
    };
  }

  const { data: published, error: pErr } = await getPublishedVersionForFile(client, file.id);
  if (pErr) {
    return {
      fileId: file.id,
      logicalPath,
      indexCards: [],
      relevantChunks: [],
      publishedExcerpt: "",
      error: pErr.message,
    };
  }

  const frow = file as BrainVirtualFileRow;
  let mergedPublishedBody = published?.body ?? "";
  const logDate = parseDailyLogDateFromPath(logicalPath);
  let dailyLogLines: string[] = [];
  if (frow.file_kind === "daily_log" && params.scope === "agent" && params.agentId && logDate) {
    const { lines, error: dlErr } = await listBrainDailyLogLines(client, params.agentId, logDate);
    if (dlErr) {
      return {
        fileId: file.id,
        logicalPath,
        indexCards: [],
        relevantChunks: [],
        publishedExcerpt: "",
        error: dlErr.message,
      };
    }
    dailyLogLines = lines;
    mergedPublishedBody = mergeDailyLogLinesIntoPublishedBody(mergedPublishedBody, dailyLogLines);
  }

  const { data: cards, error: cardErr } = await listIndexCardsForFile(client, file.id);
  if (cardErr) {
    return {
      fileId: file.id,
      logicalPath,
      indexCards: [],
      relevantChunks: [],
      publishedExcerpt: mergedPublishedBody.slice(0, 800),
      error: cardErr.message,
    };
  }

  let relevantChunks: BrainRetrievedChunk[] = [];
  if (published?.id) {
    const { rows: baseRows, error: chErr } = await loadPublishedChunksWithEmbeddings(client, published.id);
    if (chErr) {
      return {
        fileId: file.id,
        logicalPath,
        indexCards: cards,
        relevantChunks: [],
        publishedExcerpt: mergedPublishedBody.slice(0, 800),
        error: chErr.message,
      };
    }
    let rows = [...baseRows];
    if (dailyLogLines.length > 0 && logDate) {
      let ord = 0;
      for (const line of dailyLogLines) {
        rows.push({
          chunkId: `daily-log-line:${logDate}:${ord++}`,
          content: line,
          embedding: null,
        });
      }
    }
    let queryVec: number[] | null = null;
    if (params.query.trim() && params.embedQuery) {
      queryVec = await params.embedQuery(params.query.trim());
    }
    if (queryVec && queryVec.length > 0) {
      const scored = rows
        .filter((r) => r.embedding && r.embedding.length === queryVec!.length)
        .map((r) => ({
          chunkId: r.chunkId,
          content: r.content,
          score: cosineSimilarity(queryVec!, r.embedding!),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
      relevantChunks = scored;
    }
    if (relevantChunks.length === 0) {
      relevantChunks = rows.slice(0, topK).map((r) => ({
        chunkId: r.chunkId,
        content: r.content,
        score: 0,
      }));
    }
  }

  const excerpt = mergedPublishedBody.slice(0, 800);

  return {
    fileId: file.id,
    logicalPath,
    indexCards: cards,
    relevantChunks,
    publishedExcerpt: excerpt,
    error: null,
  };
}
