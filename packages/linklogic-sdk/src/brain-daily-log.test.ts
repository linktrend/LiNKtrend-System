import { describe, expect, it } from "vitest";

import { mergeDailyLogLinesIntoPublishedBody, parseDailyLogDateFromPath } from "./brain-daily-log.js";

describe("parseDailyLogDateFromPath", () => {
  it("parses memory daily log path", () => {
    expect(parseDailyLogDateFromPath("memory/2026-04-22.md")).toBe("2026-04-22");
    expect(parseDailyLogDateFromPath("other.md")).toBeNull();
  });
});

describe("mergeDailyLogLinesIntoPublishedBody", () => {
  it("appends lines", () => {
    const out = mergeDailyLogLinesIntoPublishedBody("# Hi", ["one"]);
    expect(out).toContain("one");
  });
});
