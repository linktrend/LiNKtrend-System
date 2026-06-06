import "server-only";

import { getLinkdeveloperAdminClient } from "./client";
import { listApprovalCandidates } from "./work-graph-utils";
import type {
  ArtifactSummary,
  ExecutorRunSummary,
  ProductRunSummary,
  ReleaseReadinessResponse,
  WorkGraphResponse,
} from "./types";

export async function loadLinkdeveloperProductRuns(): Promise<ProductRunSummary[]> {
  const client = getLinkdeveloperAdminClient();
  return client.listProductRuns();
}

export async function loadLinkdeveloperProductRun(id: string): Promise<ProductRunSummary> {
  const client = getLinkdeveloperAdminClient();
  return client.getProductRun(id);
}

export async function loadLinkdeveloperWorkGraph(productRunId: string): Promise<WorkGraphResponse> {
  const client = getLinkdeveloperAdminClient();
  return client.getWorkGraph(productRunId);
}

export async function loadLinkdeveloperArtifacts(productRunId: string): Promise<ArtifactSummary[]> {
  const client = getLinkdeveloperAdminClient();
  return client.listArtifacts(productRunId);
}

export async function loadLinkdeveloperReleaseReadiness(
  productRunId: string,
): Promise<ReleaseReadinessResponse> {
  const client = getLinkdeveloperAdminClient();
  return client.getReleaseReadiness(productRunId);
}

export async function loadLinkdeveloperExecutorRun(id: string): Promise<ExecutorRunSummary> {
  const client = getLinkdeveloperAdminClient();
  return client.getExecutorRun(id);
}

export async function loadLinkdeveloperExecutorRuns(): Promise<ExecutorRunSummary[]> {
  const client = getLinkdeveloperAdminClient();
  if (typeof client.listExecutorRuns === "function") {
    return client.listExecutorRuns();
  }
  return [];
}

export type LinkdeveloperArtifactRow = ArtifactSummary & { product_run_name: string };

/** Artifact library across all product runs (stub / in-process delegate). */
export async function loadLinkdeveloperArtifactLibrary(): Promise<LinkdeveloperArtifactRow[]> {
  const runs = await loadLinkdeveloperProductRuns();
  const rows: LinkdeveloperArtifactRow[] = [];
  for (const run of runs) {
    const artifacts = await loadLinkdeveloperArtifacts(run.id);
    for (const artifact of artifacts) {
      rows.push({ ...artifact, product_run_name: run.name });
    }
  }
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export type LinkdeveloperApprovalRow = {
  product_run_id: string;
  product_run_name: string;
  product_run_status: string;
  issue_id: string;
  issue_key: string;
  issue_title: string;
  issue_status: string;
  council_gate?: string;
  council_report?: import("@/lib/council/types").CouncilReportSummary;
};

/** Approval inbox rows derived from work graphs. */
export async function loadLinkdeveloperApprovalInbox(): Promise<LinkdeveloperApprovalRow[]> {
  const runs = await loadLinkdeveloperProductRuns();
  const rows: LinkdeveloperApprovalRow[] = [];
  for (const run of runs) {
    const graph = await loadLinkdeveloperWorkGraph(run.id);
    for (const node of listApprovalCandidates(graph)) {
      if (!node.issue_id) continue;
      const councilGate = node.key.includes("qualification")
        ? "G1"
        : node.key.includes("intent")
          ? "G2"
          : node.key.includes("release")
            ? "G4"
            : "G3";
      rows.push({
        product_run_id: run.id,
        product_run_name: run.name,
        product_run_status: run.status,
        issue_id: node.issue_id,
        issue_key: node.key,
        issue_title: node.title,
        issue_status: node.status,
        council_gate: councilGate,
        council_report: {
          gate: councilGate as import("@/lib/council/types").CouncilGate,
          program_id: run.slug,
          summary_status: node.status.startsWith("blocked") ? "WARN" : "PASS",
          blockers: [],
          deliberation_ref: `mock:council:${councilGate}:${run.id}`,
          personas: [
            {
              persona_id: "product-advisor",
              verdict: "PASS",
              summary: `Council ${councilGate} stub — wire cap.llm_council.deliberation on VPS.`,
              evidence: [{ type: "report", ref: run.id, finding: "Wave 3 UI hook" }],
            },
          ],
        },
      });
    }
  }

  return rows;
}
