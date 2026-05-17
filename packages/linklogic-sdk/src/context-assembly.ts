/**
 * LiNKbrain Context Assembly Contracts — LinkBot scoped context retrieval
 *
 * Implements D-082-B (Context Assembly over Search) and D-082-C (Scope Lattice Enforcement).
 * Provides typed request/response contracts for assembling context bundles for LinkBots.
 *
 * This is an SDK interface that can work with:
 * - In-memory store (for testing, when WP-087 tables not present)
 * - PostgreSQL/pgvector store (when WP-087 migration applied)
 *
 * Per WP-088 dependency gate: Do not create duplicate memory table migrations.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* §1 Memory Object Types ( anticipating WP-087 schema )                     */
/* -------------------------------------------------------------------------- */

export const MemoryObjectTypeSchema = z.enum([
  "lead",
  "research_bundle",
  "episode_summary",
  "provenance_citation",
  "workflow_template",
]);
export type MemoryObjectType = z.infer<typeof MemoryObjectTypeSchema>;

export const MemoryObjectStateSchema = z.enum([
  "candidate",
  "approved",
  "active",
  "superseded",
  "invalidated",
]);
export type MemoryObjectState = z.infer<typeof MemoryObjectStateSchema>;

/* -------------------------------------------------------------------------- */
/* §2 Scope Lattice                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Scope lattice enforces strict boundaries: tenant > plugin > role > task
 * Per D-082-C: Raw memory never crosses tenant boundaries.
 */
export const ScopeLatticeSchema = z.object({
  tenant_id: z.string().min(1),
  plugin_id: z.string().min(1).optional(),
  role_id: z.string().min(1).optional(),
  task_id: z.string().min(1).optional(),
});
export type ScopeLattice = z.infer<typeof ScopeLatticeSchema>;

/**
 * Authorization check: requester scope vs target object scope.
 * Fails closed - any mismatch returns false.
 */
export function isAuthorizedForScope(
  requester: ScopeLattice,
  target: ScopeLattice,
): boolean {
  // Strict tenant boundary - must match exactly
  if (requester.tenant_id !== target.tenant_id) {
    return false;
  }

  // If requester specifies plugin, target must match or be unspecified
  if (requester.plugin_id && target.plugin_id && requester.plugin_id !== target.plugin_id) {
    return false;
  }

  // If requester specifies role, target must match or be unspecified
  if (requester.role_id && target.role_id && requester.role_id !== target.role_id) {
    return false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* §3 Context Request / Response Contracts                                    */
/* -------------------------------------------------------------------------- */

export const ContextRequestSchema = z.object({
  request_id: z.string().uuid(),
  requested_at: z.string().datetime(),

  // Who is requesting (LinkBot identity)
  requester: z.object({
    tenant_id: z.string().min(1),
    plugin_id: z.string().min(1),
    role_id: z.string().min(1),
    bot_instance_id: z.string().min(1),
    session_id: z.string().min(1),
  }),

  // What context is needed
  task_context: z.object({
    task_type: z.string().min(1),
    task_description: z.string().min(1),
    work_request_id: z.string().uuid().optional(),
    run_id: z.string().uuid().optional(),
    stage_id: z.string().optional(),
  }),

  // Assembly preferences
  assembly_config: z.object({
    max_facts: z.number().int().min(1).max(50).default(10),
    max_procedures: z.number().int().min(1).max(20).default(5),
    max_episodes: z.number().int().min(1).max(10).default(3),
    include_embedding_search: z.boolean().default(true),
    recency_hours: z.number().int().min(1).max(168).default(24),
  }).default({}),
});
export type ContextRequest = z.infer<typeof ContextRequestSchema>;

export const MemoryFactSchema = z.object({
  fact_id: z.string().min(1),
  fact_type: z.enum(["lead_attribute", "research_finding", "provenance_citation", "derived_insight"]),
  content: z.string().min(1),
  confidence: z.number().min(0).max(1),
  provenance_event_ids: z.array(z.string().min(1)),
  scope: ScopeLatticeSchema,
  created_at: z.string().datetime(),
  relevance_score: z.number().min(0).max(1).optional(),
});
export type MemoryFact = z.infer<typeof MemoryFactSchema>;

export const MemoryProcedureSchema = z.object({
  procedure_id: z.string().min(1),
  procedure_type: z.enum(["workflow_template", "capability_guide", "role_script"]),
  name: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(z.object({
    step_id: z.string().min(1),
    instruction: z.string().min(1),
    expected_output: z.string().optional(),
  })),
  scope: ScopeLatticeSchema,
  version: z.string().min(1),
});
export type MemoryProcedure = z.infer<typeof MemoryProcedureSchema>;

export const MemoryEpisodeSchema = z.object({
  episode_id: z.string().min(1),
  episode_type: z.enum(["run_completion", "stage_execution", "lease_execution", "workflow_invocation"]),
  summary: z.string().min(1),
  outcome: z.enum(["success", "partial", "failure"]),
  run_id: z.string().uuid(),
  stage_id: z.string().optional(),
  scope: ScopeLatticeSchema,
  occurred_at: z.string().datetime(),
  relevance_score: z.number().min(0).max(1).optional(),
});
export type MemoryEpisode = z.infer<typeof MemoryEpisodeSchema>;

export const ContextBundleSchema = z.object({
  bundle_id: z.string().uuid(),
  assembled_at: z.string().datetime(),

  // Assembly metadata
  assembly_metadata: z.object({
    request_id: z.string().uuid(),
    assembler_version: z.string().min(1),
    retrieval_modes_used: z.array(z.enum(["metadata", "keyword", "vector"])),
    total_candidates_considered: z.number().int().min(0),
  }),

  // The assembled context
  facts: z.array(MemoryFactSchema),
  procedures: z.array(MemoryProcedureSchema),
  recent_episodes: z.array(MemoryEpisodeSchema),

  // Scope lattice applied during assembly
  scope_applied: ScopeLatticeSchema,

  // Optional: embedding query used (for debugging/audit)
  embedding_query_used: z.string().optional(),
});
export type ContextBundle = z.infer<typeof ContextBundleSchema>;

export const ContextAssemblyErrorCodeSchema = z.enum([
  "UNAUTHORIZED_SCOPE",
  "INVALID_REQUEST",
  "ASSEMBLY_TIMEOUT",
  "STORE_UNAVAILABLE",
  "NO_RELEVANT_CONTEXT",
]);
export type ContextAssemblyErrorCode = z.infer<typeof ContextAssemblyErrorCodeSchema>;

export const ContextAssemblyResultSchema = z.object({
  success: z.boolean(),
  bundle: ContextBundleSchema.optional(),
  error: z.object({
    code: ContextAssemblyErrorCodeSchema,
    message: z.string().min(1),
    retryable: z.boolean(),
  }).optional(),
});
export type ContextAssemblyResult = z.infer<typeof ContextAssemblyResultSchema>;

/* -------------------------------------------------------------------------- */
/* §4 Retrieval Interface (Store-Agnostic)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Generic memory object for storage/retrieval.
 * Abstracts over the actual database schema until WP-087 is applied.
 */
export interface MemoryObject {
  id: string;
  tenant_id: string;
  type: MemoryObjectType;
  scope: ScopeLattice;
  state: MemoryObjectState;
  payload: Record<string, unknown>;
  provenance_event_ids: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
  // Optional: for vector search (when pgvector available)
  embedding?: number[];
  search_text?: string;
}

/**
 * Store interface for memory retrieval.
 * Implementations:
 * - InMemoryMemoryStore (for testing, pre-WP-087)
 * - PostgresMemoryStore (when WP-087 migration applied)
 */
export interface MemoryStore {
  /**
   * Query by metadata filters (scope lattice + type + state).
   */
  queryByMetadata(filters: {
    scope: ScopeLattice;
    types?: MemoryObjectType[];
    states?: MemoryObjectState[];
    created_after?: string;
    limit: number;
  }): Promise<MemoryObject[]>;

  /**
   * Query by keyword search (Postgres FTS when available).
   * Falls back to simple text matching for in-memory store.
   */
  queryByKeyword(filters: {
    scope: ScopeLattice;
    query: string;
    types?: MemoryObjectType[];
    limit: number;
  }): Promise<MemoryObject[]>;

  /**
   * Query by vector similarity (pgvector when available).
   * Returns empty for in-memory store without embeddings.
   */
  queryByVector(filters: {
    scope: ScopeLattice;
    embedding: number[];
    types?: MemoryObjectType[];
    limit: number;
    min_similarity?: number;
  }): Promise<Array<{ object: MemoryObject; similarity: number }>>;

  /**
   * Check if store supports vector search.
   */
  supportsVectorSearch(): boolean;
}

/* -------------------------------------------------------------------------- */
/* §5 Context Assembler Service Interface                                     */
/* -------------------------------------------------------------------------- */

export interface ContextAssemblerOptions {
  store: MemoryStore;
  embedQuery?: (text: string) => Promise<number[] | null>;
  assemblerVersion?: string;
}

/**
 * Assemble context for a LinkBot request.
 * Enforces scope lattice per D-082-C.
 */
export async function assembleContext(
  request: ContextRequest,
  options: ContextAssemblerOptions,
): Promise<ContextAssemblyResult> {
  const validation = ContextRequestSchema.safeParse(request);
  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: `Invalid context request: ${validation.error.issues[0]?.message ?? "unknown"}`,
        retryable: false,
      },
    };
  }

  const { store, embedQuery, assemblerVersion = "1.0.0" } = options;
  const req = validation.data;

  // Build scope lattice from requester
  const requesterScope: ScopeLattice = {
    tenant_id: req.requester.tenant_id,
    plugin_id: req.requester.plugin_id,
    role_id: req.requester.role_id,
  };

  try {
    const retrievalModes: Array<"metadata" | "keyword" | "vector"> = [];
    let totalCandidates = 0;
    let embeddingQueryUsed: string | undefined;

    // 1. Metadata-based retrieval: recent episodes for this scope
    const recencyCutoff = new Date();
    recencyCutoff.setHours(recencyCutoff.getHours() - req.assembly_config.recency_hours);

    const episodes = await store.queryByMetadata({
      scope: requesterScope,
      types: ["episode_summary"],
      states: ["active", "approved"],
      created_after: recencyCutoff.toISOString(),
      limit: req.assembly_config.max_episodes * 2,
    });
    retrievalModes.push("metadata");
    totalCandidates += episodes.length;

    // 2. Keyword search: facts relevant to task description
    const keywordResults = await store.queryByKeyword({
      scope: requesterScope,
      query: req.task_context.task_description,
      types: ["lead", "research_bundle", "provenance_citation"],
      limit: req.assembly_config.max_facts * 2,
    });
    retrievalModes.push("keyword");
    totalCandidates += keywordResults.length;

    // 3. Vector search: if enabled and store supports it
    let vectorResults: Array<{ object: MemoryObject; similarity: number }> = [];
    if (req.assembly_config.include_embedding_search && store.supportsVectorSearch() && embedQuery) {
      const queryEmbedding = await embedQuery(req.task_context.task_description);
      if (queryEmbedding) {
        vectorResults = await store.queryByVector({
          scope: requesterScope,
          embedding: queryEmbedding,
          types: ["research_bundle", "provenance_citation"],
          limit: req.assembly_config.max_facts,
          min_similarity: 0.7,
        });
        retrievalModes.push("vector");
        totalCandidates += vectorResults.length;
        embeddingQueryUsed = req.task_context.task_description;
      }
    }

    // 4. Assemble the bundle
    const bundle: ContextBundle = {
      bundle_id: crypto.randomUUID(),
      assembled_at: new Date().toISOString(),
      assembly_metadata: {
        request_id: req.request_id,
        assembler_version: assemblerVersion,
        retrieval_modes_used: retrievalModes,
        total_candidates_considered: totalCandidates,
      },
      facts: combineAndRankFacts(keywordResults, vectorResults, req.assembly_config.max_facts),
      procedures: [], // Procedures loaded separately or from static config
      recent_episodes: episodes
        .slice(0, req.assembly_config.max_episodes)
        .map(e => memoryObjectToEpisode(e)),
      scope_applied: requesterScope,
      embedding_query_used: embeddingQueryUsed,
    };

    return {
      success: true,
      bundle,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown assembly error";
    return {
      success: false,
      error: {
        code: "STORE_UNAVAILABLE",
        message,
        retryable: true,
      },
    };
  }
}

/* -------------------------------------------------------------------------- */
/* §6 Helper Functions                                                        */
/* -------------------------------------------------------------------------- */

function combineAndRankFacts(
  keywordResults: MemoryObject[],
  vectorResults: Array<{ object: MemoryObject; similarity: number }>,
  maxFacts: number,
): MemoryFact[] {
  const factMap = new Map<string, MemoryFact>();

  // Process keyword results first
  for (const obj of keywordResults) {
    const fact = memoryObjectToFact(obj);
    if (fact) {
      factMap.set(fact.fact_id, fact);
    }
  }

  // Augment with vector results (may boost relevance scores)
  for (const { object, similarity } of vectorResults) {
    const fact = memoryObjectToFact(object);
    if (fact) {
      const existing = factMap.get(fact.fact_id);
      if (existing) {
        // Boost relevance score if found by vector search
        existing.relevance_score = Math.max(existing.relevance_score ?? 0, similarity);
      } else if (factMap.size < maxFacts * 2) {
        fact.relevance_score = similarity;
        factMap.set(fact.fact_id, fact);
      }
    }
  }

  // Sort by relevance (confidence as fallback) and take top N
  const sorted = Array.from(factMap.values()).sort((a, b) => {
    const scoreA = a.relevance_score ?? a.confidence;
    const scoreB = b.relevance_score ?? b.confidence;
    return scoreB - scoreA;
  });

  return sorted.slice(0, maxFacts);
}

function memoryObjectToFact(obj: MemoryObject): MemoryFact | null {
  const base = {
    fact_id: obj.id,
    provenance_event_ids: obj.provenance_event_ids,
    scope: obj.scope,
    created_at: obj.created_at,
    confidence: obj.confidence,
  };

  switch (obj.type) {
    case "lead":
      return {
        ...base,
        fact_type: "lead_attribute",
        content: JSON.stringify(obj.payload),
      };
    case "research_bundle":
      return {
        ...base,
        fact_type: "research_finding",
        content: JSON.stringify(obj.payload),
      };
    case "provenance_citation":
      return {
        ...base,
        fact_type: "provenance_citation",
        content: typeof obj.payload.citation === "string" ? obj.payload.citation : JSON.stringify(obj.payload),
      };
    default:
      return null;
  }
}

function memoryObjectToEpisode(obj: MemoryObject): MemoryEpisode {
  return {
    episode_id: obj.id,
    episode_type: obj.payload.episode_type as MemoryEpisode["episode_type"] ?? "run_completion",
    summary: JSON.stringify(obj.payload),
    outcome: obj.payload.outcome as MemoryEpisode["outcome"] ?? "success",
    run_id: obj.payload.run_id as string ?? obj.provenance_event_ids[0] ?? crypto.randomUUID(),
    stage_id: obj.payload.stage_id as string | undefined,
    scope: obj.scope,
    occurred_at: obj.created_at,
  };
}
