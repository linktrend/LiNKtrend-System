import { describe, expect, it } from "vitest";

import type { BrainRetrieveContextResult } from "./brain-retrieval.js";

describe("BrainRetrieveContextResult shape", () => {
  it("allows optional mapIndexCards", () => {
    const r: BrainRetrieveContextResult = {
      fileId: "f",
      logicalPath: "p",
      indexCards: [],
      relevantChunks: [],
      publishedExcerpt: "",
      mapIndexCards: [],
      error: null,
    };
    expect(r.mapIndexCards).toEqual([]);
  });
});
