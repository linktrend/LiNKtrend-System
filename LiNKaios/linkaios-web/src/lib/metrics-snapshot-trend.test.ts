import { describe, expect, it } from "vitest";

import { periodTrendFromDailySeries } from "@/lib/metrics-snapshot";

describe("periodTrendFromDailySeries", () => {
  it("returns null when there is no activity baseline", () => {
    expect(periodTrendFromDailySeries([])).toEqual({ pct: null, label: "" });
    expect(
      periodTrendFromDailySeries([
        { day: "2026-06-01", value: 0 },
        { day: "2026-06-02", value: 0 },
      ]),
    ).toEqual({ pct: null, label: "" });
  });

  it("returns null when the comparison baseline is zero", () => {
    const trend = periodTrendFromDailySeries([
      { day: "2026-06-01", value: 0 },
      { day: "2026-06-02", value: 12 },
      { day: "2026-06-03", value: 7 },
    ]);
    expect(trend.pct).toBeNull();
  });

  it("computes period-over-period change when baseline exists", () => {
    const trend = periodTrendFromDailySeries([
      { day: "2026-06-01", value: 10 },
      { day: "2026-06-02", value: 10 },
      { day: "2026-06-03", value: 5 },
      { day: "2026-06-04", value: 5 },
    ]);
    expect(trend.label).toBe("Period over period");
    expect(trend.pct).toBe(-50);
  });
});
