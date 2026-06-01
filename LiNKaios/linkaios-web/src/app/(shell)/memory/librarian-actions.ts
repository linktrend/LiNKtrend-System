"use server";

import {
  attachWorldBrainContribution,
  anonymizeKnowledgeForWorldBrain,
  buildCompanyKnowledgeRecord,
  getKnowledgeProposal,
  reviewKnowledgeProposal,
  type KnowledgeReviewDecision,
} from "../../../../../../LiNKbrain/librarian/knowledge-loop";
import { evaluateWorldBrainContribution } from "../../../../../../LiNKguard/sidecar/linkguard/src/world-brain-confidentiality";
import { revalidatePath } from "next/cache";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requirePrincipalOrAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const email = user.email ?? undefined;
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email });
  if (!canWriteCommandCentre(role)) {
    return { error: "Command-centre role is read-only for librarian review." };
  }
  return { user, role, error: null as string | null };
}

/** Principal or tenant admin path: accept, reject, or edit a librarian knowledge proposal (LTS-021). */
export async function reviewLibrarianKnowledgeProposalAction(params: {
  proposalId: string;
  decision: KnowledgeReviewDecision;
  editedBody?: string;
}): Promise<{ ok: boolean; error?: string; knowledge_ref?: string; world_brain_ref?: string }> {
  const gate = await requirePrincipalOrAdmin();
  if (gate.error || !gate.user) {
    return { ok: false, error: gate.error ?? "unauthorized" };
  }

  const existing = getKnowledgeProposal(params.proposalId);
  if (!existing) {
    return { ok: false, error: "Knowledge proposal not found." };
  }

  if (params.decision === "reject") {
    reviewKnowledgeProposal({
      proposal_id: params.proposalId,
      decision: "reject",
      reviewed_by: gate.user.email ?? gate.user.id,
    });
    revalidatePath("/memory");
    return { ok: true };
  }

  const reviewed = reviewKnowledgeProposal({
    proposal_id: params.proposalId,
    decision: params.decision,
    reviewed_by: gate.user.email ?? gate.user.id,
    edited_body: params.editedBody,
  });

  const companyRecord = buildCompanyKnowledgeRecord(reviewed);
  const guardCheck = evaluateWorldBrainContribution(companyRecord.payload);
  if (!guardCheck.allowed) {
    return { ok: false, error: guardCheck.reason };
  }

  const world = anonymizeKnowledgeForWorldBrain(companyRecord);
  attachWorldBrainContribution(reviewed, world);

  revalidatePath("/memory");
  return {
    ok: true,
    knowledge_ref: reviewed.knowledge_ref,
    world_brain_ref: world.world_brain_ref,
  };
}
