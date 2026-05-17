import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkKillSwitch, evaluateSafetyTriggers } from "./safety.js";

vi.mock("./kill-switch.js", () => ({
  isKillSwitchTripped: vi.fn(),
  tripKillSwitch: vi.fn(),
  resetKillSwitch: vi.fn(),
}));

import { isKillSwitchTripped } from "./kill-switch.js";

function createClient(opts?: { globalHalt?: boolean }): SupabaseClient {
  const chain = {
    select: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: opts?.globalHalt ? [{}] : [], error: null }),
  };
  return {
    schema: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnValue(chain),
  } as unknown as SupabaseClient;
}

describe("safety checks", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns tripped when global level 2 halt is active", async () => {
    vi.mocked(isKillSwitchTripped).mockResolvedValue(false);
    const result = await checkKillSwitch(createClient({ globalHalt: true }), "tenant-1", "cap.crm.odoo_shadow");
    expect(result.state).toBe("tripped");
    expect(result.level).toBe(2);
  });

  it("falls back to capability kill switch when global halt is open", async () => {
    vi.mocked(isKillSwitchTripped).mockResolvedValue(true);
    const result = await checkKillSwitch(createClient({ globalHalt: false }), "tenant-1", "cap.crm.odoo_shadow");
    expect(result.state).toBe("tripped");
    expect(result.level).toBe(1);
  });
});

describe("trigger evaluation", () => {
  it("trips level 2 for cost and security thresholds", () => {
    const result = evaluateSafetyTriggers({
      spend_15m_usd: 100,
      spend_24h_avg_15m_usd: 20,
      projected_month_end_usd: 1100,
      projected_month_end_window_hits: 2,
      burn_rate_window_minutes: 10,
      critical_exceptions_10m: 3,
      invalid_signature_or_replay_5m: 10,
      invalid_signature_source: "1.2.3.4",
      credential_compromise_signal: false,
      pass_rate: 0.95,
      pass_rate_sample_count: 50,
    });
    expect(result.trip).toBe(true);
    expect(result.level).toBe(2);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("marks rollback scaffold when pass rate drops below threshold", () => {
    const result = evaluateSafetyTriggers({
      spend_15m_usd: 1,
      spend_24h_avg_15m_usd: 1,
      projected_month_end_usd: 100,
      projected_month_end_window_hits: 0,
      burn_rate_window_minutes: 5,
      critical_exceptions_10m: 0,
      invalid_signature_or_replay_5m: 0,
      invalid_signature_source: null,
      credential_compromise_signal: false,
      pass_rate: 0.79,
      pass_rate_sample_count: 30,
    });
    expect(result.rollback_scaffold).toBe(true);
  });
});

