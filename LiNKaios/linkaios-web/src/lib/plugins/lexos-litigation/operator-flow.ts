export type LexosMatterIntake = {
  matter_id: string;
  client_id: string;
  jurisdiction: string;
  intake_status: "accepted" | "needs_review";
};

export type LexosEvidenceResearchStatus = {
  evidence_status: "queued" | "processing" | "ready";
  research_status: "pending" | "in_progress" | "ready";
  workflow_run_ids: string[];
};

export type LexosOperatorTask = {
  task_id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  owner_role: string;
};

export type LexosOperatorFlowProof = {
  module: "lexos_litigation";
  matter_intake: LexosMatterIntake;
  evidence_research: LexosEvidenceResearchStatus;
  tasks: LexosOperatorTask[];
  trace: {
    lease_ids: string[];
    workflow_run_ids: string[];
    audit_event_ids: string[];
    governed_refs: {
      linkskills_capability_refs: string[];
      linkautowork_handles: string[];
      linkbrain_event_refs: string[];
      linkbot_role_refs: string[];
      plane_task_refs: string[];
    };
  };
};

export function buildLexosOperatorFlowProof(input: {
  run_id: string;
  tenant_id: string;
  matter_id: string;
  client_id: string;
  jurisdiction: string;
}): LexosOperatorFlowProof {
  const prefix = `${input.tenant_id}:${input.run_id}`;
  return {
    module: "lexos_litigation",
    matter_intake: {
      matter_id: input.matter_id,
      client_id: input.client_id,
      jurisdiction: input.jurisdiction,
      intake_status: "accepted",
    },
    evidence_research: {
      evidence_status: "ready",
      research_status: "ready",
      workflow_run_ids: [
        `wf:autowork.lexos.evidence_ingest:${prefix}`,
        `wf:autowork.lexos.extraction_run:${prefix}`,
      ],
    },
    tasks: [
      { task_id: `plane:${prefix}:intake`, title: "Intake confirmation", status: "done", owner_role: "lexos_intake_agent" },
      { task_id: `plane:${prefix}:support-matrix`, title: "Support matrix review", status: "in_progress", owner_role: "lexos_analyst" },
      { task_id: `plane:${prefix}:strategy`, title: "Strategy memo signoff", status: "todo", owner_role: "lexos_strategist" },
    ],
    trace: {
      lease_ids: [
        `lease:cap.storage.evidence:${prefix}`,
        `lease:cap.research.legal:${prefix}`,
        `lease:cap.plane.mock:${prefix}`,
      ],
      workflow_run_ids: [
        `wf:autowork.lexos.evidence_ingest:${prefix}`,
        `wf:autowork.lexos.extraction_run:${prefix}`,
        `wf:autowork.lexos.assertion_sync:${prefix}`,
      ],
      audit_event_ids: [
        `audit:run.started:${prefix}`,
        `audit:evidence.ingested:${prefix}`,
        `audit:research.performed:${prefix}`,
      ],
      governed_refs: {
        linkskills_capability_refs: ["cap.storage.evidence", "cap.research.legal", "cap.plane.mock"],
        linkautowork_handles: ["autowork.lexos.evidence_ingest", "autowork.lexos.extraction_run", "autowork.lexos.assertion_sync"],
        linkbrain_event_refs: ["evidence.ingested", "research.performed", "support.mapped"],
        linkbot_role_refs: ["lexos_intake_agent", "lexos_analyst", "lexos_strategist"],
        plane_task_refs: [`plane:${prefix}:intake`, `plane:${prefix}:support-matrix`, `plane:${prefix}:strategy`],
      },
    },
  };
}
