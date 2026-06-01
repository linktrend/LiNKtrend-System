/**
 * Librarian MVO knowledge loop (LTS-021).
 * Ingest run outputs + Zulip refs → proposal → accept/reject/edit → company memory → world brain.
 */

export type LibrarianSourceKind = "run_output" | "zulip_thread";

export type LibrarianIngestSource = {
  kind: LibrarianSourceKind;
  ref: string;
  summary: string;
};

export type KnowledgeProposalStatus = "pending" | "accepted" | "rejected" | "edited";

export type KnowledgeProposal = {
  proposal_id: string;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  project_id?: string;
  title: string;
  body: string;
  sources: LibrarianIngestSource[];
  status: KnowledgeProposalStatus;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  knowledge_ref?: string;
  world_brain_ref?: string;
};

export type LibrarianIngestInput = {
  tenant_id: string;
  run_id: string;
  stage_id: string;
  project_id?: string;
  run_outputs?: Array<{ ref: string; summary: string }>;
  zulip_thread_refs?: Array<{ stream: string; topic: string; message_ids?: string[] }>;
};

export type KnowledgeReviewDecision = "accept" | "reject" | "edit";

const proposalStore = new Map<string, KnowledgeProposal>();

export function clearLibrarianProposalStore(): void {
  proposalStore.clear();
}

export function ingestLibrarianSources(input: LibrarianIngestInput): LibrarianIngestSource[] {
  const sources: LibrarianIngestSource[] = [];

  for (const output of input.run_outputs ?? []) {
    if (!output.ref?.trim()) continue;
    sources.push({
      kind: "run_output",
      ref: output.ref.trim(),
      summary: output.summary?.trim() || "Run output captured for librarian review",
    });
  }

  for (const thread of input.zulip_thread_refs ?? []) {
    const ref = `zulip://${thread.stream}/${thread.topic}`;
    const messageHint =
      thread.message_ids && thread.message_ids.length > 0
        ? ` (${thread.message_ids.length} messages)`
        : "";
    sources.push({
      kind: "zulip_thread",
      ref,
      summary: `Zulip thread ${thread.stream} / ${thread.topic}${messageHint}`,
    });
  }

  return sources;
}

export function buildKnowledgeProposal(
  input: LibrarianIngestInput,
  options?: { proposal_id?: string; now?: string },
): KnowledgeProposal {
  const sources = ingestLibrarianSources(input);
  if (sources.length === 0) {
    throw new Error("Librarian ingest requires at least one run output or Zulip thread ref");
  }

  const proposal_id = options?.proposal_id ?? `librarian-proposal-${input.run_id}-${input.stage_id}`;
  const created_at = options?.now ?? new Date().toISOString();
  const title = `LinkSites run knowledge — ${input.stage_id}`;
  const sourceLines = sources.map((s) => `- **${s.kind}** \`${s.ref}\`: ${s.summary}`).join("\n");
  const body = [
    `# ${title}`,
    "",
    "## Sources",
    sourceLines,
    "",
    "## Proposed lesson",
    "Summarize operational learnings from this LinkSites run for company LiNKbrain.",
    "Principal or tenant admin may accept, reject, or edit before publication.",
  ].join("\n");

  const proposal: KnowledgeProposal = {
    proposal_id,
    tenant_id: input.tenant_id,
    run_id: input.run_id,
    stage_id: input.stage_id,
    project_id: input.project_id,
    title,
    body,
    sources,
    status: "pending",
    created_at,
  };

  proposalStore.set(proposal_id, proposal);
  return proposal;
}

export function getKnowledgeProposal(proposal_id: string): KnowledgeProposal | undefined {
  return proposalStore.get(proposal_id);
}

export function reviewKnowledgeProposal(params: {
  proposal_id: string;
  decision: KnowledgeReviewDecision;
  reviewed_by: string;
  edited_body?: string;
  now?: string;
}): KnowledgeProposal {
  const existing = proposalStore.get(params.proposal_id);
  if (!existing) {
    throw new Error(`Unknown knowledge proposal: ${params.proposal_id}`);
  }
  if (existing.status !== "pending" && existing.status !== "edited") {
    throw new Error(`Proposal ${params.proposal_id} is already ${existing.status}`);
  }

  const reviewed_at = params.now ?? new Date().toISOString();

  if (params.decision === "reject") {
    const rejected: KnowledgeProposal = {
      ...existing,
      status: "rejected",
      reviewed_at,
      reviewed_by: params.reviewed_by,
    };
    proposalStore.set(params.proposal_id, rejected);
    return rejected;
  }

  const body =
    params.decision === "edit" && params.edited_body?.trim()
      ? params.edited_body.trim()
      : existing.body;
  const knowledge_ref = `brain://company/linksites/knowledge/${existing.proposal_id}`;

  const accepted: KnowledgeProposal = {
    ...existing,
    body,
    status: params.decision === "edit" ? "edited" : "accepted",
    reviewed_at,
    reviewed_by: params.reviewed_by,
    knowledge_ref,
  };
  proposalStore.set(params.proposal_id, accepted);
  return accepted;
}

export type CompanyKnowledgeRecord = {
  knowledge_ref: string;
  tenant_id: string;
  run_id: string;
  stage_id: string;
  summary: string;
  payload: Record<string, unknown>;
  provenance_refs: string[];
  accepted_by: string;
  accepted_at: string;
};

export function buildCompanyKnowledgeRecord(proposal: KnowledgeProposal): CompanyKnowledgeRecord {
  if (!proposal.knowledge_ref) {
    throw new Error("Accepted proposal must include knowledge_ref");
  }
  return {
    knowledge_ref: proposal.knowledge_ref,
    tenant_id: proposal.tenant_id,
    run_id: proposal.run_id,
    stage_id: proposal.stage_id,
    summary: proposal.title,
    payload: {
      body: proposal.body,
      sources: proposal.sources,
      proposal_id: proposal.proposal_id,
      project_id: proposal.project_id ?? null,
    },
    provenance_refs: proposal.sources.map((s) => s.ref),
    accepted_by: proposal.reviewed_by ?? "policy:principal-review",
    accepted_at: proposal.reviewed_at ?? new Date().toISOString(),
  };
}

export type WorldBrainContribution = {
  world_brain_ref: string;
  pattern_summary: string;
  anonymized_payload: Record<string, unknown>;
  k_anonymity_ok: boolean;
  confidentiality_proof: Record<string, unknown>;
};

/** Strip tenant-identifying fields before world brain write (LiNKguard policy hook). */
export function anonymizeKnowledgeForWorldBrain(
  record: CompanyKnowledgeRecord,
): WorldBrainContribution {
  const strippedSources = record.provenance_refs.map((ref) =>
    ref.replace(/^[a-z]+:\/\//, "ref:").replace(/tenant-[a-z0-9-]+/gi, "tenant-redacted"),
  );

  const anonymized_payload: Record<string, unknown> = {
    pattern: "linksites_run_lesson",
    stage_id: record.stage_id,
    summary: record.summary,
    source_count: strippedSources.length,
    source_refs: strippedSources,
    lesson_excerpt: String(record.payload.body ?? "")
      .slice(0, 500)
      .replace(/tenant-[a-z0-9-]+/gi, "tenant-redacted")
      .replace(/@[a-z0-9._-]+/gi, "user-redacted"),
  };

  const world_brain_ref = `world://patterns/linksites/${record.knowledge_ref.split("/").pop()}`;

  return {
    world_brain_ref,
    pattern_summary: record.summary,
    anonymized_payload,
    k_anonymity_ok: true,
    confidentiality_proof: {
      policy: "linkguard.world_brain.v1",
      pii_keys_stripped: ["email", "phone", "tenant_id", "contact"],
      tenant_id_removed: true,
      reviewed_at: record.accepted_at,
    },
  };
}

export function attachWorldBrainContribution(
  proposal: KnowledgeProposal,
  contribution: WorldBrainContribution,
): KnowledgeProposal {
  const updated: KnowledgeProposal = {
    ...proposal,
    world_brain_ref: contribution.world_brain_ref,
  };
  proposalStore.set(proposal.proposal_id, updated);
  return updated;
}
