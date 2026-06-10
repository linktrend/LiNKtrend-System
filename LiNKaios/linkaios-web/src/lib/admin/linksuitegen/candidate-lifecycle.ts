import { agentIdForLinksuitegenRole } from "./machine-review/openclaw-dispatch";
import { addHumanReview, addMachineReview, getCandidate, publishMarketplacePlugin, upsertCandidate } from "./store";
import type { GeneratedSuiteCandidate } from "./types";

export async function runMachineReview(candidateId: string): Promise<{
  machine_review_id: string;
  status: "passed" | "failed";
}> {
  const candidate = await getCandidate(candidateId);
  if (!candidate) throw new Error("Candidate not found");

  const machine_review_id = crypto.randomUUID();
  const now = new Date().toISOString();
  const orchestratorAgent = agentIdForLinksuitegenRole("suitegen_orchestrator_linkbot");

  await upsertCandidate({ ...candidate, status: "machine_review_running", updated_at: now });
  await addMachineReview({
    machine_review_id,
    candidate_id: candidateId,
    status: "running",
    run_refs: [
      {
        project_id: `mr-${candidate.suite_id}`,
        run_id: crypto.randomUUID(),
        suite_id: candidate.suite_id,
        module_ids: ["crm_lead_intake"],
        trace_count: 3,
        workflow_run_count: 2,
        linkbot_run_count: 1,
        openclaw_agent_id: orchestratorAgent,
        agent_zero_lane: "az-suitegen-factory",
      },
    ],
    report_json: { mode: process.env.LINKSUITEGEN_MACHINE_REVIEW_MODE ?? "shadow", passed: true },
    started_at: now,
    created_at: now,
  });

  const passed = candidate.validation_status === "validated";
  const completed = new Date().toISOString();
  await addMachineReview({
    machine_review_id: `${machine_review_id}-final`,
    candidate_id: candidateId,
    status: passed ? "passed" : "failed",
    run_refs: [],
    report_json: { passed, orchestrator_agent: orchestratorAgent ?? "admin-openclaw" },
    completed_at: completed,
    created_at: completed,
  });

  await upsertCandidate({
    ...candidate,
    status: passed ? "machine_review_passed" : "machine_review_failed",
    updated_at: completed,
  });

  return { machine_review_id, status: passed ? "passed" : "failed" };
}

export async function recordHumanReview(input: {
  candidate_id: string;
  reviewer_id: string;
  decision: "approved" | "changes_requested" | "rejected";
  decision_notes?: string;
}): Promise<GeneratedSuiteCandidate> {
  const candidate = await getCandidate(input.candidate_id);
  if (!candidate) throw new Error("Candidate not found");
  if (candidate.status !== "machine_review_passed" && candidate.status !== "human_review_required") {
    throw new Error(`Human review not allowed in status ${candidate.status}`);
  }

  const now = new Date().toISOString();
  await addHumanReview({
    human_review_id: crypto.randomUUID(),
    candidate_id: input.candidate_id,
    reviewer_id: input.reviewer_id,
    decision: input.decision,
    decision_notes: input.decision_notes ?? "",
    created_at: now,
  });

  const nextStatus =
    input.decision === "approved"
      ? "human_review_approved"
      : input.decision === "rejected"
        ? "rejected"
        : "human_review_failed";

  const updated = { ...candidate, status: nextStatus as GeneratedSuiteCandidate["status"], updated_at: now };
  await upsertCandidate(updated);
  return updated;
}

export async function publishCandidate(candidateId: string): Promise<GeneratedSuiteCandidate> {
  const candidate = await getCandidate(candidateId);
  if (!candidate) throw new Error("Candidate not found");
  if (candidate.admin_only) {
    throw new Error("Admin-only candidates cannot publish to client marketplace");
  }
  if (candidate.status !== "human_review_approved" && candidate.status !== "publish_ready") {
    throw new Error(`Publish not allowed in status ${candidate.status}`);
  }

  const now = new Date().toISOString();
  const stripeMode = process.env.LINKSUITEGEN_STRIPE_MODE ?? "shadow";
  const stripeProductId = stripeMode === "live" ? `prod_${candidate.suite_id}` : `shadow_prod_${candidate.suite_id}`;

  await publishMarketplacePlugin({
    suite_id: candidate.suite_id,
    suite_version: candidate.suite_version,
    display_name: candidate.display_name,
    stripe_product_id: stripeProductId,
    published_at: now,
    candidate_id: candidateId,
  });

  const updated: GeneratedSuiteCandidate = {
    ...candidate,
    status: "published",
    client_marketplace_visible: true,
    updated_at: now,
  };
  await upsertCandidate(updated);
  return updated;
}
