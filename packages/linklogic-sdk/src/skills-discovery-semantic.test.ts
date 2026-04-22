import { describe, expect, it } from "vitest";

import { searchSkillsSlimByEmbedding } from "./skills-retrieval-stages.js";

describe("searchSkillsSlimByEmbedding (CI-safe)", () => {
  it("uses injected embedQuery without calling Gemini", async () => {
    const client = {
      schema: (_s: string) => ({
        from: (table: string) => {
          if (table === "skill_slim_embeddings") {
            return {
              select: () => ({
                limit: () =>
                  Promise.resolve({
                    data: [{ skill_id: "u1", embedding: [1, 0, 0] }],
                    error: null,
                  }),
              }),
            };
          }
          if (table === "skills") {
            return {
              select: () => ({
                in: (_col: string, _ids: string[]) =>
                  Promise.resolve({
                    data: [
                      {
                        id: "u1",
                        name: "alpha",
                        version: 1,
                        status: "approved",
                        metadata: {},
                        created_at: "",
                        updated_at: "",
                        category_id: null,
                        skill_mode: "simple",
                        tags: [],
                        default_model: null,
                        default_declared_tools: [],
                      },
                    ],
                    error: null,
                  }),
              }),
            };
          }
          throw new Error(`unexpected table ${table}`);
        },
      }),
    };
    const r = await searchSkillsSlimByEmbedding(client as never, {
      query: "hello",
      apiKey: "unused",
      limit: 5,
      embedQuery: async () => [1, 0, 0],
    });
    expect(r.error).toBeNull();
    expect(r.data.length).toBe(1);
    expect(r.data[0].skill.name).toBe("alpha");
  });
});
