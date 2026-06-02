"use server";

import { evaluateWorldBrainContribution } from "../../../../../../LiNKguard/sidecar/linkguard/src/world-brain-confidentiality";
import {
  finalizeLibrarianKnowledgeProposal,
  getKnowledgeProposalByVersionId,
  getKnowledgeProposalFromDb,
  type KnowledgeReviewDecision,
} from "../../../../../../LiNKbrain/librarian/persistence";
import { revalidatePath } from "next/cache";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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

  const admin = getSupabaseAdmin();
  const existing = await getKnowledgeProposalFromDb(admin, params.proposalId);
  if (!existing) {
    return { ok: false, error: "Knowledge proposal not found." };
  }

  try {
    const result = await finalizeLibrarianKnowledgeProposal(admin, {
      proposalId: params.proposalId,
      decision: params.decision,
      reviewedBy: gate.user.email ?? gate.user.id,
      editedBody: params.editedBody,
      guardCheck: (payload) => evaluateWorldBrainContribution(payload),
    });

    revalidatePath("/memory");
    return {
      ok: true,
      knowledge_ref: result.knowledge_ref,
      world_brain_ref: result.world_brain_ref,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Librarian review failed";
    return { ok: false, error: message };
  }
}

/** Inbox approve path: resolve proposal from brain draft version id. */
export async function reviewLibrarianKnowledgeProposalByVersionAction(params: {
  versionId: string;
  decision: KnowledgeReviewDecision;
  editedBody?: string;
}): Promise<{ ok: boolean; error?: string; knowledge_ref?: string; world_brain_ref?: string }> {
  const admin = getSupabaseAdmin();
  const proposal = await getKnowledgeProposalByVersionId(admin, params.versionId);
  if (!proposal) {
    return { ok: false, error: "No librarian proposal linked to this inbox item." };
  }
  return reviewLibrarianKnowledgeProposalAction({
    proposalId: proposal.proposal_id,
    decision: params.decision,
    editedBody: params.editedBody,
  });
}
