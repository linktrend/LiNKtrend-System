import { describe, expect, it, vi, afterEach } from "vitest";

import { fetchSkillExecutionPackageFromLiNKaios } from "./skills-execution-client.js";

describe("fetchSkillExecutionPackageFromLiNKaios", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns ok with parsed JSON on 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ name: "x", resolved_steps: [] }),
    } as Response);
    const r = await fetchSkillExecutionPackageFromLiNKaios({
      baseUrl: "https://example.com",
      bearerSecret: "secret",
      skillName: "bootstrap",
      timeoutMs: 5000,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect((r.data as { name: string }).name).toBe("x");
    }
  });

  it("returns failure on non-OK", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "nope",
    } as Response);
    const r = await fetchSkillExecutionPackageFromLiNKaios({
      baseUrl: "https://example.com/",
      bearerSecret: "secret",
      skillName: "missing",
      timeoutMs: 5000,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(404);
      expect(r.message).toContain("nope");
    }
  });
});
