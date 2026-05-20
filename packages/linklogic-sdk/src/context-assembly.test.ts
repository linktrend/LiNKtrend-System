import { beforeEach, describe, expect, it } from "vitest";

import {
  assembleContext,
  ContextRequestSchema,
  isAuthorizedForScope,
  MemoryObjectStateSchema,
  MemoryObjectTypeSchema,
  ScopeLatticeSchema,
  type MemoryObject,
  type MemoryObjectState,
  type MemoryObjectType,
  type MemoryStore,
  type ScopeLattice,
} from "./context-assembly.js";

/* -------------------------------------------------------------------------- */
/* In-Memory Store Implementation (for testing pre-WP-087)                     */
/* -------------------------------------------------------------------------- */

class InMemoryMemoryStore implements MemoryStore {
  private objects: MemoryObject[] = [];
  private vectorSupport: boolean;

  constructor(options?: { vectorSupport?: boolean }) {
    this.vectorSupport = options?.vectorSupport ?? false;
  }

  insert(object: MemoryObject): void {
    this.objects.push(object);
  }

  clear(): void {
    this.objects = [];
  }

  supportsVectorSearch(): boolean {
    return this.vectorSupport;
  }

  async queryByMetadata(filters: {
    scope: ScopeLattice;
    types?: MemoryObjectType[];
    states?: MemoryObjectState[];
    created_after?: string;
    limit: number;
  }): Promise<MemoryObject[]> {
    let results = this.objects.filter(obj => {
      // Strict tenant boundary
      if (obj.tenant_id !== filters.scope.tenant_id) return false;

      // Plugin boundary (if specified in filter)
      if (filters.scope.plugin_id && obj.scope.plugin_id &&
          obj.scope.plugin_id !== filters.scope.plugin_id) return false;

      // Role boundary (if specified in filter)
      if (filters.scope.role_id && obj.scope.role_id &&
          obj.scope.role_id !== filters.scope.role_id) return false;

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
    types?: MemoryObjectType[];
    limit: number;
  }): Promise<MemoryObject[]> {
    const queryLower = filters.query.toLowerCase();

    let results = this.objects.filter(obj => {
      // Scope checks
      if (obj.tenant_id !== filters.scope.tenant_id) return false;
      if (filters.scope.plugin_id && obj.scope.plugin_id &&
          obj.scope.plugin_id !== filters.scope.plugin_id) return false;
      if (filters.scope.role_id && obj.scope.role_id &&
          obj.scope.role_id !== filters.scope.role_id) return false;

      // Type filter
      if (filters.types && !filters.types.includes(obj.type)) return false;

      // Keyword match (simple substring for in-memory)
      const searchText = obj.search_text ?? JSON.stringify(obj.payload).toLowerCase();
      return searchText.toLowerCase().includes(queryLower);
    });

    return results.slice(0, filters.limit);
  }

  async queryByVector(filters: {
    scope: ScopeLattice;
    embedding: number[];
    types?: MemoryObjectType[];
    limit: number;
    min_similarity?: number;
  }): Promise<Array<{ object: MemoryObject; similarity: number }>> {
    if (!this.vectorSupport) return [];

    const minSim = filters.min_similarity ?? 0.7;

    let results = this.objects
      .filter(obj => {
        if (obj.tenant_id !== filters.scope.tenant_id) return false;
        if (filters.scope.plugin_id && obj.scope.plugin_id &&
            obj.scope.plugin_id !== filters.scope.plugin_id) return false;
        if (filters.scope.role_id && obj.scope.role_id &&
            obj.scope.role_id !== filters.scope.role_id) return false;
        if (filters.types && !filters.types.includes(obj.type)) return false;
        if (!obj.embedding) return false;
        return true;
      })
      .map(obj => {
        const similarity = cosineSimilarity(filters.embedding, obj.embedding!);
        return { object: obj, similarity };
      })
      .filter(r => r.similarity >= minSim)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, filters.limit);

    return results;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/* -------------------------------------------------------------------------- */
/* Test Fixtures                                                               */
/* -------------------------------------------------------------------------- */

function createMockMemoryObject(
  overrides: Partial<MemoryObject> & { id: string; tenant_id: string },
): MemoryObject {
  const now = new Date().toISOString();
  const { scope: overrideScope, ...restOverrides } = overrides;
  // Build scope carefully to ensure tenant_id is always present
  // Include role_id to match the default requester's scope
  const scope: ScopeLattice = {
    tenant_id: overrides.tenant_id,
    plugin_id: "websitefactory",
    role_id: "research_enrichment_bot",
    ...overrideScope,
  };
  return {
    type: "research_bundle",
    state: "active",
    payload: {},
    provenance_event_ids: [],
    confidence: 0.9,
    created_at: now,
    updated_at: now,
    ...restOverrides,
    scope,
  } as MemoryObject;
}

function createMockContextRequest(overrides: Partial<Parameters<typeof assembleContext>[0]> = {}): Parameters<typeof assembleContext>[0] {
  return {
    request_id: crypto.randomUUID(),
    requested_at: new Date().toISOString(),
    requester: {
      tenant_id: "tenant-1",
      plugin_id: "websitefactory",
      role_id: "research_enrichment_bot",
      bot_instance_id: "bot-1",
      session_id: "session-1",
    },
    task_context: {
      task_type: "lead_research",
      task_description: "Research potential customer in healthcare industry",
    },
    assembly_config: {
      max_facts: 5,
      max_procedures: 3,
      max_episodes: 3,
      include_embedding_search: false,
      recency_hours: 24,
    },
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Scope Lattice", () => {
  describe("isAuthorizedForScope", () => {
    it("allows same tenant access", () => {
      const requester: ScopeLattice = { tenant_id: "tenant-1" };
      const target: ScopeLattice = { tenant_id: "tenant-1" };
      expect(isAuthorizedForScope(requester, target)).toBe(true);
    });

    it("denies cross-tenant access (fails closed)", () => {
      const requester: ScopeLattice = { tenant_id: "tenant-1" };
      const target: ScopeLattice = { tenant_id: "tenant-2" };
      expect(isAuthorizedForScope(requester, target)).toBe(false);
    });

    it("allows plugin-scoped access when plugins match", () => {
      const requester: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "websitefactory" };
      const target: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "websitefactory" };
      expect(isAuthorizedForScope(requester, target)).toBe(true);
    });

    it("denies access when plugins mismatch", () => {
      const requester: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "websitefactory" };
      const target: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "other-plugin" };
      expect(isAuthorizedForScope(requester, target)).toBe(false);
    });

    it("allows access when requester doesn't specify plugin but target does", () => {
      const requester: ScopeLattice = { tenant_id: "tenant-1" };
      const target: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "websitefactory" };
      expect(isAuthorizedForScope(requester, target)).toBe(true);
    });

    it("denies access when role scopes mismatch", () => {
      const requester: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "bot-a" };
      const target: ScopeLattice = { tenant_id: "tenant-1", plugin_id: "websitefactory", role_id: "bot-b" };
      expect(isAuthorizedForScope(requester, target)).toBe(false);
    });
  });

  describe("ScopeLatticeSchema", () => {
    it("validates minimal scope (tenant only)", () => {
      const result = ScopeLatticeSchema.safeParse({ tenant_id: "tenant-1" });
      expect(result.success).toBe(true);
    });

    it("validates full scope lattice", () => {
      const result = ScopeLatticeSchema.safeParse({
        tenant_id: "tenant-1",
        plugin_id: "websitefactory",
        role_id: "research_bot",
        task_id: "task-1",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing tenant_id", () => {
      const result = ScopeLatticeSchema.safeParse({ plugin_id: "websitefactory" });
      expect(result.success).toBe(false);
    });
  });
});

describe("Context Request/Response Contracts", () => {
  describe("ContextRequestSchema", () => {
    it("validates minimal valid request", () => {
      const request = createMockContextRequest();
      const result = ContextRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const result = ContextRequestSchema.safeParse({
        request_id: crypto.randomUUID(),
        requested_at: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID", () => {
      const request = createMockContextRequest({ request_id: "not-a-uuid" });
      const result = ContextRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });
});

describe("In-Memory Store", () => {
  let store: InMemoryMemoryStore;

  beforeEach(() => {
    store = new InMemoryMemoryStore();
  });

  describe("queryByMetadata", () => {
    it("returns objects matching tenant scope", async () => {
      store.insert(createMockMemoryObject({ id: "obj-1", tenant_id: "tenant-1", type: "episode_summary" }));
      store.insert(createMockMemoryObject({ id: "obj-2", tenant_id: "tenant-2", type: "episode_summary" }));

      const results = await store.queryByMetadata({
        scope: { tenant_id: "tenant-1" },
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("obj-1");
    });

    it("filters by type", async () => {
      store.insert(createMockMemoryObject({ id: "obj-1", tenant_id: "tenant-1", type: "episode_summary" }));
      store.insert(createMockMemoryObject({ id: "obj-2", tenant_id: "tenant-1", type: "lead" }));

      const results = await store.queryByMetadata({
        scope: { tenant_id: "tenant-1" },
        types: ["lead"],
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("lead");
    });

    it("filters by state", async () => {
      store.insert(createMockMemoryObject({ id: "obj-1", tenant_id: "tenant-1", state: "active" }));
      store.insert(createMockMemoryObject({ id: "obj-2", tenant_id: "tenant-1", state: "candidate" }));

      const results = await store.queryByMetadata({
        scope: { tenant_id: "tenant-1" },
        states: ["active"],
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].state).toBe("active");
    });

    it("enforces cross-tenant isolation", async () => {
      store.insert(createMockMemoryObject({ id: "obj-1", tenant_id: "tenant-1" }));
      store.insert(createMockMemoryObject({ id: "obj-2", tenant_id: "tenant-2" }));
      store.insert(createMockMemoryObject({ id: "obj-3", tenant_id: "tenant-1" }));

      const results = await store.queryByMetadata({
        scope: { tenant_id: "tenant-1" },
        limit: 10,
      });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.tenant_id === "tenant-1")).toBe(true);
    });

    it("respects plugin boundaries", async () => {
      store.insert(createMockMemoryObject({ id: "obj-1", tenant_id: "tenant-1", scope: { tenant_id: "tenant-1", plugin_id: "websitefactory" } }));
      store.insert(createMockMemoryObject({ id: "obj-2", tenant_id: "tenant-1", scope: { tenant_id: "tenant-1", plugin_id: "other-plugin" } }));

      const results = await store.queryByMetadata({
        scope: { tenant_id: "tenant-1", plugin_id: "websitefactory" },
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("obj-1");
    });
  });

  describe("queryByKeyword", () => {
    it("finds objects by keyword in payload", async () => {
      store.insert(createMockMemoryObject({
        id: "obj-1",
        tenant_id: "tenant-1",
        payload: { content: "Healthcare industry research findings" },
      }));
      store.insert(createMockMemoryObject({
        id: "obj-2",
        tenant_id: "tenant-1",
        payload: { content: "Financial services analysis" },
      }));

      const results = await store.queryByKeyword({
        scope: { tenant_id: "tenant-1" },
        query: "healthcare",
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("obj-1");
    });

    it("is case insensitive", async () => {
      store.insert(createMockMemoryObject({
        id: "obj-1",
        tenant_id: "tenant-1",
        payload: { content: "HEALTHCARE Industry" },
      }));

      const results = await store.queryByKeyword({
        scope: { tenant_id: "tenant-1" },
        query: "healthcare",
        limit: 10,
      });

      expect(results).toHaveLength(1);
    });

    it("enforces tenant isolation for keyword search", async () => {
      store.insert(createMockMemoryObject({
        id: "obj-1",
        tenant_id: "tenant-1",
        payload: { content: "Healthcare research" },
      }));
      store.insert(createMockMemoryObject({
        id: "obj-2",
        tenant_id: "tenant-2",
        payload: { content: "Healthcare research" },
      }));

      const results = await store.queryByKeyword({
        scope: { tenant_id: "tenant-1" },
        query: "healthcare",
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].tenant_id).toBe("tenant-1");
    });
  });

  describe("queryByVector", () => {
    it("returns empty when vector support disabled", async () => {
      const storeNoVector = new InMemoryMemoryStore({ vectorSupport: false });
      storeNoVector.insert(createMockMemoryObject({
        id: "obj-1",
        tenant_id: "tenant-1",
        embedding: [1, 0, 0],
      }));

      const results = await storeNoVector.queryByVector({
        scope: { tenant_id: "tenant-1" },
        embedding: [1, 0, 0],
        limit: 10,
      });

      expect(results).toHaveLength(0);
    });

    it("finds similar vectors when enabled", async () => {
      const storeWithVector = new InMemoryMemoryStore({ vectorSupport: true });
      storeWithVector.insert(createMockMemoryObject({
        id: "obj-1",
        tenant_id: "tenant-1",
        embedding: [1, 0, 0],
      }));
      storeWithVector.insert(createMockMemoryObject({
        id: "obj-2",
        tenant_id: "tenant-1",
        embedding: [0, 1, 0],
      }));

      const results = await storeWithVector.queryByVector({
        scope: { tenant_id: "tenant-1" },
        embedding: [0.9, 0.1, 0],
        limit: 10,
        min_similarity: 0.5,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].object.id).toBe("obj-1");
      expect(results[0].similarity).toBeGreaterThan(0.5);
    });

    it("enforces tenant isolation for vector search", async () => {
      const storeWithVector = new InMemoryMemoryStore({ vectorSupport: true });
      storeWithVector.insert(createMockMemoryObject({
        id: "obj-1",
        tenant_id: "tenant-1",
        embedding: [1, 0, 0],
      }));
      storeWithVector.insert(createMockMemoryObject({
        id: "obj-2",
        tenant_id: "tenant-2",
        embedding: [1, 0, 0],
      }));

      const results = await storeWithVector.queryByVector({
        scope: { tenant_id: "tenant-1" },
        embedding: [1, 0, 0],
        limit: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].object.tenant_id).toBe("tenant-1");
    });
  });
});

describe("Context Assembler", () => {
  let store: InMemoryMemoryStore;

  beforeEach(() => {
    store = new InMemoryMemoryStore();
  });

  describe("assembleContext", () => {
    it("returns success with empty bundle when no context found", async () => {
      const request = createMockContextRequest();
      const result = await assembleContext(request, { store });

      expect(result.success).toBe(true);
      expect(result.bundle).toBeDefined();
      expect(result.bundle!.facts).toHaveLength(0);
      expect(result.bundle!.recent_episodes).toHaveLength(0);
    });

    it("assembles facts from keyword search", async () => {
      store.insert(createMockMemoryObject({
        id: "fact-1",
        tenant_id: "tenant-1",
        type: "research_bundle",
        state: "active",
        payload: { content: "Healthcare industry trends 2024" },
        search_text: "Healthcare industry trends 2024",
      }));

      // Use a query that matches a contiguous substring
      const request = createMockContextRequest({
        task_context: {
          task_type: "research",
          task_description: "industry trends", // Matches "industry trends" in search_text
        },
      });

      const result = await assembleContext(request, { store });

      expect(result.success).toBe(true);
      expect(result.bundle!.facts.length).toBeGreaterThan(0);
      expect(result.bundle!.assembly_metadata.retrieval_modes_used).toContain("keyword");
    });

    it("assembles recent episodes from metadata query", async () => {
      const now = new Date().toISOString();
      store.insert(createMockMemoryObject({
        id: "episode-1",
        tenant_id: "tenant-1",
        type: "episode_summary",
        state: "active",
        created_at: now,
        payload: { episode_type: "run_completion", outcome: "success", run_id: crypto.randomUUID() },
      }));

      const request = createMockContextRequest();
      const result = await assembleContext(request, { store });

      expect(result.success).toBe(true);
      expect(result.bundle!.recent_episodes.length).toBeGreaterThan(0);
      expect(result.bundle!.assembly_metadata.retrieval_modes_used).toContain("metadata");
    });

    it("respects max_facts limit", async () => {
      for (let i = 0; i < 10; i++) {
        store.insert(createMockMemoryObject({
          id: `fact-${i}`,
          tenant_id: "tenant-1",
          type: "research_bundle",
          state: "active",
          payload: { content: `Research finding ${i}` },
          search_text: `Research finding ${i}`,
        }));
      }

      const request = createMockContextRequest({
        assembly_config: {
          max_facts: 3,
          max_procedures: 3,
          max_episodes: 3,
          include_embedding_search: false,
          recency_hours: 24,
        },
      });

      const result = await assembleContext(request, { store });

      expect(result.success).toBe(true);
      expect(result.bundle!.facts.length).toBeLessThanOrEqual(3);
    });

    it("fails closed on invalid request", async () => {
      const request = createMockContextRequest({ request_id: "not-a-uuid" });
      const result = await assembleContext(request, { store });

      expect(result.success).toBe(false);
      expect(result.error!.code).toBe("INVALID_REQUEST");
    });

    it("respects tenant scope in assembly", async () => {
      store.insert(createMockMemoryObject({
        id: "fact-1",
        tenant_id: "tenant-1",
        type: "research_bundle",
        state: "active",
        payload: { content: "Tenant 1 research" },
        search_text: "Tenant 1 research",
      }));
      store.insert(createMockMemoryObject({
        id: "fact-2",
        tenant_id: "tenant-2",
        type: "research_bundle",
        state: "active",
        payload: { content: "Tenant 2 research" },
        search_text: "Tenant 2 research",
      }));

      const request = createMockContextRequest({
        requester: {
          tenant_id: "tenant-1",
          plugin_id: "websitefactory",
          role_id: "research_bot",
          bot_instance_id: "bot-1",
          session_id: "session-1",
        },
        task_context: {
          task_type: "research",
          task_description: "research",
        },
      });

      const result = await assembleContext(request, { store });

      expect(result.success).toBe(true);
      expect(result.bundle!.facts.every(f => f.scope.tenant_id === "tenant-1")).toBe(true);
    });

    it("uses vector search when enabled and available", async () => {
      const vectorStore = new InMemoryMemoryStore({ vectorSupport: true });
      vectorStore.insert(createMockMemoryObject({
        id: "fact-1",
        tenant_id: "tenant-1",
        type: "research_bundle",
        state: "active",
        embedding: [1, 0, 0, 0],
        payload: { content: "Healthcare research" },
      }));

      const mockEmbedQuery = async (text: string): Promise<number[]> => {
        return [0.95, 0.05, 0, 0]; // Similar to fact-1's embedding
      };

      const request = createMockContextRequest({
        assembly_config: {
          max_facts: 5,
          max_procedures: 3,
          max_episodes: 3,
          include_embedding_search: true,
          recency_hours: 24,
        },
        task_context: {
          task_type: "research",
          task_description: "healthcare research",
        },
      });

      const result = await assembleContext(request, { store: vectorStore, embedQuery: mockEmbedQuery });

      expect(result.success).toBe(true);
      expect(result.bundle!.assembly_metadata.retrieval_modes_used).toContain("vector");
    });
  });
});

describe("Schema Validation", () => {
  describe("MemoryObjectTypeSchema", () => {
    it("validates known types", () => {
      expect(MemoryObjectTypeSchema.safeParse("lead").success).toBe(true);
      expect(MemoryObjectTypeSchema.safeParse("research_bundle").success).toBe(true);
      expect(MemoryObjectTypeSchema.safeParse("episode_summary").success).toBe(true);
    });

    it("rejects unknown types", () => {
      expect(MemoryObjectTypeSchema.safeParse("unknown_type").success).toBe(false);
    });
  });

  describe("MemoryObjectStateSchema", () => {
    it("validates lifecycle states", () => {
      expect(MemoryObjectStateSchema.safeParse("candidate").success).toBe(true);
      expect(MemoryObjectStateSchema.safeParse("active").success).toBe(true);
      expect(MemoryObjectStateSchema.safeParse("invalidated").success).toBe(true);
    });
  });
});
