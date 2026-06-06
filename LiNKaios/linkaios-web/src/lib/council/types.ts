/** Council gate report types — aligned with LiNKdev council-report.schema.json (G1–G5). */

export const COUNCIL_GATES = ["G1", "G2", "G3", "G4", "G5"] as const;
export type CouncilGate = (typeof COUNCIL_GATES)[number];

export type CouncilVerdict = "PASS" | "WARN" | "BLOCKER";

export interface CouncilPersonaVerdict {
  persona_id: string;
  verdict: CouncilVerdict;
  summary: string;
  evidence: Array<{ type: string; ref: string; finding: string }>;
}

export interface CouncilReportSummary {
  gate: CouncilGate;
  program_id: string;
  summary_status: CouncilVerdict;
  blockers: Array<{ persona_id: string; message: string }>;
  warnings?: Array<{ persona_id: string; message: string }>;
  deliberation_ref?: string;
  personas?: CouncilPersonaVerdict[];
}

export interface TenantCouncilEntitlement {
  llm_council_enabled: boolean;
  ceo_openclaw_profile?: string;
}

/** Parse tenant.config_json base subscription council flag. */
export function parseTenantCouncilEntitlement(
  configJson: Record<string, unknown> | null | undefined,
): TenantCouncilEntitlement {
  const cfg = configJson ?? {};
  const base = (cfg.base_subscription as Record<string, unknown> | undefined) ?? {};
  const enabled =
    cfg.llm_council_enabled === true ||
    base.includes_llm_council === true ||
    cfg.llm_council_enabled === "true";

  return {
    llm_council_enabled: enabled,
    ceo_openclaw_profile:
      typeof cfg.ceo_openclaw_profile === "string" ? cfg.ceo_openclaw_profile : undefined,
  };
}
