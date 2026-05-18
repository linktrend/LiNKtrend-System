/**
 * LiNKaios Kernel — Context Assembler Service
 *
 * Provides scoped context assembly for LinkBots using LiNKbrain memory objects.
 * Implements D-082-B (Context Assembly over Search) and D-082-C (Scope Lattice Enforcement).
 *
 * This service is designed to work with:
 * - In-memory store (for testing, when WP-087 tables not present)
 * - PostgreSQL/pgvector via RPC (when WP-087 migration applied)
 *
 * Per WP-088 dependency gate: Does not create memory table migrations.
 * The store is injected, allowing test isolation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assembleContext,
  ContextRequestSchema,
  isAuthorizedForScope,
  type ContextAssemblyResult,
  type ContextRequest,
  type ContextMemoryObjectState,
  type ContextMemoryObjectType,
  type MemoryObject,
  type MemoryStore,
  type ScopeLattice,
} from "@linktrend/linklogic-sdk";

/* -------------------------------------------------------------------------- */
/* §1 Types                                                                    */
/* -------------------------------------------------------------------------- */

export interface KernelContextAssemblerOptions {
  supabase: SupabaseClient;
  embedQuery?: (text: string) => Promise<number[] | null>;
  useInMemoryStore?: boolean; // For testing pre-WP-087
}

export interface AssembleContextForBotParams {
  tenant_id: string;
  plugin_id: string;
  role_id: string;
  bot_instance_id: string;
  session_id: string;
  task_type: string;
  task_description: string;
  work_request_id?: string;
  run_id?: string;
  stage_id?: string;
  max_facts?: number;
  max_episodes?: number;
  include_embedding_search?: boolean;
}

/* -------------------------------------------------------------------------- */
/* §2 Context Assembler Service                                               */
/* -------------------------------------------------------------------------- */

/**
 * Assemble context for a LinkBot within its authorized scope.
 * Fails closed on any cross-tenant access attempt.
 */
export async function assembleContextForBot(
  params: AssembleContextForBotParams,
  options: KernelContextAssemblerOptions,
): Promise<ContextAssemblyResult> {
  const request: ContextRequest = {
    request_id: crypto.randomUUID(),
    requested_at: new Date().toISOString(),
    requester: {
      tenant_id: params.tenant_id,
      plugin_id: params.plugin_id,
      role_id: params.role_id,
      bot_instance_id: params.bot_instance_id,
      session_id: params.session_id,
    },
    task_context: {
      task_type: params.task_type,
      task_description: params.task_description,
      work_request_id: params.work_request_id,
      run_id: params.run_id,
      stage_id: params.stage_id,
    },
    assembly_config: {
      max_facts: params.max_facts ?? 10,
      max_procedures: 5,
      max_episodes: params.max_episodes ?? 3,
      include_embedding_search: params.include_embedding_search ?? false,
      recency_hours: 24,
    },
  };

  // Build store based on configuration
  const store: MemoryStore = options.useInMemoryStore
    ? new InMemoryMemoryStore()
    : new SupabaseMemoryStore(options.supabase);

  return assembleContext(request, {
    store,
    embedQuery: options.embedQuery,
    assemblerVersion: "linkaios-kernel-1.0.0",
  });
}

/**
 * Verify that a bot is authorized to access a specific scope.
 * Primary security boundary for context retrieval.
 */
export function verifyContextAccess(
  botScope: {
    tenant_id: string;
    plugin_id: string;
    role_id: string;
  },
  targetScope: ScopeLattice,
): { authorized: true } | { authorized: false; reason: string } {
  const botLattice: ScopeLattice = {
    tenant_id: botScope.tenant_id,
    plugin_id: botScope.plugin_id,
    role_id: botScope.role_id,
  };

  if (botScope.tenant_id !== targetScope.tenant_id) {
    return {
      authorized: false,
      reason: `Cross-tenant access denied: bot tenant ${botScope.tenant_id} cannot access ${targetScope.tenant_id}`,
    };
  }

  const authorized = isAuthorizedForScope(botLattice, targetScope);
  if (!authorized) {
    return {
      authorized: false,
      reason: `Scope lattice mismatch: bot scope (${botScope.plugin_id}/${botScope.role_id}) cannot access target scope (${targetScope.plugin_id}/${targetScope.role_id})`,
    };
  }

  return { authorized: true };
}

/* -------------------------------------------------------------------------- */
/* §3 In-Memory Store Implementation                                          */
/* -------------------------------------------------------------------------- */

/**
 * In-memory implementation of MemoryStore for testing.
 * To be replaced with SupabaseMemoryStore once WP-087 migration is applied.
 */
class InMemoryMemoryStore implements MemoryStore {
  private objects: MemoryObject[] = [];

  insert(object: MemoryObject): void {
    this.objects.push(object);
  }

  clear(): void {
    this.objects = [];
  }

  supportsVectorSearch(): boolean {
    return false; // In-memory store doesn't support vectors (would need pgvector)
  }

  async queryByMetadata(filters: {
    scope: ScopeLattice;
    types?: ContextMemoryObjectType[];
    states?: ContextMemoryObjectState[];
    created_after?: string;
    limit: number;
  }): Promise<MemoryObject[]> {
    const results = this.objects.filter(obj => {
      // Strict tenant boundary - never cross tenants
      if (obj.tenant_id !== filters.scope.tenant_id) return false;

      // Plugin boundary (if specified)
      if (filters.scope.plugin_id && obj.scope.plugin_id &&
          obj.scope.plugin_id !== filters.scope.plugin_id) {
        return false;
      }

      // Role boundary (if specified)
      if (filters.scope.role_id && obj.scope.role_id &&
          obj.scope.role_id !== filters.scope.role_id) {
        return false;
      }

      // Type filter
      if (filters.types && !filters.types.includes(obj.type)) return false;

      // State filter
      if (filters.states && !filters.states.includes(obj.state)) return false;

      // Recency filter
      if (filters.created_after && obj.created_at < filters.created_after) return false;

      return true;
    });

    return results.slice(0, filters.limit);
  }

  async queryByKeyword(filters: {
    scope: ScopeLattice;
    query: string;
    types?: ContextMemoryObjectType[];
    limit: number;
  }): Promise<MemoryObject[]> {
    const queryLower = filters.query.toLowerCase();

    const results = this.objects.filter(obj => {
      // Scope checks (same as metadata query)
      if (obj.tenant_id !== filters.scope.tenant_id) return false;
      if (filters.scope.plugin_id && obj.scope.plugin_id &&
          obj.scope.plugin_id !== filters.scope.plugin_id) return false;
      if (filters.scope.role_id && obj.scope.role_id &&
          obj.scope.role_id !== filters.scope.role_id) return false;

      // Type filter
      if (filters.types && !filters.types.includes(obj.type)) return false;

      // Keyword match
      const searchText = obj.search_text ?? JSON.stringify(obj.payload).toLowerCase();
      return searchText.includes(queryLower);
    });

    return results.slice(0, filters.limit);
  }

  async queryByVector(): Promise<Array<{ object: MemoryObject; similarity: number }>> {
    // In-memory store does not support vector search
    // This would require pgvector integration via Supabase
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* §4 Supabase Store Implementation (Stub for WP-087 integration)            */
/* -------------------------------------------------------------------------- */

/**
 * Supabase-backed MemoryStore implementation.
 *
 * TODO (WP-087 follow-up): Replace stub implementations with actual RPC calls
 * once the brain_memory_objects table and pgvector extension are available.
 */
class SupabaseMemoryStore implements MemoryStore {
  constructor(private supabase: SupabaseClient) {}

  supportsVectorSearch(): boolean {
    // TODO: Check if pgvector extension is enabled
    return false;
  }

  async queryByMetadata(filters: {
    scope: ScopeLattice;
    types?: ContextMemoryObjectType[];
    states?: ContextMemoryObjectState[];
    created_after?: string;
    limit: number;
  }): Promise<MemoryObject[]> {
    // TODO (WP-087): Implement via RPC to linkbrain.query_memory_objects
    // This is a stub that returns empty until WP-087 migration is applied
    console.warn("SupabaseMemoryStore.queryByMetadata: stub implementation until WP-087");
    return [];
  }

  async queryByKeyword(filters: {
    scope: ScopeLattice;
    query: string;
    types?: ContextMemoryObjectType[];
    limit: number;
  }): Promise<MemoryObject[]> {
    // TODO (WP-087): Implement via RPC with Postgres FTS
    console.warn("SupabaseMemoryStore.queryByKeyword: stub implementation until WP-087");
    return [];
  }

  async queryByVector(filters: {
    scope: ScopeLattice;
    embedding: number[];
    types?: ContextMemoryObjectType[];
    limit: number;
    min_similarity?: number;
  }): Promise<Array<{ object: MemoryObject; similarity: number }>> {
    // TODO (WP-087): Implement via RPC with pgvector similarity search
    console.warn("SupabaseMemoryStore.queryByVector: stub implementation until WP-087");
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* §5 Factory                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Create a context assembler with the appropriate store.
 */
export function createContextAssembler(
  supabase: SupabaseClient,
  options?: {
    embedQuery?: (text: string) => Promise<number[] | null>;
    forceInMemory?: boolean;
  },
) {
  const useInMemory = options?.forceInMemory ?? true; // Default to in-memory until WP-087

  return {
    assembleForBot: (params: AssembleContextForBotParams) =>
      assembleContextForBot(params, {
        supabase,
        embedQuery: options?.embedQuery,
        useInMemoryStore: useInMemory,
      }),

    verifyAccess: verifyContextAccess,

    // Exposed for testing
    _inMemoryStore: useInMemory ? new InMemoryMemoryStore() : null,
  };
}

/* -------------------------------------------------------------------------- */
/* §6 WebsiteFactory Bot Context Helpers                                      */
/* -------------------------------------------------------------------------- */

/**
 * Pre-configured context assembly for WebsiteFactory Research Bot.
 */
export async function assembleResearchBotContext(
  params: {
    tenant_id: string;
    bot_instance_id: string;
    session_id: string;
    lead_description: string;
    work_request_id?: string;
    run_id?: string;
    stage_id?: string;
  },
  options: KernelContextAssemblerOptions,
): Promise<ContextAssemblyResult> {
  return assembleContextForBot(
    {
      tenant_id: params.tenant_id,
      plugin_id: "websitefactory",
      role_id: "research_enrichment_bot",
      bot_instance_id: params.bot_instance_id,
      session_id: params.session_id,
      task_type: "lead_research",
      task_description: params.lead_description,
      work_request_id: params.work_request_id,
      run_id: params.run_id,
      stage_id: params.stage_id,
      max_facts: 10,
      max_episodes: 5,
      include_embedding_search: false, // Disabled until pgvector available
    },
    options,
  );
}

/**
 * Pre-configured context assembly for WebsiteFactory Builder Bot.
 */
export async function assembleBuilderBotContext(
  params: {
    tenant_id: string;
    bot_instance_id: string;
    session_id: string;
    template_context: string;
    work_request_id?: string;
    run_id?: string;
    stage_id?: string;
  },
  options: KernelContextAssemblerOptions,
): Promise<ContextAssemblyResult> {
  return assembleContextForBot(
    {
      tenant_id: params.tenant_id,
      plugin_id: "websitefactory",
      role_id: "website_builder_bot",
      bot_instance_id: params.bot_instance_id,
      session_id: params.session_id,
      task_type: "website_package_generation",
      task_description: params.template_context,
      work_request_id: params.work_request_id,
      run_id: params.run_id,
      stage_id: params.stage_id,
      max_facts: 5,
      max_episodes: 3,
      include_embedding_search: false,
    },
    options,
  );
}
