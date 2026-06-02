import { describe, expect, it, beforeEach } from "vitest";

import {
  anonymizeKnowledgeForWorldBrain,
  attachWorldBrainContribution,
  buildCompanyKnowledgeRecord,
  buildKnowledgeProposal,
  clearLibrarianProposalStore,
  ingestLibrarianSources,
  reviewKnowledgeProposal,
} from "./knowledge-loop";

describe("Librarian knowledge loop (LTS-021)", () => {
  beforeEach(() => {
    clearLibrarianProposalStore();
  });

  it("ingests run outputs and Zulip thread refs", () => {
    const sources = ingestLibrarianSources({
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "linksites.publish",
      run_outputs: [{ ref: "artifact://site-1", summary: "Published site package" }],
      zulip_thread_refs: [{ stream: "linksites", topic: "run-1-publish" }],
    });

    expect(sources).toHaveLength(2);
    expect(sources[0]?.kind).toBe("run_output");
    expect(sources[1]?.kind).toBe("zulip_thread");
    expect(sources[1]?.ref).toContain("zulip://");
  });

  it("creates pending proposal and supports accept path with world brain", () => {
    const proposal = buildKnowledgeProposal({
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "linksites.outreach",
      run_outputs: [{ ref: "audit://event-1", summary: "Outreach draft audit" }],
    });

    expect(proposal.status).toBe("pending");

    const accepted = reviewKnowledgeProposal({
      proposal_id: proposal.proposal_id,
      decision: "accept",
      reviewed_by: "principal@linktrend.media",
    });

    const companyRecord = buildCompanyKnowledgeRecord(accepted);
    expect(companyRecord.knowledge_ref).toContain("brain://company/linksites/knowledge/");

    const world = anonymizeKnowledgeForWorldBrain(companyRecord);
    expect(world.confidentiality_proof.policy).toBe("linkguard.world_brain.v1");
    expect(JSON.stringify(world.anonymized_payload)).not.toContain("tenant-1");

    const withWorld = attachWorldBrainContribution(accepted, world);
    expect(withWorld.world_brain_ref).toMatch(/^world:\/\//);
  });

  it("supports reject and edit decisions", () => {
    const proposal = buildKnowledgeProposal({
      tenant_id: "tenant-1",
      run_id: "run-2",
      stage_id: "linksites.qualification",
      zulip_thread_refs: [{ stream: "linksites", topic: "qualification" }],
    });

    const rejected = reviewKnowledgeProposal({
      proposal_id: proposal.proposal_id,
      decision: "reject",
      reviewed_by: "tenant_admin",
    });
    expect(rejected.status).toBe("rejected");

    const proposal2 = buildKnowledgeProposal({
      tenant_id: "tenant-1",
      run_id: "run-3",
      stage_id: "linksites.build",
      run_outputs: [{ ref: "bundle://1", summary: "Build bundle" }],
    });

    const edited = reviewKnowledgeProposal({
      proposal_id: proposal2.proposal_id,
      decision: "edit",
      reviewed_by: "principal@linktrend.media",
      edited_body: "# Edited lesson\n\nOperator refined copy.",
    });
    expect(edited.status).toBe("edited");
    expect(edited.body).toContain("Edited lesson");
  });
});
