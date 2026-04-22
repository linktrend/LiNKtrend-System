import "server-only";

import {
  embedTextGemini,
  retrieveBrainContextForPath,
  type BrainRetrieveContextResult,
  type BrainRetrieveStage,
  type BrainScope,
} from "@linktrend/linklogic-sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function runBrainRetrievalSandbox(
  supabase: SupabaseClient,
  params: {
    scope: BrainScope;
    logicalPath: string;
    query: string;
    missionId?: string;
    agentId?: string;
    stage?: BrainRetrieveStage;
  },
): Promise<BrainRetrieveContextResult> {
  const key = process.env.GEMINI_API_KEY;
  const embedQuery = key
    ? async (text: string) => {
        const r = await embedTextGemini(text, key);
        return "error" in r ? null : r.embedding;
      }
    : async () => null;

  return retrieveBrainContextForPath(supabase, {
    scope: params.scope,
    logicalPath: params.logicalPath.trim(),
    missionId: params.missionId,
    agentId: params.agentId,
    query: params.query,
    topK: 6,
    embedQuery,
    /** Default avoids returning chunk bodies unless callers opt in (Ask overrides via `b_stage`). */
    stage: params.stage ?? "index_cards",
  });
}
