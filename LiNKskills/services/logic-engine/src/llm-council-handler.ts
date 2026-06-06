/**
 * cap.llm_council.deliberation — governed gate deliberation (Wave 3).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";
import { loadEnv } from "@linktrend/shared-config";
import type { CapabilityContext } from "./types.js";
import { CapabilityExecutionError } from "./capability-errors.js";

export const COUNCIL_GATES = ["G1", "G2", "G3", "G4", "G5"] as const;
export type CouncilGate = (typeof COUNCIL_GATES)[number];

export const COUNCIL_PERSONA_IDS = [
  "security-advisor",
  "architecture-advisor",
  "dx-advisor",
  "qa-advisor",
  "product-advisor",
] as const;

export type CouncilPersonaId = (typeof COUNCIL_PERSONA_IDS)[number];
export type CouncilVerdict = "PASS" | "WARN" | "BLOCKER";

export interface CouncilEvidence {
  type: "file" | "command" | "report" | "narrative";
  ref: string;
  finding: string;
}

export interface CouncilPersonaVerdict {
  persona_id: CouncilPersonaId;
  verdict: CouncilVerdict;
  summary: string;
  evidence: CouncilEvidence[];
  warnings?: string[];
  recommendations?: string[];
}

export interface CouncilBlocker {
  persona_id: CouncilPersonaId;
  message: string;
}

export interface CouncilReport {
  gate: CouncilGate;
  program_id: string;
  reviewed_at: string;
  module_id?: string;
  phase_id?: string;
  subject_artifacts?: Array<{ label: string; path: string }>;
  personas: CouncilPersonaVerdict[];
  summary_status: CouncilVerdict;
  blockers: CouncilBlocker[];
  warnings?: CouncilBlocker[];
  summary_markdown_path?: string;
  deliberation_ref?: string;
}

interface DeliberateApiResponse {
  gate: string;
  program_id: string;
  stage1: Array<{ model: string; response: string }>;
  stage2: Array<{ model: string; ranking: string }>;
  stage3: { model: string; response: string };
  metadata: Record<string, unknown>;
  deliberation_ref: string;
}

export interface LlmCouncilDeliberationArgs {
  mode?: "mock" | "shadow" | "live";
  operation: "gate.deliberate" | "connectivity.probe";
  gate?: CouncilGate;
  program_id?: string;
  query?: string;
  subject_artifacts?: Array<{ label: string; path: string }>;
  module_id?: string;
  phase_id?: string;
  allow_warn?: boolean;
}

export interface LlmCouncilDeliberationResult extends Record<string, unknown> {
  operation: "gate.deliberate" | "connectivity.probe";
  mode: "mock" | "shadow" | "live";
  status: "completed" | "shadow_only" | "connectivity_checked";
  council_report?: CouncilReport;
  deliberation_ref?: string;
  connectivity?: { ok: boolean; checked_at: string; reason?: string };
}

function councilMode(env: Env): "mock" | "shadow" | "live" {
  const raw = (env.LLM_COUNCIL_MODE ?? "mock").toLowerCase();
  if (raw === "live" || raw === "shadow") return raw;
  return "mock";
}

function councilBaseUrl(env: Env): string {
  return (env.LLM_COUNCIL_BASE_URL ?? "http://llm-council-api:8001").replace(/\/$/, "");
}

function requireGate(value: unknown): CouncilGate {
  if (typeof value !== "string" || !COUNCIL_GATES.includes(value as CouncilGate)) {
    throw new CapabilityExecutionError(
      "LEASE_REQUEST_INVALID",
      `gate must be one of ${COUNCIL_GATES.join(", ")}`,
    );
  }
  return value as CouncilGate;
}

function inferSummaryStatus(text: string): CouncilVerdict {
  const upper = text.toUpperCase();
  if (upper.includes("BLOCKER")) return "BLOCKER";
  if (upper.includes("WARN")) return "WARN";
  return "PASS";
}

/** Map 3-stage API output to LiNKdev council report shape (G1–G5). */
export function mapDeliberationToCouncilReport(
  gate: CouncilGate,
  programId: string,
  api: DeliberateApiResponse,
  subjectArtifacts: Array<{ label: string; path: string }> = [],
  scope?: { module_id?: string; phase_id?: string },
): CouncilReport {
  const synthesis = api.stage3?.response ?? "";
  const summaryStatus = inferSummaryStatus(synthesis);
  const stage1 = api.stage1 ?? [];

  const personas: CouncilPersonaVerdict[] = COUNCIL_PERSONA_IDS.map((personaId, index) => {
    const stageEntry = stage1[index % Math.max(stage1.length, 1)];
    const modelSummary = stageEntry?.response?.slice(0, 500) ?? synthesis.slice(0, 500);
    const verdict: CouncilVerdict =
      summaryStatus === "BLOCKER"
        ? index === 0
          ? "BLOCKER"
          : "WARN"
        : summaryStatus === "WARN" && index === COUNCIL_PERSONA_IDS.length - 1
          ? "WARN"
          : "PASS";

    return {
      persona_id: personaId,
      verdict,
      summary: modelSummary || `Council ${personaId} reviewed gate ${gate}.`,
      evidence: [
        {
          type: "report",
          ref: api.deliberation_ref,
          finding: stageEntry?.model
            ? `Model ${stageEntry.model} contributed to gate ${gate} deliberation.`
            : `Synthesis from chairman model for gate ${gate}.`,
        },
      ],
    };
  });

  const blockers: CouncilBlocker[] =
    summaryStatus === "BLOCKER"
      ? personas
          .filter((p) => p.verdict === "BLOCKER")
          .map((p) => ({ persona_id: p.persona_id, message: p.summary.slice(0, 240) }))
      : [];

  const warnings: CouncilBlocker[] =
    summaryStatus === "WARN"
      ? [{ persona_id: "product-advisor", message: synthesis.slice(0, 240) }]
      : [];

  return {
    gate,
    program_id: programId,
    reviewed_at: new Date().toISOString(),
    module_id: scope?.module_id,
    phase_id: scope?.phase_id,
    subject_artifacts: subjectArtifacts,
    personas,
    summary_status: summaryStatus,
    blockers,
    warnings: warnings.length > 0 ? warnings : undefined,
    deliberation_ref: api.deliberation_ref,
  };
}

/** Structural validation aligned with LiNKdev/factory/contracts/council-report.schema.json */
export function validateCouncilReport(
  report: CouncilReport,
  options: { expectedGate?: CouncilGate; allowWarn?: boolean } = {},
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!COUNCIL_GATES.includes(report.gate)) {
    errors.push(`invalid gate ${report.gate}`);
  }
  if (options.expectedGate && report.gate !== options.expectedGate) {
    errors.push(`gate mismatch: expected ${options.expectedGate}, got ${report.gate}`);
  }
  if (!report.program_id?.trim()) {
    errors.push("program_id required");
  }

  const seen = new Set<string>();
  for (const persona of report.personas ?? []) {
    if (!COUNCIL_PERSONA_IDS.includes(persona.persona_id)) {
      errors.push(`invalid persona_id ${persona.persona_id}`);
    }
    if (seen.has(persona.persona_id)) {
      errors.push(`duplicate persona ${persona.persona_id}`);
    }
    seen.add(persona.persona_id);
    if (!persona.evidence?.length) {
      errors.push(`${persona.persona_id}: evidence required`);
    }
  }

  for (const required of COUNCIL_PERSONA_IDS) {
    if (!seen.has(required)) {
      errors.push(`missing persona ${required}`);
    }
  }

  if (report.summary_status === "BLOCKER" || report.blockers.length > 0) {
    errors.push("council report has BLOCKER");
  }
  if (report.summary_status === "WARN" && !options.allowWarn) {
    errors.push("summary_status WARN requires allow_warn");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function buildMockCouncilReport(
  gate: CouncilGate,
  programId: string,
  subjectArtifacts: Array<{ label: string; path: string }>,
  scope?: { module_id?: string; phase_id?: string },
): CouncilReport {
  const personas: CouncilPersonaVerdict[] = COUNCIL_PERSONA_IDS.map((personaId) => ({
    persona_id: personaId,
    verdict: "PASS",
    summary: `Mock council ${personaId}: gate ${gate} deliberation passed (no live models).`,
    evidence: [
      {
        type: "narrative",
        ref: `mock://${programId}/${gate}`,
        finding: "Shadow/mock mode — structural gate report for lease + audit proof.",
      },
    ],
  }));

  return {
    gate,
    program_id: programId,
    reviewed_at: new Date().toISOString(),
    module_id: scope?.module_id,
    phase_id: scope?.phase_id,
    subject_artifacts: subjectArtifacts,
    personas,
    summary_status: "PASS",
    blockers: [],
    deliberation_ref: `mock:council:${gate}:${programId}`,
  };
}

async function callDeliberateApi(
  env: Env,
  body: Record<string, unknown>,
): Promise<DeliberateApiResponse> {
  const url = `${councilBaseUrl(env)}/deliberate`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new CapabilityExecutionError(
      "INTEGRATION_UNAVAILABLE",
      `LLM Council API ${response.status}: ${detail.slice(0, 200)}`,
      true,
    );
  }

  return (await response.json()) as DeliberateApiResponse;
}

/**
 * cap.llm_council.deliberation handler — lease + audit path for gate deliberation.
 */
export async function handleLlmCouncilDeliberation(
  _client: SupabaseClient,
  args: LlmCouncilDeliberationArgs,
  context: CapabilityContext,
): Promise<LlmCouncilDeliberationResult> {
  const env = loadEnv();
  const mode = args.mode ?? councilMode(env);
  const operation = args.operation ?? "gate.deliberate";

  if (operation === "connectivity.probe") {
    try {
      const health = await fetch(`${councilBaseUrl(env)}/healthz`, {
        signal: AbortSignal.timeout(5_000),
      });
      return {
        operation,
        mode,
        status: "connectivity_checked",
        connectivity: {
          ok: health.ok,
          checked_at: new Date().toISOString(),
          reason: health.ok ? undefined : `HTTP ${health.status}`,
        },
      };
    } catch (error) {
      return {
        operation,
        mode,
        status: "connectivity_checked",
        connectivity: {
          ok: false,
          checked_at: new Date().toISOString(),
          reason: error instanceof Error ? error.message : "probe failed",
        },
      };
    }
  }

  const gate = requireGate(args.gate);
  const programId =
    typeof args.program_id === "string" && args.program_id.trim()
      ? args.program_id.trim()
      : context.stage_id;
  const query =
    typeof args.query === "string" && args.query.trim()
      ? args.query.trim()
      : `Council gate ${gate} deliberation for ${programId}`;
  const subjectArtifacts = Array.isArray(args.subject_artifacts) ? args.subject_artifacts : [];
  const scope = {
    module_id: typeof args.module_id === "string" ? args.module_id : undefined,
    phase_id: typeof args.phase_id === "string" ? args.phase_id : undefined,
  };

  if (!context.lease_id?.trim() && mode === "live") {
    throw new CapabilityExecutionError("LEASE_DENIED", "Lease required for live council deliberation");
  }

  let councilReport: CouncilReport;

  if (mode === "mock") {
    councilReport = buildMockCouncilReport(gate, programId, subjectArtifacts, scope);
  } else if (mode === "shadow") {
    councilReport = buildMockCouncilReport(gate, programId, subjectArtifacts, scope);
    councilReport.summary_status = "PASS";
    await callDeliberateApi(env, {
      gate,
      program_id: programId,
      query: `[shadow] ${query}`,
      subject_artifacts: subjectArtifacts,
      module_id: scope.module_id,
      phase_id: scope.phase_id,
      tenant_id: context.tenant_id,
      run_id: context.run_id,
    }).catch(() => undefined);
  } else {
    const api = await callDeliberateApi(env, {
      gate,
      program_id: programId,
      query,
      subject_artifacts: subjectArtifacts,
      module_id: scope.module_id,
      phase_id: scope.phase_id,
      tenant_id: context.tenant_id,
      run_id: context.run_id,
    });
    councilReport = mapDeliberationToCouncilReport(gate, programId, api, subjectArtifacts, scope);
  }

  const validation = validateCouncilReport(councilReport, {
    expectedGate: gate,
    allowWarn: args.allow_warn === true,
  });
  if (!validation.ok) {
    throw new CapabilityExecutionError(
      "LEASE_REQUEST_INVALID",
      `Council report invalid: ${validation.errors.join("; ")}`,
    );
  }

  return {
    operation: "gate.deliberate",
    mode,
    status: mode === "shadow" ? "shadow_only" : "completed",
    council_report: councilReport,
    deliberation_ref: councilReport.deliberation_ref,
  };
}
