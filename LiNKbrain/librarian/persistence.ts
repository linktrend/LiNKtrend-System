/**
 * Supabase persistence for Librarian knowledge loop (LTS-021).
 */

import {
  createBrainDraft,
  getOrCreateBrainVirtualFile,
  publishBrainVersion,
  replaceChunksForVersion,
  upsertBrainEmbedJobPending,
  type BrainFileVersionRow,
} from "../../packages/linklogic-sdk/dist/index.js";

type SupabaseClient = Parameters<typeof createBrainDraft>[0];

import {
  anonymizeKnowledgeForWorldBrain,
  buildCompanyKnowledgeRecord,
  buildKnowledgeProposal,
  type KnowledgeProposal,
  type KnowledgeReviewDecision,
  type LibrarianIngestInput,
} from "./knowledge-loop";

export type { KnowledgeReviewDecision } from "./knowledge-loop";

export type ProposeLibrarianResult = {
  proposal: KnowledgeProposal;
  brain_file_version_id: string;
  proposed_audit_event_id: string | null;
};

export type FinalizeLibrarianResult = {
  proposal: KnowledgeProposal;
  knowledge_ref?: string;
  world_brain_ref?: string;
  memory_object_id?: string;
  accepted_audit_event_id?: string;
};

function isLibrarianEnabled(): boolean {
  const v = process.env.LINKBRAIN_LIBRARIAN_ENABLED?.trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "no";
}

export function librarianCronEnabled(): boolean {
  return isLibrarianEnabled();
}

export async function proposeLibrarianKnowledge(
  client: SupabaseClient,
  input: LibrarianIngestInput,
  options?: { proposal_id?: string; now?: string },
): Promise<ProposeLibrarianResult> {
  const proposal = buildKnowledgeProposal(input, options);
  const logicalPath = `librarian/proposals/${proposal.proposal_id}.md`;

  const { data: file, error: fileErr } = await getOrCreateBrainVirtualFile(client, {
    scope: "company",
    logicalPath,
    missionId: input.project_id ?? null,
    fileKind: "librarian",
    memoryTags: {
      pattern: "linksites_run_lesson",
      useCase: input.stage_id,
    },
  });
  if (fileErr || !file) {
    throw fileErr ?? new Error("Failed to create librarian virtual file");
  }

  const { data: draft, error: draftErr } = await createBrainDraft(client, {
    fileId: file.id,
    body: proposal.body,
    createdBy: null,
  });
  if (draftErr || !draft) {
    throw draftErr ?? new Error("Failed to create librarian draft");
  }

  const provenance_refs = proposal.sources.map((s) => s.ref);
  const { data: auditId, error: auditErr } = await client.schema("linkbrain").rpc("record_mvo_audit_event", {
    p_tenant_id: input.tenant_id,
    p_event_type: "memory.proposed",
    p_actor_kind: "bot",
    p_actor_id: "librarian_bot",
    p_target_kind: "knowledge_proposal",
    p_target_id: proposal.proposal_id,
    p_payload: {
      memory_type: "linksites_accepted_knowledge",
      proposal_ref: proposal.proposal_id,
      provenance_refs,
      title: proposal.title,
      brain_file_version_id: draft.id,
    },
    p_run_id: input.run_id,
    p_stage_id: input.stage_id,
    p_project_id: input.project_id ?? null,
    p_actor_role_id: "librarian_bot",
    p_plane: "linkbrain",
  });
  if (auditErr) {
    throw new Error(auditErr.message);
  }

  const { error: upsertErr } = await client.schema("linkbrain").rpc("upsert_knowledge_proposal_row", {
    p_proposal_id: proposal.proposal_id,
    p_tenant_id: input.tenant_id,
    p_run_id: input.run_id,
    p_stage_id: input.stage_id,
    p_project_id: input.project_id ?? null,
    p_title: proposal.title,
    p_body: proposal.body,
    p_sources: proposal.sources,
    p_brain_file_version_id: draft.id,
    p_proposed_audit_event_id: auditId ?? null,
  });
  if (upsertErr) {
    throw new Error(upsertErr.message);
  }

  return {
    proposal,
    brain_file_version_id: draft.id,
    proposed_audit_event_id: (auditId as string | null) ?? null,
  };
}

export async function getKnowledgeProposalFromDb(
  client: SupabaseClient,
  proposalId: string,
): Promise<KnowledgeProposal | null> {
  const { data, error } = await client
    .schema("linkbrain")
    .from("knowledge_proposals")
    .select("*")
    .eq("proposal_id", proposalId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    proposal_id: String(row.proposal_id),
    tenant_id: String(row.tenant_id),
    run_id: String(row.run_id),
    stage_id: String(row.stage_id),
    project_id: row.project_id ? String(row.project_id) : undefined,
    title: String(row.title),
    body: String(row.body),
    sources: (row.sources as KnowledgeProposal["sources"]) ?? [],
    status: row.status as KnowledgeProposal["status"],
    created_at: String(row.created_at),
    reviewed_at: row.reviewed_at ? String(row.reviewed_at) : undefined,
    reviewed_by: row.reviewed_by ? String(row.reviewed_by) : undefined,
    knowledge_ref: row.knowledge_ref ? String(row.knowledge_ref) : undefined,
    world_brain_ref: row.world_brain_ref ? String(row.world_brain_ref) : undefined,
  };
}

export async function getKnowledgeProposalByVersionId(
  client: SupabaseClient,
  versionId: string,
): Promise<KnowledgeProposal | null> {
  const { data, error } = await client
    .schema("linkbrain")
    .from("knowledge_proposals")
    .select("*")
    .eq("brain_file_version_id", versionId)
    .maybeSingle();
  if (error || !data) return null;
  return getKnowledgeProposalFromDb(client, String((data as { proposal_id: string }).proposal_id));
}

export async function finalizeLibrarianKnowledgeProposal(
  client: SupabaseClient,
  params: {
    proposalId: string;
    decision: KnowledgeReviewDecision;
    reviewedBy: string;
    editedBody?: string;
    guardCheck: (payload: Record<string, unknown>) => { allowed: boolean; reason?: string };
  },
): Promise<FinalizeLibrarianResult> {
  const existing = await getKnowledgeProposalFromDb(client, params.proposalId);
  if (!existing) {
    throw new Error(`Unknown knowledge proposal: ${params.proposalId}`);
  }
  if (existing.status !== "pending" && existing.status !== "edited") {
    throw new Error(`Proposal ${params.proposalId} is already ${existing.status}`);
  }

  if (params.decision === "reject") {
    const { data: row, error } = await client.schema("linkbrain").rpc("finalize_knowledge_proposal", {
      p_proposal_id: params.proposalId,
      p_decision: "reject",
      p_reviewed_by: params.reviewedBy,
    });
    if (error) throw new Error(error.message);
    const rejected = row as Record<string, unknown>;
    return {
      proposal: {
        ...existing,
        status: "rejected",
        reviewed_at: String(rejected.reviewed_at),
        reviewed_by: params.reviewedBy,
      },
    };
  }

  const body =
    params.decision === "edit" && params.editedBody?.trim()
      ? params.editedBody.trim()
      : existing.body;
  const knowledge_ref = `brain://company/linksites/knowledge/${existing.proposal_id}`;

  const { data: proposalRow } = await client
    .schema("linkbrain")
    .from("knowledge_proposals")
    .select("brain_file_version_id, run_id, tenant_id, stage_id, sources")
    .eq("proposal_id", params.proposalId)
    .single();

  const versionId = (proposalRow as { brain_file_version_id?: string } | null)?.brain_file_version_id;
  if (!versionId) {
    throw new Error("Librarian proposal missing brain_file_version_id");
  }

  const companyPayload = {
    body,
    sources: existing.sources,
    proposal_id: existing.proposal_id,
    project_id: existing.project_id ?? null,
  };
  const guard = params.guardCheck(companyPayload);
  if (!guard.allowed) {
    throw new Error(guard.reason ?? "World brain confidentiality check failed");
  }

  const { error: pubErr } = await publishBrainVersion(client, versionId);
  if (pubErr) {
    throw new Error(pubErr.message);
  }

  const { data: pubVer } = await client
    .schema("linkaios")
    .from("brain_file_versions")
    .select("id, body")
    .eq("id", versionId)
    .single();
  const published = pubVer as BrainFileVersionRow | null;
  if (published?.body) {
    await replaceChunksForVersion(client, versionId, published.body);
    await upsertBrainEmbedJobPending(client, versionId);
  }

  const companyRecord = buildCompanyKnowledgeRecord({
    ...existing,
    body,
    status: params.decision === "edit" ? "edited" : "accepted",
    reviewed_at: new Date().toISOString(),
    reviewed_by: params.reviewedBy,
    knowledge_ref,
  });

  const world = anonymizeKnowledgeForWorldBrain(companyRecord);

  const provenance_refs = existing.sources.map((s) => s.ref);
  const { data: memoryId, error: memErr } = await client.schema("linkbrain").rpc("record_mvo_memory_object", {
    p_tenant_id: existing.tenant_id,
    p_memory_type: "linksites_accepted_knowledge",
    p_summary: existing.title,
    p_payload: companyPayload,
    p_run_id: existing.run_id,
    p_stage_id: existing.stage_id,
    p_knowledge_ref: knowledge_ref,
    p_accepted_by: params.reviewedBy,
    p_provenance_refs: provenance_refs,
    p_source_event_id: null,
  });
  if (memErr) {
    throw new Error(memErr.message);
  }

  const { data: acceptedAuditId, error: acceptedAuditErr } = await client.schema("linkbrain").rpc(
    "record_mvo_audit_event",
    {
      p_tenant_id: existing.tenant_id,
      p_event_type: "memory.accepted",
      p_actor_kind: "system",
      p_actor_id: "linkbrain.librarian",
      p_target_kind: "memory_object",
      p_target_id: String(memoryId),
      p_payload: {
        memory_type: "linksites_accepted_knowledge",
        accepted_ref: knowledge_ref,
        accepted_by: params.reviewedBy,
        provenance_refs,
        world_brain_ref: world.world_brain_ref,
        confidentiality_proof: world.confidentiality_proof,
      },
      p_run_id: existing.run_id,
      p_stage_id: existing.stage_id,
      p_plane: "linkbrain",
    },
  );
  if (acceptedAuditErr) {
    throw new Error(acceptedAuditErr.message);
  }

  const { data: finalized, error: finErr } = await client.schema("linkbrain").rpc("finalize_knowledge_proposal", {
    p_proposal_id: params.proposalId,
    p_decision: params.decision,
    p_reviewed_by: params.reviewedBy,
    p_edited_body: params.editedBody ?? null,
    p_knowledge_ref: knowledge_ref,
    p_world_brain_ref: world.world_brain_ref,
    p_accepted_audit_event_id: acceptedAuditId ?? null,
    p_memory_object_id: memoryId ?? null,
  });
  if (finErr) {
    throw new Error(finErr.message);
  }

  const row = finalized as Record<string, unknown>;
  return {
    proposal: {
      ...existing,
      body,
      status: params.decision === "edit" ? "edited" : "accepted",
      reviewed_at: String(row.reviewed_at),
      reviewed_by: params.reviewedBy,
      knowledge_ref,
      world_brain_ref: world.world_brain_ref,
    },
    knowledge_ref,
    world_brain_ref: world.world_brain_ref,
    memory_object_id: memoryId ? String(memoryId) : undefined,
    accepted_audit_event_id: acceptedAuditId ? String(acceptedAuditId) : undefined,
  };
}

export type PendingLibrarianRun = {
  run_id: string;
  project_id: string | null;
  completed_at: string;
};

export async function listRunsPendingLibrarianIngest(
  client: SupabaseClient,
  tenantId: string,
  limit = 20,
): Promise<PendingLibrarianRun[]> {
  const { data, error } = await client.schema("linkbrain").rpc("list_runs_pending_librarian_ingest", {
    p_tenant_id: tenantId,
    p_limit: limit,
  });
  if (error) {
    throw new Error(error.message);
  }
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    run_id: String(r.run_id),
    project_id: r.project_id ? String(r.project_id) : null,
    completed_at: String(r.completed_at),
  }));
}
